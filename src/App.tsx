import { useState } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import ChatScreen from './screens/ChatScreen';
import './App.css';

type Screen = 'welcome' | 'chat';

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  return (
    <div className="app-root">
      {screen === 'welcome' ? (
        <WelcomeScreen onGetStarted={() => setScreen('chat')} />
      ) : (
        <ChatScreen />
      )}
    </div>
  );
}

export default App;
