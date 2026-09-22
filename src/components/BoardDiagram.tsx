// =====================================================
// NUR CHESS 100 — Ko'rgazmali Shaxmat Diagrammasi (BoardDiagram)
// Qoidalar va darslik uchun rasmli ko'rgazma komponenti
// =====================================================

import React from 'react';
import PieceIcon from './PieceIcon';
import { PieceType, FILES } from '../engine/types';

export interface DiagramPiece {
  file: number; // 0-based column index
  rank: number; // 0-based row index (0 is rank 1, 9 is rank 10)
  type: PieceType;
  color: 'white' | 'black';
  label?: string;
  isGhost?: boolean; // Yarim shaffof (oldin turgan joyini ko'rsatish uchun)
}

export interface DiagramHighlight {
  file: number;
  rank: number;
  type: 'move' | 'capture' | 'jump' | 'from' | 'check' | 'special';
  badge?: string;
}

export interface DiagramArrow {
  from: { file: number; rank: number };
  to: { file: number; rank: number };
  color?: string;
  curve?: boolean;
  curveHeight?: number;
  label?: string;
}

interface BoardDiagramProps {
  cols?: number;
  rows?: number;
  fileLabels?: string[];
  rankLabels?: (number | string)[];
  pieces?: DiagramPiece[];
  highlights?: DiagramHighlight[];
  arrows?: DiagramArrow[];
  caption?: string;
  subCaption?: string;
  showNumbers?: boolean;
  startColIndex?: number;
  startRowIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BoardDiagram({
  cols = 10,
  rows = 10,
  fileLabels,
  rankLabels,
  pieces = [],
  highlights = [],
  arrows = [],
  caption,
  subCaption,
  showNumbers = false,
  startColIndex = 0,
  startRowIndex = 0,
  size = 'md',
  className = '',
}: BoardDiagramProps) {
  // Standart ustun va qator nomlari
  const effectiveFiles =
    fileLabels ||
    (cols === 10
      ? [...FILES]
      : Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i + startColIndex)));

  const effectiveRanks =
    rankLabels ||
    Array.from({ length: rows }, (_, i) => startRowIndex + (rows - i));

  // Maxsus o'lcham klasslari
  const maxWidthClass =
    size === 'sm'
      ? 'max-w-[260px]'
      : size === 'lg'
      ? 'max-w-[360px]'
      : 'max-w-[310px]';

  // Svg o'lchamlari va koordinatalari
  const cellSizePercent = 100 / cols;
  const rowHeightPercent = 100 / rows;

  return (
    <div className={`flex flex-col items-center w-full mx-auto select-none ${maxWidthClass} ${className}`}>
      {/* Tashqi ramkali dosqa qutisi */}
      <div className="w-full bg-[#1b2f19]/40 p-1.5 sm:p-2 rounded-2xl border border-[#383531] shadow-xl bg-gradient-to-b from-[#21201d] to-[#1a1917]">
        {/* Yuqori ustun harflari */}
        <div className="flex w-full mb-0.5 items-center">
          <div className="w-4 shrink-0" />
          <div
            className="flex-1 grid text-center font-mono font-black text-[9px] sm:text-[10px] text-[#f5b041]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {effectiveFiles.map((f, idx) => (
              <span key={idx} className="opacity-90">
                {f}
              </span>
            ))}
          </div>
          <div className="w-1 shrink-0" />
        </div>

        {/* Asosiy doska maydoni */}
        <div className="flex items-stretch w-full">
          {/* Chap qator raqamlari */}
          <div className="flex flex-col justify-between w-4 shrink-0 text-center font-mono font-bold text-[9px] sm:text-[10px] text-[#9b9893]">
            {effectiveRanks.map((r, idx) => (
              <span key={idx} className="flex-1 flex items-center justify-center">
                {r}
              </span>
            ))}
          </div>

          {/* Doska kataklari (Grid) */}
          <div
            className="relative flex-1 rounded-lg overflow-hidden border-2 border-[#45423c] shadow-inner bg-[#262421]"
            style={{
              aspectRatio: `${cols} / ${rows}`,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: rows }).map((_, rIdx) => {
              // Haqiqiy rank index (pastdan yuqoriga: 0 pastki qator)
              const rank = rows - 1 - rIdx + startRowIndex;

              return Array.from({ length: cols }).map((_, cIdx) => {
                const file = cIdx + startColIndex;
                const isLight = (rank + file) % 2 !== 0;

                // Shu katakdagi figura
                const piece = pieces.find((p) => p.file === file && p.rank === rank);

                // Shu katakdagi highlight (harakat nuqtasi)
                const hl = highlights.find((h) => h.file === file && h.rank === rank);

                // 1..100 raqamli indeks (agar kerak bo'lsa)
                const numLabel = rank * 10 + file + 1;

                return (
                  <div
                    key={`${file}-${rank}`}
                    className={`relative flex items-center justify-center ${
                      isLight ? 'bg-[#ffff85]' : 'bg-[#ff9d7a]'
                    }`}
                  >
                    {/* 1..100 Raqamli notatsiya belgisi */}
                    {showNumbers && (
                      <span className="absolute top-0.5 left-0.5 text-[7px] font-mono font-bold opacity-35 text-slate-900 pointer-events-none">
                        {numLabel}
                      </span>
                    )}

                    {/* Highlight: Harakat/Zarba/Sakrash belgilari */}
                    {hl && (
                      <>
                        {hl.type === 'move' && (
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#81b64c] shadow-[0_0_8px_#81b64c] border border-white/80 z-10 animate-pulse" />
                        )}

                        {hl.type === 'capture' && (
                          <div className="absolute inset-0.5 rounded-full border-2 border-red-500 bg-red-500/30 z-10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_red]" />
                          </div>
                        )}

                        {hl.type === 'jump' && (
                          <div className="absolute inset-0.5 rounded-lg border-2 border-amber-400 bg-amber-400/30 z-10 flex items-center justify-center shadow-[0_0_10px_rgba(245,176,65,0.7)]">
                            <span className="text-[9px] font-black text-amber-950 bg-amber-300 px-0.5 rounded shadow">
                              ⚡
                            </span>
                          </div>
                        )}

                        {hl.type === 'from' && (
                          <div className="absolute inset-0 bg-yellow-400/40 border-2 border-amber-500 z-5" />
                        )}

                        {hl.type === 'check' && (
                          <div className="absolute inset-0 bg-red-600/50 animate-ping z-5" />
                        )}

                        {hl.badge && (
                          <span className="absolute -top-1 -right-1 z-20 bg-amber-500 text-slate-950 font-black text-[8px] px-1 rounded-full shadow">
                            {hl.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Figura ikonkasi */}
                    {piece && (
                      <div
                        className={`w-full h-full flex items-center justify-center z-15 ${
                          piece.isGhost ? 'opacity-40 grayscale' : ''
                        }`}
                      >
                        <PieceIcon
                          type={piece.type}
                          color={piece.color}
                          size="85%"
                        />
                      </div>
                    )}
                  </div>
                );
              });
            })}

            {/* SVG Strelkalar Qatlami (Arched va Straight Arrows) */}
            {arrows.length > 0 && (
              <svg
                viewBox={`0 0 ${cols * 100} ${rows * 100}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible"
              >
                <defs>
                  <marker
                    id="arrowhead-green"
                    markerWidth="22"
                    markerHeight="22"
                    refX="18"
                    refY="11"
                    orient="auto"
                  >
                    <polygon points="0 3, 20 11, 0 19" fill="#81b64c" />
                  </marker>
                  <marker
                    id="arrowhead-amber"
                    markerWidth="22"
                    markerHeight="22"
                    refX="18"
                    refY="11"
                    orient="auto"
                  >
                    <polygon points="0 3, 20 11, 0 19" fill="#f5b041" />
                  </marker>
                  <marker
                    id="arrowhead-cyan"
                    markerWidth="22"
                    markerHeight="22"
                    refX="18"
                    refY="11"
                    orient="auto"
                  >
                    <polygon points="0 3, 20 11, 0 19" fill="#06b6d4" />
                  </marker>
                  <marker
                    id="arrowhead-red"
                    markerWidth="22"
                    markerHeight="22"
                    refX="18"
                    refY="11"
                    orient="auto"
                  >
                    <polygon points="0 3, 20 11, 0 19" fill="#ef4444" />
                  </marker>
                </defs>

                {arrows.map((arr, aIdx) => {
                  const x1 = (arr.from.file - startColIndex + 0.5) * 100;
                  const y1 = (rows - 1 - (arr.from.rank - startRowIndex) + 0.5) * 100;
                  const x2 = (arr.to.file - startColIndex + 0.5) * 100;
                  const y2 = (rows - 1 - (arr.to.rank - startRowIndex) + 0.5) * 100;

                  const color = arr.color || '#81b64c';
                  const markerId =
                    color.includes('f5b041') || color.includes('amber')
                      ? 'url(#arrowhead-amber)'
                      : color.includes('cyan') || color.includes('06b6d4')
                      ? 'url(#arrowhead-cyan)'
                      : color.includes('red') || color.includes('ef4444')
                      ? 'url(#arrowhead-red)'
                      : 'url(#arrowhead-green)';

                  if (arr.curve) {
                    // Egri sakrash chizig'i (Jump arc)
                    const midX = (x1 + x2) / 2;
                    const dist = Math.abs(x2 - x1);
                    const defaultHeight = Math.min(rows * 60, Math.max(50, dist * 0.38));
                    const arcH = arr.curveHeight ? arr.curveHeight * 10 : defaultHeight;
                    const midY = Math.min(y1, y2) - arcH;
                    const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

                    return (
                      <g key={aIdx}>
                        <path
                          d={pathData}
                          fill="none"
                          stroke={color}
                          strokeWidth="14"
                          strokeDasharray="18,10"
                          markerEnd={markerId}
                          strokeLinecap="round"
                        />
                        {arr.label && (
                          <text
                            x={midX}
                            y={midY - 14}
                            textAnchor="middle"
                            fill={color}
                            fontSize="26"
                            fontWeight="bold"
                            style={{
                              paintOrder: 'stroke fill',
                              stroke: '#0f172a',
                              strokeWidth: 6,
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                            }}
                          >
                            {arr.label}
                          </text>
                        )}
                      </g>
                    );
                  }

                  return (
                    <g key={aIdx}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth="14"
                        markerEnd={markerId}
                        strokeLinecap="round"
                      />
                      {arr.label && (
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 - 16}
                          textAnchor="middle"
                          fill={color}
                          fontSize="26"
                          fontWeight="bold"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#0f172a',
                            strokeWidth: 6,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                          }}
                        >
                          {arr.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Rasm tagidagi izoh / sarlavha */}
      {(caption || subCaption) && (
        <div className="w-full mt-2 px-1 text-center">
          {caption && (
            <p className="text-xs font-bold text-amber-300/95 leading-tight flex items-center justify-center gap-1">
              <span>📷</span>
              <span>{caption}</span>
            </p>
          )}
          {subCaption && (
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              {subCaption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
