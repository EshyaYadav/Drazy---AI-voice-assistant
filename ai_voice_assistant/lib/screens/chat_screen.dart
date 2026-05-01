import 'package:ai_voice_assistant/services/text_to_speech.dart';
import 'package:ai_voice_assistant/services/voice_assistance_service.dart';
import 'package:ai_voice_assistant/widgets/chat_message.dart';
import 'package:ai_voice_assistant/widgets/history_menu.dart';
import 'package:ai_voice_assistant/widgets/typing_indicator.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;

import 'package:lottie/lottie.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  List<ChatMessage> messages = [];
  bool isListening = false;
  bool isThinking = false;
  bool showChatInterface = false;
  late AnimationController _pulseController;
  late AnimationController _transitionController;
  late AnimationController _floatingController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _transitionAnimation;
  late Animation<double> _floatingAnimation;
  final assistant = VoiceAssistantService();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeChat();
  }

  void _initializeAnimations() {
    // Pulse animation for mic button
    _pulseController = AnimationController(
      duration: Duration(milliseconds: 1000),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Transition animation from greeting to chat
    _transitionController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );
    _transitionAnimation = CurvedAnimation(
      parent: _transitionController,
      curve: Curves.easeInOutCubic,
    );

    // Floating animation for greeting elements
    _floatingController = AnimationController(
      duration: Duration(milliseconds: 3000),
      vsync: this,
    );
    _floatingAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    // Start floating animation
    _floatingController.repeat(reverse: true);
  }

  void _initializeChat() {
    // Initial greeting message
    messages.add(
      ChatMessage(
        text: "Hello! I'm your voice AI assistant. How can I help you today?",
        isUser: false,
        timestamp: DateTime.now(),
        '',
      ),
    );

    // Speak greeting after a short delay
    Future.delayed(Duration(milliseconds: 1500), () {
      TextToSpeech().speak(
        'Hello! I\'m your voice AI assistant. How can I help you today?',
      );
    });
  }

  void _refreshChat() {
    // Stop any ongoing operations
    _stopListening();

    // Only clear messages and reset relevant states
    setState(() {
      messages.clear();
      isListening = false;
      isThinking = false;
      isLoading = false;
    });

    // Add fresh greeting message
    setState(() {
      messages.add(
        ChatMessage(
          text: "Hello! I'm your voice AI assistant. How can I help you today?",
          isUser: false,
          timestamp: DateTime.now(),
          '',
        ),
      );
    });

    // Show feedback
    HapticFeedback.mediumImpact();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _transitionController.dispose();
    _floatingController.dispose();
    super.dispose();
  }

  void _toggleListening() async {
    setState(() {
      isListening = !isListening;
    });

    if (isListening) {
      _pulseController.repeat(reverse: true);
      HapticFeedback.lightImpact();

      // Transition to chat interface if not already shown
      if (!showChatInterface) {
        setState(() => showChatInterface = true);
        _transitionController.forward();
      }

      await _handleVoiceFlow();
      _stopListening();
    } else {
      _stopListening();
    }
  }

  void _stopListening() {
    setState(() {
      isListening = false;
    });
    _pulseController.stop();
    _pulseController.reset();
  }

  Future<void> _handleVoiceFlow() async {
    setState(() {
      isThinking = true;
    });

    debugPrint('listening to user');
    final userText = await assistant.listenToUser();
    if (userText.isEmpty) {
      debugPrint('nothing received');
      setState(() => isThinking = false);
      return;
    }

    setState(() {
      messages.add(
        ChatMessage(
          text: userText,
          isUser: true,
          timestamp: DateTime.now(),
          '',
        ),
      );
    });

    final decision = await assistant.checkIfImageRequired(userText);
    if (decision == 'yes') {
      final imageUrl = await assistant.generateImageFromDalle(userText);
      setState(() {
        messages.add(
          ChatMessage(
            text: "Here is your image:",
            isUser: false,
            timestamp: DateTime.now(),
            imageUrl,
          ),
        );
      });
      await assistant.speak("Here is the image I created for you");
    } else {
      final response = await assistant.getChatGptResponse(userText);
      setState(() {
        messages.add(
          ChatMessage(
            text: response,
            isUser: false,
            timestamp: DateTime.now(),
            '',
          ),
        );
      });
      await assistant.speak(response);
    }

    setState(() {
      isThinking = false;
    });
  }

  void _showHistoryMenu() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: Colors.black54,
      transitionDuration: Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return SlideTransition(
          position: Tween<Offset>(begin: Offset(-1.0, 0.0), end: Offset.zero)
              .animate(
                CurvedAnimation(parent: animation, curve: Curves.easeInOut),
              ),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: kIsWeb ? 400 : MediaQuery.of(context).size.width * 0.8,
                height: MediaQuery.of(context).size.height,
                child: HistoryMenu(),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildGreetingScreen() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1a1a2e),
            Color(0xFF16213e),
            Color(0xFF0f3460),
            Color(0xFF533483),
            Color(0xFF7209b7),
            Color(0xFF9d4edd),
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: Icon(Icons.history, color: Colors.white70, size: 28),
                    onPressed: _showHistoryMenu,
                  ),
                  Text(
                    'AI Assistant',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 20,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          Icons.settings,
                          color: Colors.white70,
                          size: 28,
                        ),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // AI Robot GIF with floating animation
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Glow behind
                      Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.purpleAccent.withOpacity(0.2),
                              blurRadius: 100,
                              spreadRadius: 20,
                            ),
                          ],
                        ),
                      ),
                      // Floating animated Lottie
                      AnimatedBuilder(
                        animation: _floatingAnimation,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(
                              0,
                              math.sin(_floatingAnimation.value * 2 * math.pi) *
                                  12,
                            ),
                            child: Lottie.asset(
                              'assets/lotties/ai_bot.json',
                              width: 280,
                              height: 280,
                              fit: BoxFit.contain,
                              repeat: true,
                            ),
                          );
                        },
                      ),
                    ],
                  ),

                  // Welcome text with glassmorphism
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 40),
                    padding: EdgeInsets.all(30),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(25),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.2),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Color(0xFF9d4edd).withOpacity(0.2),
                          blurRadius: 25,
                          offset: Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text(
                          'Welcome to AI Assistant',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Your intelligent voice companion ready to help with anything you need. Tap the microphone to start our conversation.',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 16,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 30),

                  // Enhanced mic button
                  GestureDetector(
                    onTap: _toggleListening,
                    child: AnimatedBuilder(
                      animation: _pulseAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: isListening ? _pulseAnimation.value : 1.0,
                          child: Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: isListening
                                    ? [Color(0xFFFF6B6B), Color(0xFFFF8E8E)]
                                    : [
                                        Colors.white,
                                        Colors.white.withOpacity(0.9),
                                      ],
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      (isListening
                                              ? Color(0xFFFF6B6B)
                                              : Color(0xFF9d4edd))
                                          .withOpacity(0.5),
                                  blurRadius: 30,
                                  offset: Offset(0, 15),
                                ),
                              ],
                            ),
                            child: Icon(
                              isListening ? Icons.stop : Icons.mic,
                              color: isListening
                                  ? Colors.white
                                  : Color(0xFF1a1a2e),
                              size: 36,
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  SizedBox(height: 20),

                  Text(
                    isListening ? 'Listening...' : 'Tap to speak',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatInterface() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1a1a2e),
            Color(0xFF16213e),
            Color(0xFF0f3460),
            Color(0xFF533483),
          ],
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.history, color: Colors.white70, size: 28),
            onPressed: _showHistoryMenu,
          ),
          title: Text(
            'AI Assistant',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 20,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: Icon(Icons.refresh, color: Colors.white70, size: 28),
              onPressed: _refreshChat,
              tooltip: 'Refresh Chat',
            ),
            IconButton(
              icon: Icon(Icons.settings, color: Colors.white70, size: 28),
              onPressed: () {},
            ),
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: kIsWeb ? 120 : 0,
                ),
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(25),
                      topRight: Radius.circular(25),
                    ),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child: ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: messages.length + (isThinking ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == messages.length && isThinking) {
                        return TypingIndicator();
                      }
                      return ChatBubble(message: messages[index]);
                    },
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: kIsWeb ? 120 : 0),
              child: Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(25),
                    topRight: Radius.circular(25),
                  ),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0xFF9d4edd).withOpacity(0.2),
                      blurRadius: 25,
                      offset: Offset(0, -10),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            isListening ? 'Listening...' : 'Tap to speak',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 16),
                      GestureDetector(
                        onTap: _toggleListening,
                        child: AnimatedBuilder(
                          animation: _pulseAnimation,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: isListening ? _pulseAnimation.value : 1.0,
                              child: Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: isListening
                                        ? [Color(0xFFFF6B6B), Color(0xFFFF8E8E)]
                                        : [
                                            Color(0xFF9d4edd),
                                            Color(0xFF7209b7),
                                          ],
                                  ),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color:
                                          (isListening
                                                  ? Color(0xFFFF6B6B)
                                                  : Color(0xFF9d4edd))
                                              .withOpacity(0.4),
                                      blurRadius: 20,
                                      offset: Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  isListening ? Icons.stop : Icons.mic,
                                  color: Colors.white,
                                  size: 28,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: _transitionAnimation,
        builder: (context, child) {
          if (!showChatInterface) {
            return _buildGreetingScreen();
          }

          return Scaffold(
            body: Stack(
              children: [
                _buildChatInterface(),
                if (_transitionAnimation.value < 1)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white.withOpacity(
                        1 - _transitionAnimation.value,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
