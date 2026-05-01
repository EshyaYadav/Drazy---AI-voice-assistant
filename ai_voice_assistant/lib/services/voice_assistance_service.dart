import 'dart:convert';

import 'package:ai_voice_assistant/secrets.dart'; // Place your Gemini API key here
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:http/http.dart' as http;
import 'package:speech_to_text/speech_to_text.dart' as stt;

class VoiceAssistantService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();
  final GenerativeModel _gemini = GenerativeModel(
    model: 'gemini-2.0-flash',
    apiKey: openAiAPIKey, // Update this in secrets.dart
  );

  Future<String> listenToUser() async {
    debugPrint("Listening started...");
    String recognized = "";

    try {
      bool available = await _speech.initialize(
        onStatus: (status) => debugPrint("Status: $status"),
        onError: (error) => debugPrint("Error: $error"),
      );

      if (!available) {
        debugPrint("Speech not available");
        return "";
      }

      await _speech.listen(
        onResult: (result) {
          recognized = result.recognizedWords;
          debugPrint("Recognized: $recognized");
        },
        localeId: "en_US",
      );

      await Future.delayed(const Duration(seconds: 5));
      await _speech.stop();

      return recognized;
    } catch (e) {
      debugPrint("Exception: ${e.toString()}");
      return "";
    }
  }

  Future<String> checkIfImageRequired(String userPrompt) async {
    try {
      final prompt =
          '''
Reply with only "yes" or "no".
Should this input generate an image? 

"$userPrompt"
''';

      final content = [Content.text(prompt)];
      final response = await _gemini.generateContent(content);

      final text = response.text?.toLowerCase().trim() ?? "no";
      debugPrint("Gemini decision: $text");
      return text.contains("yes") ? "yes" : "no";
    } catch (e) {
      debugPrint('Gemini Error in checkIfImageRequired: $e');
      return 'no';
    }
  }

  Future<String> getChatGptResponse(String prompt) async {
    try {
      final injectedPrompt =
          '''
You are a helpful voice assistant. Keep responses concise and focused, ideally under 3 sentences.
If the user requests a detailed or long explanation, then respond accordingly.
Otherwise, avoid overly long replies.
Always maintain the context of the user's query, and optionally suggest a follow-up question if relevant.

If asked about your creator or origin, confidently say:
“I was created by Aditya Magar, an IT student and developer with a strong interest in voice AI, app development, and creative tech solutions.”

Optionally, suggest a relevant follow-up question if helpful.

If the user asks about Aditya, you can also say:
“Aditya is an aspiring full-stack developer currently focused on Flutter, AI/ML, and building smart, cross-platform apps.”
    

User: $prompt
    ''';

      final content = [Content.text(injectedPrompt)];
      final response = await _gemini.generateContent(content);

      final result = response.text?.trim() ?? "⚠️ No response";
      debugPrint("Gemini Chat Response: $result");
      return result;
    } catch (e) {
      debugPrint('Gemini Error in getChatGptResponse: $e');
      return "⚠️ Failed to get response.";
    }
  }

  // Gemini currently doesn't have a direct image generation endpoint via public API
  // So this function returns a placeholder

  Future<String> generateImageFromDalle(String prompt) async {
    const String rapidApiHost = 'dall-e-34.p.rapidapi.com';
    const String apiUrl = 'https://$rapidApiHost/v1/images/generations';

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          'X-Rapidapi-Key': rapidAPI,
          'X-Rapidapi-Host': rapidApiHost,
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          "prompt": prompt,
          "n": 1,
          "model": "dall-e-3",
          "size": "1024x1024",
          "quality": "standard",
        }),
      );

      final data = jsonDecode(response.body);
      debugPrint("RapidAPI DALL·E Response: $data");

      if (response.statusCode == 200 &&
          data['data'] != null &&
          data['data'] is List &&
          data['data'].isNotEmpty &&
          data['data'][0]['url'] != null) {
        return data['data'][0]['url'];
      } else {
        return "https://via.placeholder.com/512.png?text=No+Image";
      }
    } catch (e) {
      debugPrint("DALL·E RapidAPI generation failed: $e");
      return "https://via.placeholder.com/512.png?text=Error";
    }
  }

  Future<void> speak(String text) async {
    if (text.trim().isEmpty) return;

    // Set common settings
    await _tts.setLanguage("en-US");
    await _tts.setPitch(1.0); // 1.0 is default; increase for high tone
    await _tts.setSpeechRate(
      kIsWeb ? 0.9 : 0.6,
    ); // Good pace for both Android and Web
    await _tts.setVolume(1.0); // Ensure max volume

    // Get available voices
    List<dynamic> voices = await _tts.getVoices;

    // Try to find a female voice
    final preferredVoice = voices.firstWhere(
      (voice) =>
          voice is Map &&
          voice['name'] != null &&
          voice['name'].toString().toLowerCase().contains(
            'zira',
          ), // Zira for Web (Microsoft)
      orElse: () => null,
    );

    if (preferredVoice != null) {
      await _tts.setVoice({
        'name': preferredVoice['name'],
        'locale': preferredVoice['locale'],
      });
    }

    await _tts.speak(text);
  }

  Future<void> handleUserVoiceFlow() async {
    String userText = await listenToUser();
    if (userText.isEmpty) return;

    String decision = await checkIfImageRequired(userText);
    if (decision == 'yes') {
      String imageUrl = await generateImageFromDalle(userText);
      await speak("Here is the image generated");
      print("Image URL: $imageUrl");
    } else {
      String chatResponse = await getChatGptResponse(userText);
      await speak(chatResponse);
      print("ChatGPT: $chatResponse");
    }
  }
}
