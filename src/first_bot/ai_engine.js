/**
 * NUR CHESS 100 - Professional AI Search Engine
 * - Opening Book (Debyutlar kutubxonasi)
 * - Minimax + Alpha-Beta Pruning
 * - Iterative Deepening
 * - Check Extension (Shax holatida chuqurroq hisoblash)
 * - Quiescence Search
 * - Transposition Table (Zobrist 64-bit)
 * - Advanced Move Ordering (PV, MVV-LVA, Killer Moves, History)
 */

import {
    WHITE, BLACK,
    PIECE_PAWN, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR, PIECE_ROOK, PIECE_QUEEN, PIECE_KING,
    PIECE_VALUES
} from './board_constants.js';
import { Zobrist } from './zobrist.js';
import { evaluateBoard } from './evaluation.js';
import { findBookMove } from './opening_book.js';

export class AIEngine {
    constructor(board, aiLevel = 3) {
        this.board = board;
        this.aiLevel = aiLevel;
        this.zobrist = new Zobrist();
        this.transpositionTable = new Map();
        this.killerMoves = new Map(); // ply -> [move1, move2]
        this.historyTable = new Map();
        this.nodesEvaluated = 0;
        this.stopSearch = false;
    }

    resetTables() {
        this.transpositionTable.clear();
        this.killerMoves.clear();
        this.historyTable.clear();
    }

    scoreMove(move, ttMove, ply) {
        // 1. TT PV move
        if (ttMove && move.equals(ttMove)) return 10000000;

        let score = 0;

        // 2. MVV-LVA Captures (1,000,000+ shunda hech qanday tinch yurish urishdan ustun bo'lolmaydi)
        if (move.captured) {
            const victimVal = PIECE_VALUES[move.captured.type];
            const attackerVal = PIECE_VALUES[move.piece.type];
            score += 1000000 + (victimVal * 10 - attackerVal);
        }

        // 3. Promotion
        if (move.promotion) {
            score += 900000 + PIECE_VALUES[move.promotion];
        }

        // 4. Markazni nazorat qilish (D, E, M, N ustunlari)
        const [toF, toR] = move.toSq;
        if (toF >= 3 && toF <= 6 && toR >= 3 && toR <= 6) {
            score += 30;
        }

        // 5. NUR faolligi va sakrab hujum
        if (move.piece.type === PIECE_NUR) {
            score += 100;
        }

        // 6. Rokirovka (Shoh xavfsizligi)
        if (move.castlingType) {
            score += 300;
        }

        // 7. Killer moves
        const killers = this.killerMoves.get(ply);
        if (killers && killers.some(k => move.equals(k))) {
            score += 500;
        }

        // 8. History heuristic (500 ball bilan cheklangan, urishlardan oshib ketmaydi)
        const hKey = `${move.fromSq[0]},${move.fromSq[1]},${move.toSq[0]},${move.toSq[1]}`;
        const hVal = this.historyTable.get(hKey) || 0;
        score += Math.min(hVal, 500);

        return score;
    }

    orderMoves(moves, ttMove, ply) {
        return moves.slice().sort((a, b) => this.scoreMove(b, ttMove, ply) - this.scoreMove(a, ttMove, ply));
    }

    quiescenceSearch(alpha, beta, maxQDepth = 3, deadline = 0) {
        this.nodesEvaluated++;
        if (this.stopSearch || (deadline > 0 && Date.now() > deadline)) {
            this.stopSearch = true;
            let standPat = evaluateBoard(this.board, this.aiLevel);
            if (this.board.turn === BLACK) standPat = -standPat;
            return standPat;
        }

        let standPat = evaluateBoard(this.board, this.aiLevel);
        if (this.board.turn === BLACK) standPat = -standPat;

        if (maxQDepth <= 0) return standPat;
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;

        const captures = this.board.getCapturesOnly
            ? this.board.getCapturesOnly(this.board.turn)
            : this.board.getLegalMoves().filter(m => m.captured !== null || m.promotion !== null);
        if (captures.length === 0) return standPat;

        // Quiescence search ichida barcha urishlar to'liq ko'riladi, bitta ham urish chetda qolmaydi!
        const ordered = this.orderMoves(captures, null, 0);

        const savedRights = this.board.cloneCastlingRights();
        for (const move of ordered) {
            if (this.stopSearch || (deadline > 0 && Date.now() > deadline)) {
                this.stopSearch = true;
                break;
            }
            this.board.makeMove(move);
            const score = -this.quiescenceSearch(-beta, -alpha, maxQDepth - 1, deadline);
            this.board.undoMove(savedRights);

            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }

        return alpha;
    }

    alphaBeta(depth, alpha, beta, ply, deadline) {
        if (this.stopSearch || Date.now() > deadline) {
            this.stopSearch = true;
            return [0, null];
        }

        this.nodesEvaluated++;
        const inCheck = this.board.isInCheck(this.board.turn);

        // Check Extension: Faqat ply < 3 bo'lgandagina va 1 marta chuqurroq hisoblash (cheksiz rekursiya yo'qotildi!)
        if (inCheck && depth === 0 && ply < 3) {
            depth = 1;
        }

        const hashKey = this.zobrist.hashBoard(this.board.grid, this.board.turn);

        let ttMove = null;
        const entry = this.transpositionTable.get(hashKey);
        if (entry) {
            ttMove = entry.bestMove;
            if (entry.depth >= depth) {
                if (entry.flag === 'EXACT') return [entry.score, entry.bestMove];
                else if (entry.flag === 'LOWERBOUND' && entry.score > alpha) alpha = entry.score;
                else if (entry.flag === 'UPPERBOUND' && entry.score < beta) beta = entry.score;
                if (alpha >= beta) return [entry.score, entry.bestMove];
            }
        }

        if (depth === 0) {
            const qScore = this.quiescenceSearch(alpha, beta, 3, deadline);
            return [qScore, null];
        }

        const legalMoves = this.board.getLegalMoves();
        if (legalMoves.length === 0) {
            if (inCheck) {
                return [-50000 + ply, null]; // Mat
            }
            return [0, null]; // Pat
        }

        const orderedMoves = this.orderMoves(legalMoves, ttMove, ply);
        // Root da (ply === 0) hech qachon yurishlar qirqilmaydi — barcha yurishlar to'liq tekshiriladi!
        // Ichki tugunlarda esa barcha urishlar va eng kuchli tinch yurishlar ko'riladi.
        const searchMoves = ply === 0 
            ? orderedMoves 
            : (depth >= 4 ? orderedMoves.slice(0, 36) : orderedMoves);
        let bestMove = searchMoves[0];
        let bestScore = -999999;
        const savedRights = this.board.cloneCastlingRights();

        for (const move of searchMoves) {
            this.board.makeMove(move);
            const [rawScore] = this.alphaBeta(depth - 1, -beta, -alpha, ply + 1, deadline);
            const score = -rawScore;
            this.board.undoMove(savedRights);

            if (this.stopSearch) return [0, null];

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            if (score > alpha) alpha = score;

            if (alpha >= beta) {
                if (!move.captured) {
                    if (!this.killerMoves.has(ply)) this.killerMoves.set(ply, []);
                    const km = this.killerMoves.get(ply);
                    if (!km.some(k => move.equals(k))) {
                        km.unshift(move);
                        if (km.length > 2) km.pop();
                    }

                    const hKey = `${move.fromSq[0]},${move.fromSq[1]},${move.toSq[0]},${move.toSq[1]}`;
                    this.historyTable.set(hKey, (this.historyTable.get(hKey) || 0) + depth * depth);
                }
                break;
            }
        }

        let flag = 'EXACT';
        if (bestScore <= alpha) flag = 'UPPERBOUND';
        else if (bestScore >= beta) flag = 'LOWERBOUND';

        this.transpositionTable.set(hashKey, {
            depth,
            score: bestScore,
            bestMove,
            flag
        });

        return [bestScore, bestMove];
    }

    async getBestMoveAsync(maxDepth = 3, timeLimitMs = 2500, onProgress = null, aiLevel = 3) {
        this.nodesEvaluated = 0;
        this.stopSearch = false;
        this.aiLevel = aiLevel;
        const startTime = Date.now();

        const legalMoves = this.board.getLegalMoves();
        if (legalMoves.length === 0) return null;

        // 1. Debyutlar kitobini tekshirish (faqat doskada shax yoki tekin o'lja bo'lmaganda)
        const inCheck = this.board.isInCheck(this.board.turn);
        if (!inCheck) {
            const bookMoveObj = findBookMove(this.board.moveHistory);
            if (bookMoveObj) {
                const matchedLegal = legalMoves.find(m => 
                    m.fromSq[0] === bookMoveObj.from[0] && m.fromSq[1] === bookMoveObj.from[1] &&
                    m.toSq[0] === bookMoveObj.to[0] && m.toSq[1] === bookMoveObj.to[1]
                );
                if (matchedLegal) {
                    const freeMajorCaptures = legalMoves.filter(m => m.captured && 
                        (m.captured.type === PIECE_QUEEN || m.captured.type === PIECE_ROOK || m.captured.type === PIECE_NUR || m.captured.type === PIECE_KNIGHT || m.captured.type === PIECE_BISHOP)
                    );
                    if (freeMajorCaptures.length === 0 || matchedLegal.captured) {
                        if (onProgress) {
                            onProgress({
                                depth: 1,
                                score: 0,
                                move: matchedLegal,
                                nodes: 1,
                                timeMs: Date.now() - startTime,
                                isBook: true
                            });
                        }
                        return {
                            move: matchedLegal,
                            score: 0,
                            nodes: 1,
                            timeMs: Date.now() - startTime
                        };
                    }
                }
            }
        }

        // 2. Iterative Deepening (Standart Alpha-Beta Minimax)
        const deadline = startTime + timeLimitMs;
        let bestOverallMove = legalMoves[0];
        let bestOverallScore = 0;

        for (let d = 1; d <= maxDepth; d++) {
            if (this.stopSearch || Date.now() >= deadline) break;
            const [score, move] = this.alphaBeta(d, -1000000, 1000000, 0, deadline);
            if (this.stopSearch && d > 1) break;

            if (move) {
                bestOverallMove = move;
                bestOverallScore = score;
            }

            const elapsed = Date.now() - startTime;
            if (onProgress) {
                onProgress({
                    depth: d,
                    score: bestOverallScore,
                    move: bestOverallMove,
                    nodes: this.nodesEvaluated,
                    timeMs: elapsed,
                    isBook: false
                });
            }

            if (Math.abs(score) > 40000) break; // Mat topildi
            if (Date.now() >= deadline) break;

            // UI silliq ishlashi uchun har chuqurlikdan so'ng event loopga ozgina nafas beriladi
            await new Promise(res => setTimeout(res, 5));
        }

        return {
            move: bestOverallMove,
            score: bestOverallScore,
            nodes: this.nodesEvaluated,
            timeMs: Date.now() - startTime
        };
    }

    getBestMoveSync(maxDepth = 3, timeLimitMs = 1500, aiLevel = 3) {
        this.nodesEvaluated = 0;
        this.stopSearch = false;
        this.aiLevel = aiLevel;
        const startTime = Date.now();

        const legalMoves = this.board.getLegalMoves();
        if (legalMoves.length === 0) return null;

        // 1. Debyutlar kitobini tekshirish
        const inCheck = this.board.isInCheck(this.board.turn);
        if (!inCheck) {
            const bookMoveObj = findBookMove(this.board.moveHistory);
            if (bookMoveObj) {
                const matchedLegal = legalMoves.find(m => 
                    m.fromSq[0] === bookMoveObj.from[0] && m.fromSq[1] === bookMoveObj.from[1] &&
                    m.toSq[0] === bookMoveObj.to[0] && m.toSq[1] === bookMoveObj.to[1]
                );
                if (matchedLegal) {
                    const freeMajorCaptures = legalMoves.filter(m => m.captured && 
                        (m.captured.type === PIECE_QUEEN || m.captured.type === PIECE_ROOK || m.captured.type === PIECE_NUR || m.captured.type === PIECE_KNIGHT || m.captured.type === PIECE_BISHOP)
                    );
                    if (freeMajorCaptures.length === 0 || matchedLegal.captured) {
                        return {
                            move: matchedLegal,
                            score: 0,
                            nodes: 1,
                            timeMs: Date.now() - startTime
                        };
                    }
                }
            }
        }

        // 2. Iterative Deepening
        const deadline = startTime + timeLimitMs;
        let bestOverallMove = legalMoves[0];
        let bestOverallScore = 0;

        for (let d = 1; d <= maxDepth; d++) {
            const [score, move] = this.alphaBeta(d, -1000000, 1000000, 0, deadline);
            if (this.stopSearch && d > 1) break;

            if (move) {
                bestOverallMove = move;
                bestOverallScore = score;
            }

            if (Math.abs(score) > 40000) break;
            if (Date.now() >= deadline) break;
        }

        return {
            move: bestOverallMove,
            score: bestOverallScore,
            nodes: this.nodesEvaluated,
            timeMs: Date.now() - startTime
        };
    }
}
