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

import { WHITE, BLACK, PIECE_VALUES, PIECE_NUR } from './board_constants.js';
import { Zobrist } from './zobrist.js';
import { evaluateBoard } from './evaluation.js';
import { findBookMove } from './opening_book.js';

export class AIEngine {
    constructor(board) {
        this.board = board;
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
        if (ttMove && move.equals(ttMove)) return 1000000;

        let score = 0;

        // 2. MVV-LVA Captures
        if (move.captured) {
            const victimVal = PIECE_VALUES[move.captured.type];
            const attackerVal = PIECE_VALUES[move.piece.type];
            score += 10000 + (victimVal * 10 - attackerVal);
        }

        // 3. Promotion
        if (move.promotion) {
            score += 9000 + PIECE_VALUES[move.promotion];
        }

        // 4. NUR faolligi va sakrab hujum
        if (move.piece.type === PIECE_NUR) {
            score += 200;
        }

        // 5. Rokirovka (Shoh xavfsizligi)
        if (move.castlingType) {
            score += 400;
        }

        // 6. Killer moves
        const killers = this.killerMoves.get(ply);
        if (killers && killers.some(k => move.equals(k))) {
            score += 600;
        }

        // 7. History heuristic
        const hKey = `${move.fromSq[0]},${move.fromSq[1]},${move.toSq[0]},${move.toSq[1]}`;
        score += this.historyTable.get(hKey) || 0;

        return score;
    }

    orderMoves(moves, ttMove, ply) {
        return moves.slice().sort((a, b) => this.scoreMove(b, ttMove, ply) - this.scoreMove(a, ttMove, ply));
    }

    quiescenceSearch(alpha, beta, maxQDepth = 2, deadline = 0) {
        this.nodesEvaluated++;
        if (this.stopSearch || (deadline > 0 && Date.now() > deadline)) {
            this.stopSearch = true;
            let standPat = evaluateBoard(this.board);
            if (this.board.turn === BLACK) standPat = -standPat;
            return standPat;
        }

        let standPat = evaluateBoard(this.board);
        if (this.board.turn === BLACK) standPat = -standPat;

        if (maxQDepth <= 0) return standPat;
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;

        const legalMoves = this.board.getLegalMoves();
        const captures = legalMoves.filter(m => m.captured !== null || m.promotion !== null);
        if (captures.length === 0) return standPat;

        // 10x10 doskada hisoblash portlashining oldini olish uchun ko'pi bilan 8 ta eng yaxshi urish ko'riladi
        const ordered = this.orderMoves(captures, null, 0).slice(0, 8);

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

        // Check Extension: Faqat ply < 3 bo'lgandagina va 1 marta chuqurlashtiriladi (cheksiz rekursiya yo'qotildi!)
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
            const qScore = this.quiescenceSearch(alpha, beta, 2, deadline);
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
        // Katta 100 katakli doskada ortiqcha shoxlanish va brauzer qotishini to'xtatish
        const searchMoves = depth >= 3 ? orderedMoves.slice(0, 16) : orderedMoves;
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

    async getBestMoveAsync(maxDepth = 3, timeLimitMs = 2500, onProgress = null) {
        this.nodesEvaluated = 0;
        this.stopSearch = false;
        const startTime = Date.now();

        const legalMoves = this.board.getLegalMoves();
        if (legalMoves.length === 0) return null;

        // 1. Debyutlar kitobini tekshirish (Opening Book)
        const bookMoveObj = findBookMove(this.board.moveHistory);
        if (bookMoveObj) {
            const matchedLegal = legalMoves.find(m => 
                m.fromSq[0] === bookMoveObj.from[0] && m.fromSq[1] === bookMoveObj.from[1] &&
                m.toSq[0] === bookMoveObj.to[0] && m.toSq[1] === bookMoveObj.to[1]
            );
            if (matchedLegal) {
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

        // 2. Iterative Deepening
        const deadline = startTime + timeLimitMs;
        let bestOverallMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
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

            // UI qotib qolmasligi uchun har chuqurlikdan keyin brauzer event loopiga nafas beriladi
            await new Promise(res => setTimeout(res, 10));
        }

        return {
            move: bestOverallMove,
            score: bestOverallScore,
            nodes: this.nodesEvaluated,
            timeMs: Date.now() - startTime
        };
    }

    getBestMoveSync(maxDepth = 3, timeLimitMs = 1500) {
        this.nodesEvaluated = 0;
        this.stopSearch = false;
        const startTime = Date.now();

        const legalMoves = this.board.getLegalMoves();
        if (legalMoves.length === 0) return null;

        // 1. Debyutlar kitobini tekshirish (Opening Book)
        const bookMoveObj = findBookMove(this.board.moveHistory);
        if (bookMoveObj) {
            const matchedLegal = legalMoves.find(m => 
                m.fromSq[0] === bookMoveObj.from[0] && m.fromSq[1] === bookMoveObj.from[1] &&
                m.toSq[0] === bookMoveObj.to[0] && m.toSq[1] === bookMoveObj.to[1]
            );
            if (matchedLegal) {
                return {
                    move: matchedLegal,
                    score: 0,
                    nodes: 1,
                    timeMs: Date.now() - startTime
                };
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
