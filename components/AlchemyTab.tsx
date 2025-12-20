
import React, { useState, useEffect, useMemo, useRef } from 'react';

// 更新為最新每日同步的 API 來源
const ALCHEMY_API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
const RUNIC_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛝ', 'ᛟ', 'ᛞ', 'Δ', 'Φ', 'Ψ', 'Ω', 'Ξ'];

// --- Runic Scrambling Number Component ---
const RunicNumber: React.FC<{ value: number; active: boolean; onSettle: () => void }> = ({ value, active, onSettle }) => {
    const [displayValue, setDisplayValue] = useState<string>('0.00');
    const [isScrambling, setIsScrambling] = useState(false);
    
    // 將數值格式化為包含兩位小數的字串
    const targetValue = useMemo(() => 
        value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [value]);

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (active) {
            setIsScrambling(true);
            let frame = 0;
            const maxFrames = 5; // 縮短幀數從 6 -> 5，縮減動畫長度

            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = window.setInterval(() => {
                frame++;
                if (frame < maxFrames) {
                    const scrambled = targetValue.split('').map(char => {
                        // 保留分隔符號與小數點，只混淆數字
                        if (char === ',' || char === '.') return char;
                        return RUNIC_SYMBOLS[Math.floor(Math.random() * RUNIC_SYMBOLS.length)];
                    }).join('');
                    setDisplayValue(scrambled);
                } else {
                    setDisplayValue(targetValue);
                    setIsScrambling(false);
                    onSettle(); 
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, 20); // 20ms * 5 = 100ms 完成數值轉化
        } else if (!isScrambling) {
            setDisplayValue(targetValue);
        }
    }, [targetValue, active, onSettle, isScrambling]);

    return (
        <span className={`transition-all duration-300 ${isScrambling ? 'text-zen-primary blur-[0.3px] scale-105' : ''}`}>
            {displayValue}
        </span>
    );
};

// --- Border Shine Shimmer Component ---
const BorderShine: React.FC<{ active: boolean }> = ({ active }) => (
    <div className={`absolute inset-0 pointer-events-none z-20 ${active ? 'block' : 'hidden'}`}>
        <svg className="w-full h-full overflow-visible" fill="none">
            <rect 
                x="0" y="0" width="100%" height="100%" 
                rx="16" ry="16" 
                className="stroke-zen-primary animate-border-shine" 
                strokeWidth="2" 
                strokeDasharray="400"
            />
        </svg>
    </div>
);

// --- Enhanced Alchemical Current Flow ---
const LiquidFlow: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="absolute left-1/2 -translate-x-1/2 w-8 h-4 z-0 pointer-events-none -my-2.5">
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
            <path 
                d="M 20 0 L 20 40" 
                className={`stroke-zen-primary/10 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-20'}`} 
                fill="none" 
                strokeWidth="1" 
                strokeDasharray="4 4"
            />
            {active && (
                <>
                    <path 
                        d="M 20 0 L 20 40" 
                        className="stroke-zen-primary opacity-30 blur-[2px] animate-flow" 
                        fill="none" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        strokeDasharray="10 30"
                    />
                    <path 
                        d="M 20 0 L 20 40" 
                        className="stroke-zen-primary animate-flow" 
                        fill="none" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeDasharray="15 25"
                    />
                </>
            )}
        </svg>
    </div>
);

// --- Stable Material Essence Particles ---
const EssenceParticles: React.FC<{ active: boolean }> = ({ active }) => {
    const particles = useMemo(() => Array.from({ length: 15 }), []);
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {particles.map((_, i) => {
                const duration = 5 + (i % 5);
                const delay = (i * 0.3) % 5;
                const left = (i * 7) % 100;
                const top = (i * 13) % 100;
                const size = 1 + (i % 2);
                
                return (
                    <div 
                        key={i}
                        className={`absolute bg-zen-primary rounded-full transition-opacity duration-1000 ${active ? 'opacity-40 shadow-[0_0_8px_rgba(212,163,115,0.6)]' : 'opacity-5'}`}
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${left}%`,
                            top: `${top}%`,
                            animation: active ? `essence-float ${duration}s ease-in-out infinite` : 'none',
                            animationDelay: `${delay}s`
                        }}
                    />
                );
            })}
        </div>
    );
};

// --- Mystic Background with Transmutation Patterns ---
const MysticBackground: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] aspect-square opacity-[0.06] animate-spin-slow">
            <svg viewBox="0 0 400 400" className="w-full h-full stroke-zen-primary fill-none" strokeWidth="0.5">
                <circle cx="200" cy="200" r="190" strokeDasharray="10 15" />
                <circle cx="200" cy="200" r="170" />
                <path d="M200 10 L373 310 L27 310 Z" />
                <path d="M200 390 L27 90 L373 90 Z" />
            </svg>
        </div>
    </div>
);

// --- Alchemical Patterns & Seal ---
const CardPattern: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.05]">
        <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" className={`transition-all duration-1000 ${active ? 'scale-110' : 'scale-100'}`} xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 10" />
            <path d="M200 40 L300 160 L100 160 Z" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    </div>
);

const MaterialSeal: React.FC<{ symbol: string; label: string; active: boolean }> = ({ symbol, label, active }) => (
    <div className="flex items-center gap-2 relative z-10">
        <div className={`
            w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-500
            ${active 
                ? 'bg-zen-primary text-white border-zen-primary shadow-alchemy-glow scale-105' 
                : 'bg-white text-zen-primary/80 border-stone-200'
            }
        `}>
            <span className="text-base font-black font-mono">{symbol}</span>
        </div>
        <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? 'text-zen-primary' : 'text-stone-400'}`}>Material</span>
            <span className={`text-sm font-black tracking-widest ${active ? 'text-stone-800' : 'text-stone-600'}`}>{label}</span>
        </div>
    </div>
);

export const AlchemyTab: React.FC = () => {
    const [czkAmount, setCzkAmount] = useState<string>('1');
    const [eurAmount, setEurAmount] = useState<string>('1');
    const [rates, setRates] = useState<{ czk: number; eur: number }>({ czk: 1.45, eur: 35.2 });
    
    const [isCzkSynthesizing, setIsCzkSynthesizing] = useState(false);
    const [isEurSynthesizing, setIsEurSynthesizing] = useState(false);
    const [showCzkShine, setShowCzkShine] = useState(false);
    const [showEurShine, setShowEurShine] = useState(false);
    
    // 選取狀態
    const [activeMaterial, setActiveMaterial] = useState<'czk' | 'eur' | null>(null);

    const [lastUpdated, setLastUpdated] = useState<string>('同步中...');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const [czkRes, eurRes] = await Promise.all([
                    fetch(`${ALCHEMY_API_BASE}/czk.json`),
                    fetch(`${ALCHEMY_API_BASE}/eur.json`)
                ]);
                const czkData = await czkRes.json();
                const eurData = await eurRes.json();
                setRates({ czk: czkData.czk?.twd || 1.45, eur: eurData.eur?.twd || 35.2 });
                setLastUpdated(`${czkData.date || '今日'} (每日同步)`);
            } catch (error) {
                setLastUpdated("連結失敗，使用備用能量");
            }
        };
        fetchRates();
    }, []);

    const triggerCzkAlchemy = () => {
        setActiveMaterial('czk');
        setIsCzkSynthesizing(true);
        setShowCzkShine(false);
        // 合成狀態持續時間縮短至 150ms，配合 100ms 的數字動畫，確保在 200ms 內完成
        setTimeout(() => setIsCzkSynthesizing(false), 150);
    };

    const triggerEurAlchemy = () => {
        setActiveMaterial('eur');
        setIsEurSynthesizing(true);
        setShowEurShine(false);
        // 同樣縮短至 150ms
        setTimeout(() => setIsEurSynthesizing(false), 150);
    };

    const czkResult = (parseFloat(czkAmount) || 0) * rates.czk;
    const eurResult = (parseFloat(eurAmount) || 0) * rates.eur;

    return (
        <div className="h-full flex flex-col relative star-map-pattern overflow-hidden">
            <MysticBackground />
            
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 bg-zen-bg/80 backdrop-blur-md border-b border-zen-primary/10 z-20">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-zen-primary/20 flex items-center justify-center shadow-zen-sm transform -rotate-3 flex-shrink-0">
                        <i className="fa-solid fa-flask text-zen-primary text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zen-text leading-tight tracking-tight">等價交換</h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">Equivalent Exchange</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-24 pt-4 no-scrollbar space-y-3 relative z-10">
                {/* CZK Card */}
                <div 
                    className={`relative group transition-all duration-500 ${activeMaterial && activeMaterial !== 'czk' ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'}`}
                    onClick={() => setActiveMaterial('czk')}
                >
                    <div className={`alchemical-frame transition-all duration-500 ${isCzkSynthesizing || activeMaterial === 'czk' ? 'shadow-alchemy-glow border-zen-primary/60' : 'border-stone-100'}`}>
                        <div className="p-3 px-4 space-y-0.5 relative rounded-[1.5rem] overflow-hidden bg-white/60">
                            <CardPattern active={isCzkSynthesizing || activeMaterial === 'czk'} />
                            
                            <div className="flex justify-between items-start relative z-10 mb-1">
                                <MaterialSeal symbol="₡" label="捷克克朗素材" active={isCzkSynthesizing || activeMaterial === 'czk'} />
                                <span className={`text-[6px] font-mono font-bold uppercase tracking-widest transition-colors duration-500 ${activeMaterial === 'czk' ? 'text-zen-primary' : 'text-stone-300'}`}>Portal: CZK</span>
                            </div>

                            <div className="relative z-10 flex items-center justify-center h-12">
                                <input 
                                    type="number"
                                    value={czkAmount}
                                    onFocus={() => setActiveMaterial('czk')}
                                    onChange={(e) => { setCzkAmount(e.target.value); triggerCzkAlchemy(); }}
                                    className={`w-full h-full bg-white/80 border rounded-xl text-xl font-mono font-black text-stone-700 text-center transition-all outline-none ${activeMaterial === 'czk' ? 'border-zen-primary ring-1 ring-zen-primary/20 shadow-inner' : 'border-stone-200'}`}
                                />
                                <div className={`absolute right-3 top-1/2 -translate-y-1/2 border px-2 py-0.5 rounded font-black text-xs font-mono tracking-widest pointer-events-none shadow-sm transition-all duration-500 ${activeMaterial === 'czk' ? 'bg-zen-primary text-white border-zen-primary' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>CZK</div>
                            </div>

                            <div className="relative h-1 mt-0.5"><LiquidFlow active={isCzkSynthesizing || activeMaterial === 'czk'} /></div>

                            <div className={`bg-stone-50/80 rounded-xl h-14 flex flex-col items-center justify-center border transition-all duration-500 relative overflow-hidden ${isCzkSynthesizing || activeMaterial === 'czk' ? 'border-zen-primary/40 bg-white' : 'border-stone-100'}`}>
                                <BorderShine active={showCzkShine} />
                                <EssenceParticles active={isCzkSynthesizing || activeMaterial === 'czk'} />
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 opacity-60">
                                    <div className={`w-1 h-1 rounded-full ${isCzkSynthesizing || activeMaterial === 'czk' ? 'bg-zen-primary animate-pulse' : 'bg-stone-300'}`}></div>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] leading-none transition-colors duration-500 ${activeMaterial === 'czk' ? 'text-zen-primary' : 'text-stone-400'}`}>Essence</span>
                                </div>
                                <div className={`text-xl font-mono font-black flex items-center justify-center transition-all duration-300 relative z-10 pt-1 ${isCzkSynthesizing || activeMaterial === 'czk' ? 'text-zen-primary scale-105' : 'text-stone-700'}`}>
                                    <RunicNumber value={czkResult} active={isCzkSynthesizing} onSettle={() => { setShowCzkShine(true); setTimeout(() => setShowCzkShine(false), 800); }} />
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-black tracking-widest ml-2 leading-none border transition-all duration-500 ${activeMaterial === 'czk' ? 'bg-zen-primary/10 border-zen-primary/20 text-zen-primary' : 'bg-stone-100 border-stone-200 text-stone-400'}`}>TWD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EUR Card */}
                <div 
                    className={`relative group transition-all duration-500 ${activeMaterial && activeMaterial !== 'eur' ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'}`}
                    onClick={() => setActiveMaterial('eur')}
                >
                    <div className={`alchemical-frame transition-all duration-500 ${isEurSynthesizing || activeMaterial === 'eur' ? 'shadow-alchemy-glow border-zen-primary/60' : 'border-stone-100'}`}>
                        <div className="p-3 px-4 space-y-0.5 relative rounded-[1.5rem] overflow-hidden bg-white/60">
                            <CardPattern active={isEurSynthesizing || activeMaterial === 'eur'} />
                            
                            <div className="flex justify-between items-start relative z-10 mb-1">
                                <MaterialSeal symbol="€" label="歐元素材" active={isEurSynthesizing || activeMaterial === 'eur'} />
                                <span className={`text-[6px] font-mono font-bold uppercase tracking-widest transition-colors duration-500 ${activeMaterial === 'eur' ? 'text-zen-primary' : 'text-stone-300'}`}>Portal: EUR</span>
                            </div>

                            <div className="relative z-10 flex items-center justify-center h-12">
                                <input 
                                    type="number"
                                    value={eurAmount}
                                    onFocus={() => setActiveMaterial('eur')}
                                    onChange={(e) => { setEurAmount(e.target.value); triggerEurAlchemy(); }}
                                    className={`w-full h-full bg-white/80 border rounded-xl text-xl font-mono font-black text-stone-700 text-center transition-all outline-none ${activeMaterial === 'eur' ? 'border-zen-primary ring-1 ring-zen-primary/20 shadow-inner' : 'border-stone-200'}`}
                                />
                                <div className={`absolute right-3 top-1/2 -translate-y-1/2 border px-2 py-0.5 rounded font-black text-xs font-mono tracking-widest pointer-events-none shadow-sm transition-all duration-500 ${activeMaterial === 'eur' ? 'bg-zen-primary text-white border-zen-primary' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>EUR</div>
                            </div>

                            <div className="relative h-1 mt-0.5"><LiquidFlow active={isEurSynthesizing || activeMaterial === 'eur'} /></div>

                            <div className={`bg-stone-50/80 rounded-xl h-14 flex flex-col items-center justify-center border transition-all duration-500 relative overflow-hidden ${isEurSynthesizing || activeMaterial === 'eur' ? 'border-zen-primary/40 bg-white' : 'border-stone-100'}`}>
                                <BorderShine active={showEurShine} />
                                <EssenceParticles active={isEurSynthesizing || activeMaterial === 'eur'} />
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 opacity-60">
                                    <div className={`w-1 h-1 rounded-full ${isEurSynthesizing || activeMaterial === 'eur' ? 'bg-zen-primary animate-pulse' : 'bg-stone-300'}`}></div>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] leading-none transition-colors duration-500 ${activeMaterial === 'eur' ? 'text-zen-primary' : 'text-stone-400'}`}>Essence</span>
                                </div>
                                <div className={`text-xl font-mono font-black flex items-center justify-center transition-all duration-300 relative z-10 pt-1 ${isEurSynthesizing || activeMaterial === 'eur' ? 'text-zen-primary scale-105' : 'text-stone-700'}`}>
                                    <RunicNumber value={eurResult} active={isEurSynthesizing} onSettle={() => { setShowEurShine(true); setTimeout(() => setShowEurShine(false), 800); }} />
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-black tracking-widest ml-2 leading-none border transition-all duration-500 ${activeMaterial === 'eur' ? 'bg-zen-primary/10 border-zen-primary/20 text-zen-primary' : 'bg-stone-100 border-stone-200 text-stone-400'}`}>TWD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Improved Visibility */}
                <div className="bg-white/60 p-4 rounded-[1.5rem] border border-stone-200/60 shadow-sm flex flex-col items-center text-center gap-1.5 backdrop-blur-md relative z-20 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zen-primary animate-pulse"></div>
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.15em] leading-none">能量更新: {lastUpdated}</span>
                    </div>
                    <p className="text-[9px] text-stone-400 font-bold leading-relaxed tracking-wide px-2">
                        基於『等價交換』法則估算，數值隨現世波動即時同步。
                    </p>
                </div>
            </div>
        </div>
    );
};
