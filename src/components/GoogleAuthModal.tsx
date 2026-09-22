// =====================================================
// NUR SHAXMAT 100 — Foydalanuvchi Profili va Ro'yxatdan O'tish Modali
// Faqat Google hisobi bilan kirish va ro'yxatdan o'tish
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { GoogleIcon, LogOutIcon } from './Icons';
import {
  signInWithGoogle,
  signOutGoogle,
  triggerAutoGooglePick,
} from '../services/authService';
import { getUserProfile, UserProfile } from '../store/userProfileStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const p = getUserProfile();
      setProfile(p);
      setErrorMsg(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCurrentlyLinked = Boolean(profile.isGoogleLinked && profile.email);

  const handleAutoPickClick = async () => {
    setErrorMsg(null);
    setLoading(true);
    const isAndroid = typeof window !== 'undefined' && Boolean((window as any).AndroidBridge);
    if (isAndroid) {
      const triggered = triggerAutoGooglePick((updatedProfile) => {
        setLoading(false);
        onSuccess(updatedProfile);
        onClose();
      });
      if (triggered) return;
    }

    try {
      const res = await signInWithGoogle();
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Google orqali kirishda xatolik yuz berdi.');
      } else {
        const updated = getUserProfile();
        onSuccess(updated);
        onClose();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Google tizimiga ulanib boʻlmadi.');
    }
  };

  const handleSignOutModal = async () => {
    await signOutGoogle();
    const updated = getUserProfile();
    onSuccess(updated);
    onClose();
  };

  const firstLetter = (profile.name && profile.name !== 'Mehmon Oʻyinchi' ? profile.name : 'G').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
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
          <div className="w-16 h-16 rounded-2xl bg-[#233027] border-2 border-[#81b64c] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-2.5">
            {isCurrentlyLinked ? firstLetter : <GoogleIcon size={32} />}
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            {isCurrentlyLinked ? 'Google Hisobini Almashtirish' : 'Google Bilan Kirish'}
          </h3>
          <p className="text-xs text-[#9b9893] mt-1 max-w-xs leading-relaxed">
            {isCurrentlyLinked
              ? 'Boshqa Google akkauntingizni tanlab tizimga kiring.'
              : 'Qurilmangizdagi Gmail hisobingiz orqali 1 soniyada xavfsiz va toʻliq ulaning.'}
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span>ℹ️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ASOSIY GOOGLE / GMAIL TANLASH TUGMASI */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleAutoPickClick}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-slate-900 font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer border border-zinc-200 disabled:opacity-50"
          >
            <GoogleIcon size={24} />
            <span>{loading ? 'Google bilan ulanmoqda...' : 'Google (Gmail) Hisobini Tanlash'}</span>
          </button>

          {/* Rasmiy GIS konteyneri (agar mavjud bo'lsa) */}
          <div ref={googleBtnRef} className="flex justify-center min-h-[0px] overflow-hidden empty:hidden" />
        </div>

        {/* Agar hisob ulangan bo'lsa - Chiqish imkoniyati */}
        {isCurrentlyLinked && (
          <div className="pt-2 border-t border-[#312e2b] flex items-center justify-center">
            <button
              type="button"
              onClick={handleSignOutModal}
              className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-red-500/10"
            >
              <LogOutIcon size={14} />
              <span>Google hisobidan chiqish</span>
            </button>
          </div>
        )}

        {/* Afzalliklar */}
        <div className="p-3.5 bg-[#181715] rounded-2xl border border-[#2c2a26] space-y-1.5 text-xs text-[#c3c2be]">
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>100% Google orqali xavfsiz roʻyxatdan oʻtish</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#81b64c] font-bold">✓</span>
            <span>Reyting, yutuqlar va onlayn gʻalabalaringiz saqlanadi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
