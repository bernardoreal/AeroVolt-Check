
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, X, Sparkles, ChevronRight, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { askRegulatoryAdvisor } from '../services/geminiService';
import { BatterySpecs, CalculationResult, ChatMessage, FeedbackData } from '../types';

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
  
  // State for active comment input
  const [activeCommentIndex, setActiveCommentIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

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
  }, [messages, loading, isOpen, activeCommentIndex]);

  // Handle classification updates while preserving history if user has started talking
  useEffect(() => {
     if (result) {
        const hasHistory = messages.length > 1;
        if (!hasHistory) {
          setMessages([{ role: 'model', text: `Detectei uma nova configuração (${result.unNumber} - ${result.energy.toFixed(2)}${result.unit}). Como posso auxiliar com esta classificação ${result.status}?` }]);
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

  const handleRating = (index: number, rating: 'positive' | 'negative') => {
    const newMessages = [...messages];
    const currentFeedback = newMessages[index].feedback;
    
    // Toggle rating if clicking same one, otherwise set new
    if (currentFeedback?.rating === rating) {
       // Optional: Allow deselecting? For now let's just keep it simple.
       // actually, let's keep it set.
    } else {
       newMessages[index].feedback = {
         ...(currentFeedback || {}),
         rating,
         submittedAt: Date.now()
       };
       setMessages(newMessages);
       
       // If negative, auto-open comment box
       if (rating === 'negative') {
         setActiveCommentIndex(index);
         setCommentText(newMessages[index].feedback?.comment || '');
       }
    }
  };

  const toggleCommentBox = (index: number) => {
    if (activeCommentIndex === index) {
      setActiveCommentIndex(null);
    } else {
      setActiveCommentIndex(index);
      setCommentText(messages[index].feedback?.comment || '');
    }
  };

  const submitComment = (index: number) => {
    const newMessages = [...messages];
    if (!newMessages[index].feedback) {
       // Should theoretically have a rating first, but handle safety
       newMessages[index].feedback = { rating: 'positive', submittedAt: Date.now() }; 
    }
    
    if (newMessages[index].feedback) {
        newMessages[index].feedback!.comment = commentText;
        newMessages[index].feedback!.submittedAt = Date.now();
    }
    
    setMessages(newMessages);
    setActiveCommentIndex(null);
    setCommentText('');
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-[0_12px_35px_rgba(79,70,229,0.35)] hover:shadow-[0_20px_45px_rgba(79,70,229,0.45)] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) z-50 flex items-center justify-center group ${isOpen ? 'scale-50 opacity-0 translate-y-20 pointer-events-none' : 'scale-100 opacity-100 translate-y-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white'}`}
      >
        {/* Subtle internal ring/glow */}
        <div className="absolute inset-1 rounded-full border border-white/10 opacity-50"></div>
        <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-20 animate-pulse transition-opacity"></div>
        
        {/* Icon Group */}
        <div className="relative">
           <Bot size={32} strokeWidth={1.5} className="fill-indigo-500/30 drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
           <div className="absolute -top-1.5 -right-2.5 bg-white/10 rounded-full p-0.5 backdrop-blur-sm border border-white/10">
              <Sparkles size={12} className="text-coral-300 fill-coral-300 animate-pulse" />
           </div>
        </div>

        {/* Notification Dot */}
        {result && (
          <span className="absolute top-3 right-3 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-coral-500 border-2 border-indigo-700"></span>
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
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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

              {/* Feedback UI for Model Messages */}
              {msg.role === 'model' && !loading && (
                <div className="mt-2 ml-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex bg-white rounded-full shadow-sm border border-slate-100 p-0.5">
                    <button 
                      onClick={() => handleRating(idx, 'positive')}
                      className={`p-1.5 rounded-full transition-all ${
                        msg.feedback?.rating === 'positive' 
                        ? 'bg-green-100 text-green-600' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-green-500'
                      }`}
                      title="Útil"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <div className="w-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={() => handleRating(idx, 'negative')}
                      className={`p-1.5 rounded-full transition-all ${
                        msg.feedback?.rating === 'negative' 
                        ? 'bg-red-100 text-red-600' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-red-500'
                      }`}
                      title="Não foi útil"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>

                  {(msg.feedback?.rating || msg.feedback?.comment) && (
                    <button 
                       onClick={() => toggleCommentBox(idx)}
                       className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 transition-colors ${
                         msg.feedback?.comment ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'
                       }`}
                    >
                       <MessageCircle size={12} />
                       {msg.feedback?.comment ? 'Comentário salvo' : 'Comentar'}
                    </button>
                  )}
                </div>
              )}

              {/* Comment Input Box */}
              {activeCommentIndex === idx && (
                <div className="mt-2 ml-2 w-[85%] bg-white p-3 rounded-xl border border-indigo-100 shadow-lg animate-in zoom-in-95 origin-top-left z-20">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                     {msg.feedback?.rating === 'negative' ? 'O que podemos melhorar?' : 'Adicionar observação'}
                   </p>
                   <textarea
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Digite seu feedback aqui..."
                     className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 focus:bg-white resize-none h-16 mb-2 text-slate-700"
                   />
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setActiveCommentIndex(null)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase px-2"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => submitComment(idx)}
                        className="bg-indigo-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Enviar Feedback
                      </button>
                   </div>
                </div>
              )}
            </div>
          ))}
          {/* Typing Indicator */}
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
