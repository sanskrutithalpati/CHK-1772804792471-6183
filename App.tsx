import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Briefcase, GraduationCap, FileText, MessageSquare, TrendingUp, Mic, MicOff, Volume2, VolumeX, Square, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getGeminiResponse } from './services/gemini';
import { CareerAvatar } from './components/CareerAvatar';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: <FileText size={16} />, label: 'Resume Tips', prompt: 'Hey! Give me some quick tips for my resume.' },
  { icon: <MessageSquare size={16} />, label: 'Interview Prep', prompt: 'How should I prep for an interview?' },
  { icon: <TrendingUp size={16} />, label: 'Salary Advice', prompt: 'How do I ask for a raise?' },
  { icon: <GraduationCap size={16} />, label: 'Career Path', prompt: 'What should I learn next?' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expression, setExpression] = useState<'neutral' | 'happy' | 'thinking' | 'speaking'>('happy');
  const [hasStarted, setHasStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setExpression('happy');
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (prev) {
        window.speechSynthesis.resume();
        return false;
      } else {
        window.speechSynthesis.pause();
        return true;
      }
    });
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        
        // Handle voice commands
        if (transcript === 'stop' || transcript === 'stop talking' || transcript === 'stop it') {
          stopSpeaking();
          setIsListening(false);
          return;
        }

        if (transcript === 'pause' || transcript === 'wait') {
          togglePause();
          setIsListening(false);
          return;
        }

        if (transcript === 'resume' || transcript === 'continue') {
          togglePause();
          setIsListening(false);
          return;
        }

        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isSpeaking) {
      setExpression('happy');
    }
  }, [isLoading, isSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (isMuted) {
      setExpression('happy');
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setExpression('speaking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setExpression('happy');
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleActionClick = (prompt: string) => {
    handleSubmit(undefined, prompt);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    if (!hasStarted) setHasStarted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setExpression('thinking');

    try {
      const response = await getGeminiResponse(userMessage.content, []);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response || 'Oops, something went wrong!',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.content);
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Sorry friend, I'm having a bit of a glitch. Try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      speak(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-indigo-100 bg-white px-6 py-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">CareerAI</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Your Friend Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-bold border border-indigo-100"
                >
                  {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                  <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                </button>
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold border border-red-100"
                >
                  <Square size={14} fill="currentColor" />
                  <span>STOP</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Animated Avatar */}
        <motion.div
          className="absolute z-10 pointer-events-none"
          initial={false}
          animate={{
            top: 20,
            left: 20,
            scale: hasStarted ? 0.6 : 0.8,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="pointer-events-auto">
            <CareerAvatar expression={expression} size={hasStarted ? 80 : 100} />
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="mx-auto max-w-4xl">
            {!hasStarted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 mt-32 text-center"
              >
                <h2 className="mb-2 text-3xl font-bold text-slate-800">Hey! I'm CareerAI.</h2>
                <p className="mb-12 text-slate-500 text-lg">Your friendly coach for everything career. What's up?</p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action.prompt)}
                      className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-xl group"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[85%] gap-4 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div
                        className={`relative rounded-3xl px-6 py-4 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="markdown-body text-sm leading-relaxed">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <div
                          className={`mt-2 text-[10px] font-medium opacity-40 ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                      <Bot size={20} />
                    </div>
                    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-4 text-slate-500 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]"></span>
                      </div>
                      <span className="text-sm font-medium">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-12" />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-slate-200 bg-white p-4 md:p-8 z-20">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything, friend..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-5 pl-8 pr-14 text-sm transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-slate-200 text-slate-400'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none shrink-0"
            >
              <Send size={24} />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Friendly Advice</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Quick Tips</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Voice Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
