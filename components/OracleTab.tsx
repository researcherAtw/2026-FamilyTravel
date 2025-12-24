
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

/**
 * Renders text with support for basic Markdown bold syntax (**text**) 
 * and preserves line breaks.
 */
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split text by bold markers, capturing the markers to keep them in the array
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <>
      {segments.map((segment, i) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          // Remove the ** markers and render as strong
          const boldText = segment.slice(2, -2);
          return (
            <strong key={i} className="font-black text-stone-900 underline decoration-zen-primary/30 decoration-2 underline-offset-2">
              {boldText}
            </strong>
          );
        }
        // Return plain text segments
        return <span key={i}>{segment}</span>;
      })}
    </>
  );
};

export const OracleTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: '願星辰引導你的道路，冒險者。\n\n我是這趟旅程的預言者，關於這次「**金色奧捷**」的冒險，你想預知些什麼？',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    // 1. 重要：立即重置輸入框文字，提升反應速度並避免暫存殘留
    setInput('');
    
    // 2. 保持輸入框焦點 (適合桌面端連續提問)
    inputRef.current?.focus();

    const userMsg: Message = {
      role: 'user',
      text: trimmedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const systemInstruction = `你是一位「古代旅程預言者」。你對這趟 2026 年 2 月前往捷克與奧地利的家庭旅行瞭若指掌。
      旅行目的地包括：布拉格 (Prague)、庫倫洛夫 (CK)、薩爾斯堡 (Salzburg)、哈修塔特 (Hallstatt)、維也納 (Vienna)。
      你的口吻應該帶著一點點神秘、睿智且友好的 RPG 風格（例如稱呼對方為冒險者）。
      你可以回答關於景點歷史、交通建議、捷克/奧地利文化、必吃食物等問題。
      
      重要格式規則：
      1. 請使用換行符號 (\\n) 將不同段落或要點隔開，確保閱讀舒適且有條理。
      2. 關鍵字、地名、食物名或重要提醒請務必使用 **加粗語法** (例如：**維也納**、**天文鐘**、**糖漬紫羅蘭**)。
      3. 回答應簡短有力，富有啟發性，不要給出大段未經格式化的文字。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: trimmedInput }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      const modelText = response.text || '預言稍微模糊了，請再次向星辰尋求指引。';
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: modelText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Oracle Connection Failed', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: '魔法波動不穩定，傳送感應中斷了。\n\n請稍候片刻，待魔力回填後再向星辰詢問。',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  return (
    <div className="h-full flex flex-col bg-zen-bg relative overflow-hidden">
      {/* Decorative Mystic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 200 200" className="w-full h-full stroke-zen-primary fill-none">
          <circle cx="100" cy="100" r="80" strokeDasharray="5 5" />
          <path d="M100 20 L180 150 L20 150 Z" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3 bg-zen-bg/80 backdrop-blur-md border-b border-zen-primary/10 z-20">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center shadow-zen-sm flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
            <i className="fa-solid fa-crystal-ball text-indigo-500 text-lg relative z-10"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-zen-text leading-tight tracking-tight">星辰神諭</h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">Mystic Oracle</p>
          </div>
        </div>
      </div>

      {/* Input Area - 移動到上方，避免被鍵盤遮擋 */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 bg-white/40 backdrop-blur-md border-b border-stone-200/40 z-20">
        <form onSubmit={handleSend} className="max-w-md mx-auto relative">
          <div className="bg-white rounded-full shadow-zen border border-stone-200/60 p-1.5 flex items-center gap-2 group focus-within:border-zen-primary/50 transition-all">
            <input 
              ref={inputRef}
              type="text"
              placeholder="向預言者提問⋯"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              className="flex-1 bg-transparent border-none outline-none pl-4 text-sm font-bold text-stone-700 placeholder:text-stone-300"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0
                ${!input.trim() || isTyping 
                  ? 'bg-stone-100 text-stone-300' 
                  : 'bg-zen-primary text-white shadow-lg shadow-zen-primary/20 hover:scale-105 active:scale-95'
                }
              `}
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar relative z-10 pb-32"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`
              max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-zen-primary text-white rounded-tr-none' 
                : 'bg-white text-stone-700 border border-stone-100 rounded-tl-none relative'
              }
            `}>
              {msg.role === 'model' && (
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <i className="fa-solid fa-sparkles text-[8px] text-indigo-400"></i>
                </div>
              )}
              <FormattedMessage text={msg.text} />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-stone-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
