/**
 * NUR CHESS 100 - Professional Grandmaster Evaluation Engine
 * Yuqori darajadagi shaxmat tahlili:
 * - Material va 10x10 Piece-Square Tables (PST)
 * - NUR maxsus taktikasi: Vilkalar (Dual Fork), Sakrab Shohga hujum, Markaziy ustunlik
 * - Shoh xavfsizligi (King Ring xavf hududi, piyoda qalqoni, ochiq yo'llar)
 * - O'tkinchi piyodalar (Passed Pawns) kuchi
 * - Himoyasiz (osilgan) figuralarni jazolash
 * - Rokirovka va rivojlanish bonusi
 */

import {
    WHITE, BLACK,
    PIECE_PAWN, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR, PIECE_ROOK, PIECE_QUEEN, PIECE_KING,
    PIECE_VALUES, PST_PAWN, PST_KNIGHT, PST_BISHOP, PST_NUR, PST_ROOK, PST_QUEEN, PST_KING_MID
} from './board_constants.js';

export function evaluateBoard(board, aiLevel = 3) {
    let score = 0;
    const whiteKingPos = board.findKing(WHITE);
    const blackKingPos = board.findKing(BLACK);

    // Oq va qora piyodalar ustunlari (o'tkinchi piyodalarni aniqlash uchun)
    const whitePawnFiles = Array(10).fill(-1); // eng oldindagi rank
    const blackPawnFiles = Array(10).fill(10);

    for (let r = 0; r < 10; r++) {
        for (let f = 0; f < 10; f++) {
            const p = board.grid[r][f];
            if (p && p.type === PIECE_PAWN) {
                if (p.color === WHITE) {
                    if (r > whitePawnFiles[f]) whitePawnFiles[f] = r;
                } else {
                    if (r < blackPawnFiles[f]) blackPawnFiles[f] = r;
                }
            }
        }
    }

    // Har bir figura bo'yicha chuqur tahlil
    for (let r = 0; r < 10; r++) {
        for (let f = 0; f < 10; f++) {
            const p = board.grid[r][f];
            if (!p) continue;

            const baseVal = PIECE_VALUES[p.type];
            let pstVal = 0;
            const pstR = p.color === WHITE ? r : (9 - r);

            switch (p.type) {
                case PIECE_PAWN:
                    pstVal = PST_PAWN[pstR][f];

                    // O'tkinchi piyoda (Passed Pawn) tahlili
                    if (p.color === WHITE) {
                        let isPassed = true;
                        for (let adjF = Math.max(0, f - 1); adjF <= Math.min(9, f + 1); adjF++) {
                            if (blackPawnFiles[adjF] > r && blackPawnFiles[adjF] < 10) {
                                isPassed = false;
                                break;
                            }
                        }
                        if (isPassed && r >= 4) {
                            // 5, 6, 7, 8, 9 qatorlardagi o'tkinchi piyoda g'alaba kalitidir
                            pstVal += (r - 3) * (r - 3) * 15;
                        }
                    } else {
                        let isPassed = true;
                        for (let adjF = Math.max(0, f - 1); adjF <= Math.min(9, f + 1); adjF++) {
                            if (blackPawnFiles[adjF] < r) {
                                isPassed = false;
                                break;
                            }
                        }
                        if (isPassed && r <= 5) {
                            pstVal += (6 - r) * (6 - r) * 15;
                        }
                    }
                    break;

                case PIECE_KNIGHT:
                    pstVal = PST_KNIGHT[pstR][f];
                    break;

                case PIECE_BISHOP:
                    pstVal = PST_BISHOP[pstR][f];
                    break;

                case PIECE_NUR:
                    pstVal = PST_NUR[pstR][f];

                    // ===================================================
                    // NUR PRO TAKTIK TAHLILI (Eng kuchli yutish quroli)
                    // ===================================================
                    const enemyKing = p.color === WHITE ? blackKingPos : whiteKingPos;
                    if (enemyKing) {
                        const distToKing = Math.abs(f - enemyKing[0]) + Math.abs(r - enemyKing[1]);
                        if (distToKing <= 3) {
                            pstVal += 50; // Bevosita 1 sakrash masofasida
                        } else if (distToKing <= 5) {
                            pstVal += 25;
                        }
                    }

                    // NUR Vilkasi (Dual Fork / Multiple Threats) — faqat Usta va Grosmeyster (aiLevel >= 3)
                    if (aiLevel >= 3) {
                        let forkTargets = 0;
                        let royalTarget = false; // Shoh yoki Farzinga tahdid
                        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                        for (const [df, dr] of dirs) {
                            for (let d = 1; d <= 3; d++) {
                                const tf = f + df * d;
                                const tr = r + dr * d;
                                if (board.isInside(tf, tr)) {
                                    const target = board.grid[tr][tf];
                                    if (target && target.color !== p.color) {
                                        forkTargets++;
                                        if (target.type === PIECE_KING || target.type === PIECE_QUEEN) {
                                            royalTarget = true;
                                            pstVal += 15;
                                        } else if (target.type === PIECE_ROOK || target.type === PIECE_NUR) {
                                            pstVal += 10;
                                        }
                                    }
                                }
                            }
                        }
                        if (forkTargets >= 2) {
                            pstVal += royalTarget ? 35 : 20;
                        }
                    }
                    break;

                case PIECE_ROOK:
                    pstVal = PST_ROOK[pstR][f];
                    // Ochiq vertikal
                    if (whitePawnFiles[f] === -1 && blackPawnFiles[f] === 10) {
                        pstVal += 30;
                    }
                    break;

                case PIECE_QUEEN:
                    pstVal = PST_QUEEN[pstR][f];
                    // Farzin markaziy xavfsizlikda kuchli
                    break;

                case PIECE_KING:
                    pstVal = PST_KING_MID[pstR][f];
                    // Shoh qalqoni: Shoh oldidagi piyodalar mavjudligi
                    if (p.color === WHITE && r <= 1) {
                        for (let kf = Math.max(0, f - 1); kf <= Math.min(9, f + 1); kf++) {
                            const shield = board.grid[1][kf];
                            if (shield && shield.color === WHITE && shield.type === PIECE_PAWN) {
                                pstVal += 15;
                            }
                        }
                    } else if (p.color === BLACK && r >= 8) {
                        for (let kf = Math.max(0, f - 1); kf <= Math.min(9, f + 1); kf++) {
                            const shield = board.grid[8][kf];
                            if (shield && shield.color === BLACK && shield.type === PIECE_PAWN) {
                                pstVal += 15;
                            }
                        }
                    }
                    break;
            }

            // ===================================================
            // NOZIK XATOLARNI OLDINI OLISH: HIMOYASIZ VA OSILGAN FIGURALARNI JAZOLASH
            // ===================================================
            if (p.type !== PIECE_KING) {
                const isAttacked = board.isSquareAttacked(f, r, p.color);
                if (isAttacked) {
                    const friendlyColor = p.color === WHITE ? BLACK : WHITE;
                    const isDefended = board.isSquareAttacked(f, r, friendlyColor);
                    if (!isDefended) {
                        // Butunlay himoyasiz va dushman zarbasi ostida!
                        let hangPenalty = 0;
                        switch (p.type) {
                            case PIECE_QUEEN: hangPenalty = 380; break;
                            case PIECE_NUR: hangPenalty = 280; break;
                            case PIECE_ROOK: hangPenalty = 210; break;
                            case PIECE_BISHOP:
                            case PIECE_KNIGHT: hangPenalty = 130; break;
                            case PIECE_PAWN: hangPenalty = 40; break;
                        }
                        pstVal -= hangPenalty;
                    } else if (p.type !== PIECE_PAWN) {
                        // Himoyalangan, lekin arzonroq dushman piyodasi hujum qilayotgan bo'lsa
                        const enemyPawnRank = r + (p.color === WHITE ? 1 : -1);
                        if (enemyPawnRank >= 0 && enemyPawnRank < 10) {
                            const enemyColor = p.color === WHITE ? BLACK : WHITE;
                            const leftPawn = f > 0 ? board.grid[enemyPawnRank][f - 1] : null;
                            const rightPawn = f < 9 ? board.grid[enemyPawnRank][f + 1] : null;
                            if ((leftPawn && leftPawn.color === enemyColor && leftPawn.type === PIECE_PAWN) ||
                                (rightPawn && rightPawn.color === enemyColor && rightPawn.type === PIECE_PAWN)) {
                                let pawnThreatPenalty = 0;
                                switch (p.type) {
                                    case PIECE_QUEEN: pawnThreatPenalty = 220; break;
                                    case PIECE_NUR: pawnThreatPenalty = 180; break;
                                    case PIECE_ROOK: pawnThreatPenalty = 140; break;
                                    case PIECE_BISHOP:
                                    case PIECE_KNIGHT: pawnThreatPenalty = 80; break;
                                }
                                pstVal -= pawnThreatPenalty;
                            }
                        }
                    }
                }
            }

            // Oq va Qora botlar uchun o'ziga xos strategik uslub (2 bot bir xil bo'lmasligi uchun)
            if (p.color === WHITE) {
                // Oq Bot: Markaziy bosim va tashabbus (E, D, N, M markazida faollik)
                if (f >= 3 && f <= 6 && r >= 3 && r <= 6) {
                    pstVal += 6;
                }
            } else {
                // Qora Bot: Qanot qarshi zarbasi va mustahkam figura muvozanati
                if ((f <= 2 || f >= 7) && r >= 5 && r <= 7 && (p.type === PIECE_KNIGHT || p.type === PIECE_BISHOP)) {
                    pstVal += 6;
                }
            }

            const totalPieceVal = baseVal + pstVal;
            if (p.color === WHITE) {
                score += totalPieceVal;
            } else {
                score -= totalPieceVal;
            }
        }
    }

    // Shoh xavfsizligi va shax jazolari
    if (board.isInCheck(WHITE)) score -= 80;
    if (board.isInCheck(BLACK)) score += 80;

    // Rokirovka qilinganlik bonusi
    if (board.castlingRights[WHITE].castled) score += 60;
    if (board.castlingRights[BLACK].castled) score -= 60;

    // Har xil o'yinlar uchun nozik xilma-xillik (Jitter) — 2 bot 1 xil o'ynamasligi uchun
    if (aiLevel <= 2) {
        score += (Math.random() * 16 - 8);
    } else if (aiLevel === 3) {
        score += (Math.random() * 8 - 4);
    }

    return score;
}
