// =====================================================
// NUR SHAXMAT 100 — Foydalanuvchi Profili va Ro'yxatdan O'tish Modali
// =====================================================

import React, { useState } from 'react';
import { GoogleIcon } from './Icons';
import {
  signInWithGoogle,
  signInWithGoogleDirect,
} from '../services/authService';
import { getUserProfile, UserProfile } from '../store/userProfileStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const currentProfile = getUserProfile();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState(
    currentProfile.name && currentProfile.name !== 'Mehmon Oʻyinchi' ? currentProfile.name : ''
  );
  const [email, setEmail] = useState(currentProfile.email || '');

  if (!isOpen) return null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMsg('Iltimos, ismingiz yoki taxallusingizni kiriting.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Iltimos, toʻgʻri email manzilingizni kiriting (masalan: nom@gmail.com)');
      return;
    }

    const updated = signInWithGoogleDirect(cleanName, cleanEmail);
    onSuccess(updated);
    onClose();
  };

  const handleOAuthSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || 'Google orqali ulanishda xatolik yuz berdi.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const firstLetter = (name.trim() || 'A').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#21201d] border border-[#383531] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-[#f1f1f1]">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#2c2a26] hover:bg-[#383531] text-[#9b9893] hover:text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Profil Avatari va Sarlavha */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="w-16 h-16 rounded-2xl bg-[#7a6652] border-2 border-[#81b64c] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-2.5">
            {firstLetter}
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Profilni Faollashtirish
          </h3>
          <p className="text-xs text-[#9b9893] mt-1 max-w-xs leading-relaxed">
            Ilova ichida 1 soniyada profilingizni yarating — barcha reyting, gʻalabalar va natijalaringiz saqlanib boradi.
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Asosiy Tezkor Ro'yxatdan O'tish Formasi (Ilova ichida) */}
        <form onSubmit={handleQuickSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold uppercase tracking-wider">
              Ismingiz yoki Taxallusingiz:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Masalan: Azamat Karimov"
              className="w-full bg-[#181715] border border-[#383531] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold uppercase tracking-wider">
              Google Gmail pochtangiz:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="karimovazamat3421@gmail.com"
              className="w-full bg-[#181715] border border-[#383531] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none font-mono transition-colors"
              required
            />
          </div>

          {/* Asosiy Saqlash Tugmasi */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#81b64c] hover:bg-[#92c35a] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span>✓</span>
            <span>Profilni Saqlash va Faollashtirish</span>
          </button>
        </form>

        {/* Afzalliklar */}
        <div className="p-3 bg-[#181715] rounded-xl border border-[#2c2a26] space-y-1.5 text-xs text-[#c3c2be]">
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>Ilovadan chiqmasdan toʻliq oflayn va onlayn ishlaydi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>Onlayn reyting va gʻalabalar profilingizga yoziladi</span>
          </div>
        </div>

        {/* Qo'shimcha Google orqali ulanish varianti */}
        <div className="pt-2 border-t border-[#312e2b] text-center">
          <button
            type="button"
            onClick={handleOAuthSignIn}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto font-medium transition-colors cursor-pointer py-1"
          >
            <GoogleIcon size={14} />
            <span>{loading ? "Google ulanmoqda..." : "Yoki Google orqali avtomatik ulanish (OAuth)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
