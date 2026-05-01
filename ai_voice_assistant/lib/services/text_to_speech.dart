import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_tts/flutter_tts.dart';

class TextToSpeech {
  final FlutterTts _flutterTts = FlutterTts();

  TextToSpeech() {
    _initSettings();
  }

  Future<void> _initSettings() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(kIsWeb ? 0.9 : 0.6);
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);

    if (kIsWeb) {
      final voices = await _flutterTts.getVoices;

      // Log all voices (optional for debugging)
      for (final v in voices) {
        print("Available Voice: $v");
      }

      // Find a female voice with en-US
      final femaleVoice = voices.firstWhere(
        (v) =>
            v is Map &&
            v['locale'] == 'en-US' &&
            v['name'].toLowerCase().contains('female'),
        orElse: () => null,
      );

      if (femaleVoice != null) {
        await _flutterTts.setVoice(femaleVoice);
        print("✅ Female voice set: ${femaleVoice['name']}");
      } else {
        print("⚠️ No female en-US voice found on web.");
      }
    } else if (Platform.isAndroid || Platform.isIOS) {
      // Mobile-specific voice
      await _flutterTts.setVoice({
        'name': 'en-us-x-iol-local',
        'locale': 'en-US',
      });
    }
  }

  Future<void> speak(String text) async {
    await _flutterTts.stop();
    if (text.isNotEmpty) {
      await _flutterTts.speak(text);
    }
  }

  void dispose() {
    _flutterTts.stop();
  }
}
