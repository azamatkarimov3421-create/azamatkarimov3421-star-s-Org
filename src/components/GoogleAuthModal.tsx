// =====================================================
// NUR SHAXMAT 100 — Foydalanuvchi Profili va Ro'yxatdan O'tish Modali
// 100% Ilova ichida tezkor va xavfsiz hisob boshqaruvi
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { GoogleIcon, LogOutIcon } from './Icons';
import {
  signInWithGoogleDirect,
  signOutGoogle,
  triggerAutoGooglePick,
  renderGoogleSignInButton,
} from '../services/authService';
import { getUserProfile, UserProfile } from '../store/userProfileStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const p = getUserProfile();
      setProfile(p);
      setName(p.name && p.name !== 'Mehmon Oʻyinchi' ? p.name : '');
      setEmail(p.email || '');
      setErrorMsg(null);

      // Avtomatik Google hisob tanlashni ishga tushirish (Gmail avtomatik chiqadi)
      const timer = setTimeout(() => {
        triggerAutoGooglePick((updatedProfile) => {
          onSuccess(updatedProfile);
          onClose();
        });
      }, 100);

      // Web GIS tugmasini render qilish (mavjud bo'lsa)
      if (googleBtnRef.current) {
        renderGoogleSignInButton(googleBtnRef.current, (updatedProfile) => {
          onSuccess(updatedProfile);
          onClose();
        });
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCurrentlyLinked = Boolean(profile.isGoogleLinked && profile.email);

  const handleAutoPickClick = () => {
    setErrorMsg(null);
    const triggered = triggerAutoGooglePick((updatedProfile) => {
      onSuccess(updatedProfile);
      onClose();
    });
    if (!triggered) {
      setErrorMsg('Google hisoblar roʻyxati ochilmadi. Quyidagi maydonga pochtangizni yozib saqlang.');
    }
  };

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

  const handleSignOutModal = async () => {
    await signOutGoogle();
    const updated = getUserProfile();
    onSuccess(updated);
    onClose();
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
            {isCurrentlyLinked ? 'Google Hisobini Almashtirish' : 'Google Bilan Kirish'}
          </h3>
          <p className="text-xs text-[#9b9893] mt-1 max-w-xs leading-relaxed">
            {isCurrentlyLinked
              ? 'Boshqa Google hisobingizni tanlang yoki yangi maʼlumotlarni kiriting.'
              : 'Qurilmangizdagi Gmail hisobingiz orqali 1 soniyada xavfsiz va xatosiz ulaning.'}
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span>ℹ️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ASOSIY AVTOMATIK GOOGLE / GMAIL TANLASH TUGMASI */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleAutoPickClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-slate-900 font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border border-zinc-200"
          >
            <GoogleIcon size={22} />
            <span>Google (Gmail) Hisobini Tanlash</span>
          </button>

          {/* Rasmiy GIS konteyneri (agar mavjud bo'lsa) */}
          <div ref={googleBtnRef} className="flex justify-center min-h-[0px] overflow-hidden empty:hidden" />
        </div>

        {/* Ajratuvchi chiziq */}
        <div className="flex items-center gap-2 text-[10px] text-[#716e68] font-bold uppercase tracking-wider my-0.5">
          <div className="flex-1 h-px bg-[#312e2b]" />
          <span>yoki ism va pochtani kiritish</span>
          <div className="flex-1 h-px bg-[#312e2b]" />
        </div>

        {/* Tezkor Ro'yxatdan O'tish / Almashtirish Formasi */}
        <form onSubmit={handleQuickSubmit} className="space-y-3 pt-0">
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

          {/* Saqlash Tugmasi */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-[#81b64c] hover:bg-[#92c35a] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span>{isCurrentlyLinked ? '🔄' : '✓'}</span>
            <span>{isCurrentlyLinked ? 'Hisobni Saqlash' : 'Profilni Saqlash'}</span>
          </button>
        </form>

        {/* Agar hisob ulangan bo'lsa - Chiqish imkoniyati */}
        {isCurrentlyLinked && (
          <div className="pt-2 border-t border-[#312e2b] flex items-center justify-center">
            <button
              type="button"
              onClick={handleSignOutModal}
              className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-red-500/10"
            >
              <LogOutIcon size={14} />
              <span>Hisobdan chiqish (Mehmon rejimiga oʻtish)</span>
            </button>
          </div>
        )}

        {/* Afzalliklar */}
        <div className="p-3 bg-[#181715] rounded-xl border border-[#2c2a26] space-y-1 text-xs text-[#c3c2be]">
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>100% ilova ichida ishlaydi, tashqi brauzer ochilmaydi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>Onlayn reyting va barcha gʻalabalar profilingizga yoziladi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
