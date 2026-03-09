import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Briefcase, GraduationCap, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getGeminiResponse } from './services/gemini';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: <FileText size={16} />, label: 'Resume Tips', prompt: 'Give me 5 tips to improve my tech resume.' },
  { icon: <MessageSquare size={16} />, label: 'Interview Prep', prompt: 'How should I prepare for a system design interview?' },
  { icon: <TrendingUp size={16} />, label: 'Salary Advice', prompt: 'How do I negotiate a higher salary for a senior role?' },
  { icon: <GraduationCap size={16} />, label: 'Career Path', prompt: 'What are the best certifications for a Cloud Engineer?' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Welcome to **Career AI**! 🚀 I'm your professional coach. Whether you're looking for a new job, preparing for an interview, or planning your next career move, I'm here to help. \n\nWhat's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(userMessage.content, []);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response || 'I am sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-indigo-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Career AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Expert Coach Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 mt-8 text-center"
            >
              <h2 className="mb-2 text-2xl font-bold text-slate-800">How can I accelerate your career?</h2>
              <p className="mb-8 text-slate-500">Choose a quick action or type your question below.</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action.prompt)}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      {action.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{action.label}</span>
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
                      <div className="markdown-body">
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
                    <span className="text-sm font-medium">Career AI is analyzing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-12" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-slate-200 bg-white p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about resumes, interviews, or career growth..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-5 pl-8 pr-20 text-sm transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-widest text-slate-400">
            <span>Resume Review</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Interview Prep</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Salary Negotiation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
