# 🎙️ AI Voice Assistant App with Gemini + DALL·E

A beautifully designed AI-powered **voice assistant app** built in **Flutter**, using:
- Google Gemini API for smart text responses  
- RapidAPI (DALL·E 3) for powerful image generation  
- Firebase Firestore for saving chat history  
- Plus, it speaks back to you via TTS!


🟢 Live Web Version: [Click here to try it!](https://ai-voice-assistant-igj9.onrender.com)  
📱 For Android: Clone the repo and run `main.dart` in VS Code or Android Studio.

---

## ✨ Features

- 🎤 **Voice Input** (via `speech_to_text`)
- 🤖 **Gemini-based Chatbot Assistant**
- 🖼️ **Text to image generation**, via **DALL·E via RapidAPI**
- 🔊 **Text-to-Speech** audio output
- 🌐 **Supports both Android & Web** (fully responsive)
- ☁️ **Firebase Firestore** chat history persistence

---

## 🧠 Tech Stack

| Layer         | Technology                       |
|---------------|-----------------------------------|
| Frontend UI   | Flutter (Dart)                    |
| AI Text       | Google Gemini API (`google_generative_ai`) |
| Image Gen     | DALL·E 3 via RapidAPI             |
| Voice Input   | `speech_to_text` package          |
| Voice Output  | `flutter_tts`                     |
| Database      | Firebase Firestore                |
| Animations    | `lottie`, `animated_builder`      |

---

## 📂 Folder Structure
```dart 
  lib/
  ├── main.dart
  ├── secrets.dart # Gemini & RapidAPI keys
  ├── services/
  │ └── voice_assistant_service.dart
  ├── screens/
  │ └── chat_screen.dart
  ├── widgets/
  │ ├── chat_message.dart
  │ ├── typing_indicator.dart
  │ └── history_menu.dart
  assets/
  ├── lotties/
  │ └── ai_bot.json
  ├── screenshots/
  │ ├── home.png
  │ ├── chat.png
  │ └── image.png
```
---

## 🖼️ App Screenshots

<table>
  <tr>
    <td><img src="https://i.postimg.cc/507x4Z6v/Screenshot-1752308949.png" width="250"/></td>
    <td><img src="https://i.postimg.cc/pr3R8zQL/Screenshot-1752308314.png" width="250"/></td>
     <td><img src="https://i.postimg.cc/vH6Qy2Mg/Screenshot-1752308931.png" width="250"/></td>
  </tr>
</table>

---

## 🔐 Configuration

### 1. secrets.dart

Create `lib/secrets.dart` and paste:

```dart
const String geminiApiKey = "YOUR_GEMINI_API_KEY";
const String rapidAPI = "YOUR_RAPID_API_KEY"; // from DALL·E 3 on RapidAPI

assets/
├── lotties/
│ └── ai_bot.json
├── screenshots/
│ ├── home.png
│ ├── chat.png
│ └── image.png
