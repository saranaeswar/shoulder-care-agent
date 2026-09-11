import React, { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, RefreshCw, Volume2, VolumeX, AlertCircle, Mic, MicOff, Languages, X } from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '../lib/groqClient';
import { formatTime } from '../lib/utils';
import type { Message } from '../lib/types';

// Speech Recognition interface definitions for cross-browser Web Speech API support
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
    isFinal?: boolean;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

// Elderly-friendly quick questions in conversational Tanglish & English
const ELDER_QUICK_QUESTIONS: string[] = [
  'Enna exercise pannalam?',
  'Evlo naal aagum recover aaga?',
  'Doctor kitta poganuma?',
  'Vali romba irukku enna pannanum?',
  'Ice vaikkalama illa heat ah?'
];

const INITIAL_ELDER_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: "வணக்கம்! Hello! I am your Shoulder Care Assistant 🩺.\n\nI am here to give you gentle, safe guidance for shoulder pain, stiffness, and recovery exercises. No login needed.\n\nHow is your shoulder feeling today? You can type below, tap any quick question button, or tap the microphone to speak.",
    timestamp: formatTime()
  }
];

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_ELDER_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'ta-IN'>('en-IN');
  const [voiceNotice, setVoiceNotice] = useState<{ text: string; isError: boolean } | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isListening]);

  // Stop speech synthesis & speech recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Text to Speech for elderly users who prefer listening
  const handleToggleSpeech = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for elderly comprehension
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API voice input handler
  const handleToggleVoiceInput = () => {
    // Check browser support for SpeechRecognition or webkitSpeechRecognition
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    // Graceful fallback if Web Speech API is not supported in the user's browser
    if (!SpeechRecognitionClass) {
      setVoiceNotice({
        text: "Your browser does not support voice input. Please type your question using the keyboard instead. (உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. தட்டச்சு செய்யவும்)",
        isError: true
      });
      return;
    }

    // If currently listening, stop the recognition
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setVoiceNotice(null);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice({
          text: speechLang === 'ta-IN'
            ? "🎙️ தமிழில் கேட்கிறது (ta-IN)... தயவுசெய்து பேசுங்கள்."
            : "🎙️ Listening in English (en-IN)... Please speak now.",
          isError: false
        });
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const trimmedTranscript = transcript.trim();
        if (trimmedTranscript) {
          // Populates the input field so user can review and edit before sending (does not auto-send)
          setInput((prev) => (prev.trim() ? `${prev.trim()} ${trimmedTranscript}` : trimmedTranscript));
          setVoiceNotice({
            text: speechLang === 'ta-IN'
              ? "குரல் பதிவு செய்யப்பட்டது! சரிபார்த்து 'Send' அழுத்தவும்."
              : "Voice captured! Review your message below, then tap 'Send'.",
            isError: false
          });
        }
      };

      recognition.onerror = (event: { error: string }) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceNotice({
            text: "Microphone access was denied. Please allow microphone permissions in your browser or type instead.",
            isError: true
          });
        } else if (event.error === 'no-speech') {
          setVoiceNotice({
            text: "No speech was detected. Please tap the microphone and speak again, or type your question.",
            isError: true
          });
        } else {
          setVoiceNotice({
            text: `Voice recognition issue (${event.error}). Please type your question using the keyboard.`,
            isError: true
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNotice({
        text: "Could not initialize microphone. Please type your question using the keyboard.",
        isError: true
      });
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = speechLang === 'en-IN' ? 'ta-IN' : 'en-IN';
    setSpeechLang(nextLang);
    // If currently recording, stop so next click uses new language
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setVoiceNotice({
      text: nextLang === 'ta-IN'
        ? "குரல் மொழி தமிழாக மாற்றப்பட்டது (Voice set to Tamil: ta-IN)"
        : "Voice language set to Indian English (en-IN)",
      isError: false
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    // Stop active listening if user sends message
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setVoiceNotice(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: formatTime()
    };

    // Update conversation state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsThinking(true);

    // Prepare history payload for groqClient
    const chatHistory: ChatMessage[] = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      // Call Groq API via groqClient.ts
      const responseText = await sendChatMessage(chatHistory);

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: formatTime()
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "மன்னிக்கவும் (Sorry), we couldn't connect right now. Please check your connection and tap the question again.",
        timestamp: formatTime()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    handleSendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setVoiceNotice(null);
    setSpeakingId(null);
    setMessages(INITIAL_ELDER_MESSAGES);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 border-x-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* High Contrast Elder-Friendly Header */}
      <header className="bg-blue-800 text-white px-4 py-3.5 border-b-4 border-blue-900 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white text-blue-900 flex items-center justify-center font-black text-2xl shadow-md select-none">
            🩺
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Shoulder Care Q&amp;A
            </h1>
            <p className="text-sm sm:text-base font-semibold text-blue-100">
              Elderly Health Guide • முதியோர் நலன்
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Text Size Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLargeFont(!isLargeFont)}
            className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-black text-white text-sm font-bold border-2 border-blue-400 active:scale-95 transition"
            title="Toggle larger font size for easier reading"
          >
            {isLargeFont ? 'Normal A' : 'Bigger A+'}
          </button>

          {/* New Chat / Reset Button */}
          <button
            type="button"
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-900 hover:bg-blue-50 text-sm font-bold border-2 border-blue-900 shadow-sm active:scale-95 transition"
            title="Start fresh conversation (No login needed)"
          >
            <RefreshCw className="w-4 h-4 text-blue-900" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Safety Notice Bar */}
      <div className="bg-amber-100 dark:bg-amber-950/80 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-1.5 flex items-center gap-2 text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-medium">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
        <span>For severe pain or emergency, please visit a doctor or call 108 / 911 immediately.</span>
      </div>

      {/* Message List Area */}
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-100/90 dark:bg-slate-950"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Speaker Label */}
              <div className="text-xs sm:text-sm font-bold mb-1 px-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {isUser ? (
                  <span>👤 You / நீங்கள்</span>
                ) : (
                  <span>🩺 Doctor AI / மருத்துவர்</span>
                )}
                <span className="text-[11px] font-normal text-slate-500">
                  {msg.timestamp}
                </span>
              </div>

              {/* Chat Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-md ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-tr-xs border-2 border-blue-800'
                    : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 rounded-tl-xs border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {/* Large readable body text (min 18px / text-lg) */}
                <p
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isLargeFont ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                  }`}
                >
                  {msg.content}
                </p>

                {/* Read Aloud Button for Doctor AI Messages */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(msg.id, msg.content)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold text-sm transition active:scale-95"
                      aria-label="Listen to this message read aloud"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-5 h-5 text-red-600" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                          <span>🔊 Listen (கேளுங்கள்)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isThinking && (
          <div className="flex flex-col items-start" aria-busy="true">
            <div className="text-xs sm:text-sm font-bold mb-1 px-1 text-slate-700 dark:text-slate-300">
              🩺 Doctor AI / மருத்துவர்
            </div>
            <div className="bg-white dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-600 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-md flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-700 animate-ping shrink-0" />
              <div className="text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
                Doctor AI is thinking...
                <span className="block text-sm sm:text-base font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                  பதில் தயாராகிறது... தயவுசெய்து காத்திருக்கவும்
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </main>

      {/* Tappable Quick Question Buttons + Voice Controls + Input Bar */}
      <footer className="bg-white dark:bg-slate-900 border-t-3 border-slate-300 dark:border-slate-700 p-3 sm:p-4 space-y-3 shrink-0">
        {/* Row of 4-5 Tappable Quick Questions */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              👇 Tap to ask quickly (விரைவான கேள்விகள்):
            </span>
            {/* Language Toggle Button between English and Tamil */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-100 text-xs sm:text-sm font-bold active:scale-95 transition"
              title="Toggle voice input language"
            >
              <Languages className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{speechLang === 'en-IN' ? 'Voice: English (en-IN)' : 'குரல்: தமிழ் (ta-IN)'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ELDER_QUICK_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(question)}
                disabled={isThinking || isListening}
                className="shrink-0 px-4 py-2.5 min-h-[48px] rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-950 dark:text-blue-100 border-2 border-blue-600 dark:border-blue-400 font-bold text-base sm:text-lg shadow-xs active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Feedback / Fallback Notification Banner */}
        {voiceNotice && (
          <div
            className={`p-3 rounded-xl border-2 flex items-start justify-between gap-2 text-sm sm:text-base font-semibold ${
              voiceNotice.isError
                ? 'bg-rose-50 border-rose-400 text-rose-950 dark:bg-rose-950/80 dark:border-rose-700 dark:text-rose-100'
                : 'bg-emerald-50 border-emerald-500 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full shrink-0 ${isListening ? 'bg-rose-600 animate-ping' : 'bg-current'}`} />
              <span>{voiceNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceNotice(null)}
              className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white p-1"
              aria-label="Dismiss message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Big Text Input, Large Microphone Button & Big Send Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          {/* Large Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            disabled={isThinking}
            aria-label={isListening ? "Stop voice recording" : "Speak question using voice"}
            className={`min-h-[56px] min-w-[56px] px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-base sm:text-lg shadow-md transition active:scale-95 shrink-0 border-2 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-800 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900'
            }`}
            title={isListening ? "Listening... Tap to stop" : "Tap to Speak (குரல் மூலம் பேசவும்)"}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="hidden sm:inline">Speak</span>
              </>
            )}
          </button>

          {/* Big Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder={
              isListening
                ? "Listening... Speak now (பேசுங்கள்...)"
                : "Type or speak your question... (தட்டச்சு செய்யவும்)"
            }
            className={`flex-1 min-h-[56px] text-lg sm:text-xl px-4 sm:px-5 rounded-2xl border-2 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none transition font-medium ${
              isListening
                ? 'border-rose-500 ring-4 ring-rose-200 dark:ring-rose-900'
                : 'border-slate-400 dark:border-slate-600 focus:border-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900'
            }`}
            aria-label="Shoulder health question input"
          />

          {/* Big Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="min-h-[56px] px-5 sm:px-7 rounded-2xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-md transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <span>Send</span>
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
