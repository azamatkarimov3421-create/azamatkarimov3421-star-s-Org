// =====================================================
// NUR SHAXMAT 100 — Google Autentifikatsiya Modali (GoogleAuthModal)
// =====================================================

import React, { useState } from 'react';
import { GoogleIcon } from './Icons';
import {
  signInWithGoogle,
  signInWithGoogleDirect,
} from '../services/authService';
import { UserProfile } from '../store/userProfileStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleOAuthSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        const msg = res.error || '';
        if (msg.includes('provider is not enabled') || msg.includes('validation_failed')) {
          setErrorMsg('Supabase-da Google hali yoqilmagan. Iltimos, Supabase-da Google-ni yoqib Save tugmasini bosing.');
        } else {
          setErrorMsg(msg || 'Google orqali ulanishda xatolik yuz berdi.');
        }
        setShowManual(true);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Xatolik yuz berdi');
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Iltimos, ism va Google emailingizni kiriting.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Iltimos, toʻgʻri email manzilini kiriting (masalan: nom@gmail.com)');
      return;
    }

    const profile = signInWithGoogleDirect(name, email);
    onSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#21201d] border border-[#383531] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-[#f1f1f1]">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#2c2a26] hover:bg-[#383531] text-[#9b9893] hover:text-white flex items-center justify-center font-bold text-sm transition-all"
        >
          ✕
        </button>

        {/* Logotip va Sarlavha */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg mb-3 p-3">
            <GoogleIcon size={38} />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Google Bilan Kirish
          </h3>
          <p className="text-xs text-[#9b9893] mt-1 max-w-xs leading-relaxed">
            Nur Shaxmat 100 da shaxsiy profilingizni ochish va natijalaringizni saqlab borish uchun Google hisobingizdan foydalaning.
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Asosiy Google Tugmasi */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleOAuthSignIn}
            disabled={loading}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-zinc-200 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon size={22} />
            )}
            <span>{loading ? "Google tizimiga ulanmoqda..." : "Google orqali kirish"}</span>
          </button>

          {/* Afzalliklar */}
          <div className="p-4 rounded-2xl bg-[#181715] border border-[#2c2a26] space-y-2 text-xs text-[#c3c2be]">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Reyting va yutuqlaringiz bulutda saqlanadi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Google suratingiz va ismingiz doskada koʻrinadi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Onlayn oʻyinlar va peshqadamlar jadvalida ishtirok</span>
            </div>
          </div>
        </div>

        {/* Tezkor Google Profil Kirishi (Zaxira) */}
        {!showManual ? (
          <div className="text-center pt-1">
            <button
              onClick={() => setShowManual(true)}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 font-semibold cursor-pointer"
            >
              Google maʼlumotlarini qoʻlda kiritish ✎
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 border-t border-[#312e2b] animate-fadeIn">
            <div className="text-xs font-bold text-amber-400 mb-1">
              Google Hisob Maʼlumotlari:
            </div>
            <div>
              <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold">
                Toʻliq Ismingiz:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Azamat Karimov"
                className="w-full bg-[#181715] border border-[#383531] focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#9b9893] mb-1 font-semibold">
                Google Gmail Pochtangiz:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masalan@gmail.com"
                className="w-full bg-[#181715] border border-[#383531] focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Profilni Tasdiqlash va Saqlash
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
