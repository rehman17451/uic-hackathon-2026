import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendToGemini, type GeminiMessage } from '../services/gemini';
import { useUserStore } from '../store/useUserStore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiAdvisor() {
  const navigate = useNavigate();
  const { theme } = useUserStore();
  const GREETING: Message = { role: 'assistant', content: "Hello! I'm your **TrueSay Financial Advisor** 👋\n\nAsk me about budgeting, investments, UPI safety, or taxes!" };

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('truesay-chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [GREETING];
  });
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('truesay-chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const clearChat = () => {
    stopSpeaking();
    setMessages([GREETING]);
    localStorage.removeItem('truesay-chat');
  };

  // ── Text-to-Speech ──────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!ttsEnabled) return;
    // Strip markdown formatting for cleaner speech
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[#*_~`>]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/⚠️/g, 'Warning')
      .replace(/👋/g, '')
      .replace(/₹/g, 'rupees ')
      .trim();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick the best quality voice available
    const voices = window.speechSynthesis.getVoices();
    // Priority order: Google US > Microsoft Online voices > Microsoft desktop voices
    const preferredVoice =
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => /Microsoft.*Online.*Natural/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find(v => v.name.includes('Microsoft Mark')) ||
      voices.find(v => v.name.includes('Microsoft David')) ||
      voices.find(v => v.name.includes('Microsoft Guy')) ||
      voices.find(v => /en-US/i.test(v.lang) && !/(female|zira|hazel|susan|jenny)/i.test(v.name)) ||
      voices.find(v => /en/i.test(v.lang));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // ── Speech-to-Text ──────────────────────────────────
  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Explicitly request mic permission first, then release the stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release immediately
    } catch {
      alert('Microphone access is required for voice input. Please allow microphone permission and try again.');
      return;
    }

    // Stop any ongoing TTS while listening
    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      // Only read the latest result — no accumulation
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      setInput(transcript.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permission in your browser and try again.');
      }
    };

    recognition.onend = () => {
      setListening(false);
      // Auto-submit after recognition ends
      setTimeout(() => {
        const form = document.querySelector('form');
        form?.requestSubmit();
      }, 400);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch (err) {
      console.error('Could not start recognition:', err);
      setListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── Send Message ────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    stopSpeaking(); // Stop any ongoing TTS
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history: GeminiMessage[] = updatedMessages
        .slice(1, -1)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const reply = await sendToGemini(userMessage, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      speak(reply); // Auto-speak the response
    } catch (err: any) {
      const errorMsg = `⚠️ Error: ${err.message || 'Could not reach AI. Please try again.'}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (q: string) => {
    setInput(q);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }, 50);
  };

  // Simple markdown renderer
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const boldified = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ')) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: boldified.replace(/^[\s\-•]+/, '') }} />;
      }
      if (line === '') return <br key={i} />;
      return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: boldified }} />;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300"
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 z-10 shadow-sm shrink-0 transition-colors">
        <button
          onClick={() => { stopSpeaking(); navigate('/'); }}
          className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col flex-1">
          <h1 className={`text-lg font-bold flex items-center gap-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Sparkles className="text-blue-500" size={18} /> Financial Advisor
          </h1>
          <span className="text-[10px] uppercase font-bold text-green-500 dark:text-green-400 tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> Online — Gemini AI
          </span>
        </div>
        {/* TTS Toggle */}
        <button
          onClick={() => { setTtsEnabled(p => !p); if (ttsEnabled) stopSpeaking(); }}
          className={`p-2 rounded-full transition-all ${ttsEnabled
              ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500')
              : (theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')
            }`}
          title={ttsEnabled ? 'Voice On' : 'Voice Off'}
        >
          {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {/* Clear Chat */}
        <button
          onClick={clearChat}
          className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-500 hover:text-red-400' : 'bg-gray-100 text-gray-400 hover:text-red-500'}`}
          title="Clear chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-[1.5rem] px-5 py-3.5 text-[14px] shadow-sm ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-bl-sm'
                }`}
            >
              <div className="space-y-1">{renderContent(msg.content)}</div>
              {/* Tap to re-speak assistant messages */}
              {msg.role === 'assistant' && i > 0 && ttsEnabled && (
                <button
                  onClick={() => speak(msg.content)}
                  className="mt-2 text-[10px] text-blue-400 dark:text-blue-500 font-bold uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Volume2 size={12} /> Tap to hear
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Speaking indicator */}
        {speaking && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-0.5">
              <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:0.1s]" />
              <span className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]" />
              <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse [animation-delay:0.3s]" />
              <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:0.15s]" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>Speaking...</span>
          </div>
        )}

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] rounded-bl-sm px-5 py-4 flex flex-col gap-2 shadow-sm relative overflow-hidden group">
              {/* Holographic Pulse */}
              <motion.div 
                animate={{ 
                  x: ['-100%', '200%'],
                  opacity: [0, 0.3, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent skew-x-12"
              />
              <div className="flex gap-1.5 relative z-10">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap shrink-0">
          {["How to budget ₹30k/month?", "Best SIPs for beginners?", "UPI safety tips"].map(q => (
            <button
              key={q}
              onClick={() => handleQuickPrompt(q)}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 pb-8 shrink-0 transition-colors relative">
        {/* Thinking Power Charge Bar */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-1 left-4 right-4 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
            >
              <motion.div 
                animate={{ 
                  width: ['0%', '100%'],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400 bg-white/80 dark:bg-gray-950 px-2 rounded-full shadow-sm">Thinking Power</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="relative flex items-center gap-2 mt-4">
          {/* Mic button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={listening ? stopListening : startListening}
            className={`p-3 rounded-full transition-all shrink-0 ${listening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                : (theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-700')
              }`}
            title={listening ? 'Stop listening' : 'Speak'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </motion.button>

          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              placeholder={listening ? 'Listening...' : 'Ask about finance, UPI, taxes...'}
              className={`w-full bg-gray-100 dark:bg-gray-950 border-2 border-transparent rounded-full pl-5 pr-14 py-3.5 outline-none focus:border-blue-500 transition-all font-medium text-sm placeholder-gray-400 dark:placeholder-gray-600 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/30"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </form>

        {/* Listening indicator */}
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center"
          >
            <span className="text-xs font-bold text-red-500 animate-pulse">🎤 Listening... Speak now</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
