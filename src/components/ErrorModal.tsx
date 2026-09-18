// =====================================================
// NUR SHAXMAT 100 — Xatoliklar va Tizim Loglari Modali
// =====================================================

import React, { useState, useEffect } from 'react';
import { logger, LogEntry } from '../services/loggerService';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetGame?: () => void;
}

export default function ErrorModal({ isOpen, onClose, onResetGame }: ErrorModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(logger.getLogs());
    const unsubscribe = logger.subscribe((_entry, allLogs) => {
      setLogs([...allLogs]);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = logs.map(l => 
      `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category}]: ${l.message}\n${l.details ? l.details + '\n' : ''}`
    ).join('\n---\n');

    navigator.clipboard.writeText(text || 'Loglar boʻsh').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#1a1f1b] border border-[#2e4033] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#f1f1f1]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2e4033] flex items-center justify-between bg-[#141815]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
              errorCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {errorCount > 0 ? '⚠️' : '🛡️'}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Tizim Tashxisi & Xatoliklar Logi</span>
                {errorCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                    {errorCount} ta xato
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#9ca3af]">
                {errorCount > 0 
                  ? "O'yinda yuz bergan nosozlik sabablari quyida keltirilgan"
                  : "Hozirda barcha tizimlar normal va barqaror ishlamoqda"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#27352b] hover:bg-[#34473a] text-[#c3c2be] hover:text-white flex items-center justify-center text-sm font-bold transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px] max-h-[50vh]">
          {logs.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#9ca3af]">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-sm font-bold text-white">Hech qanday xatolik aniqlanmadi</p>
              <p className="text-xs text-[#6b7280] mt-1">O'yin mantiqi va sun'iy intellekt bekamu-ko'st ishlamoqda.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isError = log.level === 'error';
              const isWarn = log.level === 'warn';
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isError
                      ? 'bg-red-950/25 border-red-800/40 hover:border-red-600/60'
                      : isWarn
                      ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-600/60'
                      : 'bg-[#141815] border-[#27352b] hover:border-[#384c3e]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isError ? 'bg-red-500 text-white' : isWarn ? 'bg-amber-500 text-black' : 'bg-[#27352b] text-[#81b64c]'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-[10px] font-mono text-[#9ca3af]">
                        {log.timestamp}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        {log.category}
                      </span>
                    </div>

                    {log.details && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="text-[11px] font-bold text-[#81b64c] hover:underline"
                      >
                        {isExpanded ? 'Yashirish' : 'Tafsilotlar'}
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-white mt-1.5 leading-snug">
                    {log.message}
                  </p>

                  {isExpanded && log.details && (
                    <pre className="mt-2 p-2.5 rounded-lg bg-black/60 border border-[#2e4033] text-[10px] font-mono text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40">
                      {log.details}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 border-t border-[#2e4033] bg-[#141815] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              disabled={logs.length === 0}
              className="py-2 px-3 rounded-xl bg-[#233027] hover:bg-[#2d3e32] disabled:opacity-30 border border-[#2e4235] text-xs font-bold text-white flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>{copied ? '✅ Nusxalandi!' : '📋 Logdan nusxa olish'}</span>
            </button>

            <button
              onClick={handleClear}
              disabled={logs.length === 0}
              className="py-2 px-2.5 rounded-xl bg-transparent hover:bg-[#233027] disabled:opacity-30 text-xs font-bold text-[#9ca3af] hover:text-white transition-all"
            >
              Tozalash
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onResetGame && (
              <button
                onClick={() => {
                  onResetGame();
                  onClose();
                }}
                className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              >
                <span>🔄 Oʻyinni tiklash</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#81b64c] hover:bg-[#92c55b] text-white text-xs font-black transition-all active:scale-95"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
