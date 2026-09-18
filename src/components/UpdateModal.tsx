// =====================================================
// NUR SHAXMAT 100 - Yangilanish Modali (In-App Update Modal)
// Yangi APK chiqganda o'yin ustidan chiqadigan zamonaviy oyna
// =====================================================

import React, { useState } from 'react';
import { AppUpdateInfo, downloadAndInstallUpdate, getInstalledVersionName } from '../services/updateService';
import NurLogo from './NurLogo';

interface UpdateModalProps {
  isOpen: boolean;
  updateInfo: AppUpdateInfo | null;
  onClose: () => void;
}

export default function UpdateModal({ isOpen, updateInfo, onClose }: UpdateModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !updateInfo) return null;

  const currentVer = getInstalledVersionName();
  const notes = updateInfo.release_notes
    ? updateInfo.release_notes.split('\n').filter((line) => line.trim().length > 0)
    : ["Ilova barqarorligi va tezligi oshirildi", "Xatoliklar bartaraf etildi"];

  const handleUpdate = () => {
    setDownloading(true);
    downloadAndInstallUpdate(updateInfo);
    setTimeout(() => {
      if (!updateInfo.is_mandatory) {
        onClose();
      }
      setDownloading(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-gradient-to-b from-[#252422] via-[#1d1c1a] to-[#161513] rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-[#45423c] ring-1 ring-white/10 flex flex-col gap-4">
        {/* Dekorativ nur aulasi */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#81b64c]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Yuqori logotip va sarlavha */}
        <div className="flex items-center gap-3.5 relative">
          <div className="w-13 h-13 rounded-2xl bg-[#2b2926] border border-[#3d3a34] flex items-center justify-center p-2 shadow-inner">
            <NurLogo size={42} showGlow={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
                YANGI VERSIYA
              </span>
              {updateInfo.is_mandatory && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Majburiy
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white mt-0.5 leading-tight">
              {updateInfo.title || 'Nur Shaxmat 100 Yangilanishi'}
            </h3>
          </div>
        </div>

        {/* Versiya taqqoslash kartochkasi */}
        <div className="p-3.5 rounded-2xl bg-[#1a1917] border border-[#33302c] flex items-center justify-between">
          <div className="text-left">
            <div className="text-[11px] text-[#9b9893]">Hozirgi versiya</div>
            <div className="text-xs font-mono font-bold text-[#c3c2be]">v{currentVer}</div>
          </div>
          <div className="text-[#81b64c] text-lg font-black">➔</div>
          <div className="text-right">
            <div className="text-[11px] text-[#81b64c] font-semibold">Yangi versiya</div>
            <div className="text-sm font-mono font-black text-white bg-[#81b64c]/20 px-2 py-0.5 rounded-md border border-[#81b64c]/40 inline-block">
              v{updateInfo.version_name}
            </div>
          </div>
        </div>

        {/* Yangiliklar ro'yxati (Changelog) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#c3c2be] uppercase tracking-wider">
            Nimalar yangilandi:
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1c1b18] border border-[#33302c] space-y-1.5 max-h-36 overflow-y-auto">
            {notes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#d1d0cb]">
                <span className="text-[#81b64c] font-black shrink-0">•</span>
                <span>{note.replace(/^[- *•]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eslatma */}
        <div className="text-[11px] text-[#9b9893] text-center leading-relaxed">
          Yangilanish avtomatik ravishda eski ilovaning ustiga o'rnatiladi. Barcha ma'lumotlaringiz 100% saqlanadi.
        </div>

        {/* Tugmalar */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleUpdate}
            disabled={downloading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#81b64c] hover:bg-[#92c35a] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#537a2e] active:translate-y-1 active:shadow-[0_0_0_#537a2e] transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Yuklab olinmoqda...</span>
              </>
            ) : (
              <span>Hoziroq Yangilash</span>
            )}
          </button>

          {!updateInfo.is_mandatory && (
            <button
              onClick={onClose}
              disabled={downloading}
              className="w-full py-2.5 rounded-xl bg-[#2b2926] hover:bg-[#383531] text-[#9b9893] hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Keyinroq eslatish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
