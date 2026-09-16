import React from 'react';
import NurLogo from '../components/NurLogo';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#05080f] text-slate-100 flex flex-col justify-between items-center px-6 py-8 overflow-hidden font-sans select-none">
      {/* Orqa fon nur va spotlight effektlari */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[450px] h-[250px] rounded-full bg-yellow-600/10 blur-[100px] pointer-events-none" />

      {/* Yuqori qism: Brend va Shior */}
      <div className="flex flex-col items-center text-center mt-4 z-10 animate-fadeIn">
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          Oʻzbekiston Respublikasi · Oʻzbek Shaxmati
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-sm">
          NUR CHESS 100
        </h1>
        <p className="text-amber-200/85 text-xs sm:text-sm font-medium tracking-wide mt-1">
          Aql, Sabr va Gʻalaba
        </p>
      </div>

      {/* Markaziy qism: Rasmiy Dumaloq Logotip (Kitob 4-betidagi 100 katakli shaxmat logotipi) */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full my-3 z-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
          <NurLogo size={200} showGlow={true} />
        </div>

        {/* Muallif va Patent nishoni */}
        <div className="mt-4 text-center">
          <div className="text-xs font-bold text-slate-300">
            Muallif: <span className="text-amber-300 font-extrabold">Nurfyllo Nurmatov</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            UzAvtor Guvohnoma № 000-002-853 · FIDE qoidalariga mos
          </div>
        </div>
      </div>
      {/* Pastki qism: Boshlash tugmasi & Izoh */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3.5 z-10 pb-4">
        <button
          onClick={onStart}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 transition-all text-slate-950 font-black text-base shadow-[0_12px_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Boshlash</span>
          <span className="transition-transform group-hover:translate-x-1 font-mono text-lg">→</span>
        </button>

        <p className="text-slate-500 text-xs text-center font-medium tracking-wide">
          10×10 dosqa · 100 katak · Yangi Nur donasi
        </p>
      </div>
    </div>
  );
}
