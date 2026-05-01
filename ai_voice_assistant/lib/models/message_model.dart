/// File: lib/models/message.dart
class Message {
  final String sender; // 'user' or 'assistant'
  final String text;

  Message({required this.sender, required this.text});
}
