
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, X, Sparkles, ChevronRight } from 'lucide-react';
import { askRegulatoryAdvisor } from '../services/geminiService';
import { BatterySpecs, CalculationResult, ChatMessage } from '../types';

interface Props {
  specs: BatterySpecs;
  result: CalculationResult | null;
}

const SUGGESTIONS = [
  "Quais documentos exatos eu preciso?",
  "Por que minha carga foi classificada assim?",
  "Existe restrição para passageiros (PAX)?",
  "O que é o Teste UN 38.3?",
  "Como embalar corretamente?"
];

const STORAGE_KEY = 'aerovolt_chat_history_v1';

const RegulatoryAdvisor: React.FC<Props> = ({ specs, result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([
            { role: 'model', text: 'Olá. Sou o AeroVolt AI, seu auditor IATA/LATAM. Já analisei os parâmetros da sua carga. Qual sua dúvida específica sobre a conformidade deste embarque?' }
          ]);
        }
      } catch (e) {
        console.error("Erro ao carregar histórico do chat:", e);
      }
    } else {
      setMessages([
        { role: 'model', text: 'Olá. Sou o AeroVolt AI, seu auditor IATA/LATAM. Já analisei os parâmetros da sua carga. Qual sua dúvida específica sobre a conformidade deste embarque?' }
      ]);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  // Handle classification updates while preserving history if user has started talking
  useEffect(() => {
     if (result) {
        const hasHistory = messages.length > 1;
        if (!hasHistory) {
          setMessages([{ role: 'model', text: `Detectei uma nova configuração (${result.unNumber} - ${result.energy.toFixed(1)}${result.unit}). Como posso auxiliar com esta classificação ${result.status}?` }]);
        }
     }
  }, [result?.unNumber, result?.energy, result?.status]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;
    
    const userMsg = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const answer = await askRegulatoryAdvisor(userMsg, { specs, result });
    
    setMessages(prev => [...prev, { role: 'model', text: answer }]);
    setLoading(false);
  };

  const clearChat = () => {
    const defaultMsg: ChatMessage = { role: 'model', text: 'Chat reiniciado. Como posso ajudar com este embarque?' };
    setMessages([defaultMsg]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-[0_8px_30px_rgba(80,70,229,0.4)] transition-all duration-500 z-50 flex items-center justify-center group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-indigo-600 hover:bg-indigo-700 text-white'}`}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 animate-pulse transition-opacity"></div>
        <Bot size={28} className="fill-current" />
        {result && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-coral-500 border-2 border-indigo-600"></span>
          </span>
        )}
      </button>

      <div className={`fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[650px] max-h-[85vh] bg-white rounded-[2rem] shadow-2xl border border-indigo-100 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-indigo-900 p-5 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-coral-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <Bot size={24} className="text-coral-400" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight flex items-center gap-1.5 leading-none">
                AeroVolt AI
                <Sparkles size={12} className="text-coral-400" />
              </h3>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mt-1 opacity-80">Auditor IATA DGR 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-1 relative z-10">
            <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full text-indigo-200 transition-colors" title="Limpar Histórico">
              <X size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors text-indigo-200 hover:text-white">
              <ChevronRight size={20} className="rotate-90" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/80 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative animate-in fade-in slide-in-from-bottom-2 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-slate-200/50'
              }`}>
                {msg.role === 'model' && (
                   <div className="absolute -left-3 -bottom-3 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm z-10">
                      <Bot size={14} className="text-coral-500" />
                   </div>
                )}
                <div className="markdown-prose whitespace-pre-line">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {/* Typing Indicator - Added as requested */}
          {loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 ml-4">
                 <div className="w-1.5 h-1.5 bg-coral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-coral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-coral-400 rounded-full animate-bounce"></div>
                 <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-tighter">Analisando...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions & Input */}
        <div className="bg-white border-t border-slate-100 shrink-0 p-2 pb-4">
          <div className="flex gap-2 overflow-x-auto p-3 mb-1 no-scrollbar">
             {SUGGESTIONS.map((s, i) => (
               <button 
                 key={i}
                 onClick={() => handleSend(s)}
                 disabled={loading}
                 className="whitespace-nowrap px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-100 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
               >
                 {s}
               </button>
             ))}
          </div>

          <div className="px-3 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida regulatória..."
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700"
              disabled={loading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-coral-500 hover:bg-coral-600 text-white p-3.5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-coral-500/20 active:scale-95 group"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegulatoryAdvisor;
