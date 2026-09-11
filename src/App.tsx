import { useState } from 'react';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputBar } from './components/InputBar';
import type { Message } from './lib/types';
import { INITIAL_MESSAGES, QUICK_SUGGESTIONS } from './data/mockChat';
import { formatTime } from './lib/utils';

export function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: formatTime()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulated responsive agent reply
    setTimeout(() => {
      let botReply = "I understand. Let's focus on maintaining gentle range of motion without pushing into sharp pain. Have you noticed if this improves with rest, heat, or cold therapy?";
      let suggestedActions = [
        'Pendulum exercises',
        'Ice application guide',
        'Check pain scale'
      ];

      const lower = text.toLowerCase();
      if (lower.includes('stretch') || lower.includes('movement') || lower.includes('exercise')) {
        botReply = "Here are 3 foundational exercises recommended for shoulder recovery:\n1. 🔄 Pendulum Swings (Gentle circles, 30s each way)\n2. 🚪 Doorway Pectoral Stretch (Mild tension, hold 20s)\n3. 🏹 Isometric External Rotations against a wall.\n\nKeep movements pain-free (below 3/10 on pain scale).";
        suggestedActions = ['How often per day?', 'Pain scale guide', 'Next exercise'];
      } else if (lower.includes('pain') || lower.includes('rotator') || lower.includes('stiff')) {
        botReply = "For shoulder stiffness or rotator cuff discomfort:\n• Avoid aggressive overhead reaches for 24-48 hours.\n• Apply ice for 15-20 min if there is swelling or acute ache.\n• Apply moist warmth before gentle stretching if it feels locked up.\n\nDoes the discomfort disturb your sleep at night?";
        suggestedActions = ['Yes, hurts while sleeping', 'No, only when moving', 'Log daily symptoms'];
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botReply,
        timestamp: formatTime(),
        suggestedActions
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 750);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Mobile-first viewport container */}
      <main className="w-full max-w-md md:max-w-lg h-dvh flex flex-col bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Chat Header */}
        <Header onReset={handleReset} />

        {/* Message List Area */}
        <MessageList
          messages={messages}
          onSelectAction={handleSendMessage}
          isTyping={isTyping}
        />

        {/* Responsive Input Bar at Bottom */}
        <InputBar
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          suggestions={QUICK_SUGGESTIONS}
          onSelectSuggestion={handleSendMessage}
        />
      </main>
    </div>
  );
}

export default App;

