/**
 * NUR CHESS 100 - Move Generator va Qoidalar Dvigateli
 */

import {
    FILES, WHITE, BLACK,
    PIECE_PAWN, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR, PIECE_ROOK, PIECE_QUEEN, PIECE_KING,
    coordToStr
} from './board_constants.js';

export class Piece {
    constructor(color, type) {
        this.color = color;
        this.type = type;
    }
}

export class Move {
    constructor(fromSq, toSq, piece, captured = null, promotion = null, castlingType = null) {
        this.fromSq = fromSq; // [file, rank]
        this.toSq = toSq;     // [file, rank]
        this.piece = piece;
        this.captured = captured;
        this.promotion = promotion;
        this.castlingType = castlingType; // 'short', 'long', 'middle'
    }

    equals(other) {
        if (!other) return false;
        return (
            this.fromSq[0] === other.fromSq[0] &&
            this.fromSq[1] === other.fromSq[1] &&
            this.toSq[0] === other.toSq[0] &&
            this.toSq[1] === other.toSq[1] &&
            this.promotion === other.promotion &&
            this.castlingType === other.castlingType
        );
    }

    toString() {
        const fromStr = coordToStr(this.fromSq[0], this.fromSq[1]);
        const toStr = coordToStr(this.toSq[0], this.toSq[1]);
        const promo = this.promotion ? `=${this.promotion}` : '';
        const cstl = this.castlingType ? ` (${this.castlingType} castle)` : '';
        return `${this.piece.type}:${fromStr}->${toStr}${promo}${cstl}`;
    }
}

export class Board {
    constructor() {
        this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
        this.turn = WHITE;
        this.castlingRights = {
            [WHITE]: { K_moved: false, R_A_moved: false, R_H_moved: false, castled: false },
            [BLACK]: { K_moved: false, R_A_moved: false, R_H_moved: false, castled: false }
        };
        this.moveHistory = [];
        this.setupInitialPosition();
    }

    setupInitialPosition() {
        for (let r = 0; r < 10; r++) {
            for (let f = 0; f < 10; f++) {
                this.grid[r][f] = null;
            }
        }

        // A=R, B=N, C=B, N=U, E=K, D=Q, M=U, F=B, G=N, H=R
        const firstRank = [
            PIECE_ROOK, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR,
            PIECE_KING, PIECE_QUEEN, PIECE_NUR, PIECE_BISHOP,
            PIECE_KNIGHT, PIECE_ROOK
        ];

        // Rank 1 (Oqlar)
        for (let f = 0; f < 10; f++) {
            this.grid[0][f] = new Piece(WHITE, firstRank[f]);
        }
        // Rank 2 (Oq piyodalar)
        for (let f = 0; f < 10; f++) {
            this.grid[1][f] = new Piece(WHITE, PIECE_PAWN);
        }

        // Rank 10 (Qoralar)
        for (let f = 0; f < 10; f++) {
            this.grid[9][f] = new Piece(BLACK, firstRank[f]);
        }
        // Rank 9 (Qora piyodalar)
        for (let f = 0; f < 10; f++) {
            this.grid[8][f] = new Piece(BLACK, PIECE_PAWN);
        }
    }

    isInside(f, r) {
        return f >= 0 && f < 10 && r >= 0 && r < 10;
    }

    getPiece(f, r) {
        return this.isInside(f, r) ? this.grid[r][f] : null;
    }

    findKing(color) {
        for (let r = 0; r < 10; r++) {
            for (let f = 0; f < 10; f++) {
                const p = this.grid[r][f];
                if (p && p.color === color && p.type === PIECE_KING) {
                    return [f, r];
                }
            }
        }
        return null;
    }

    // ================================================================
    // 5. NUR FIGURASI YURISHLARI (getNurLegalMoves / getNurPseudoMoves)
    // ================================================================
    getNurPseudoMoves(f, r, color) {
        const moves = [];
        const piece = this.grid[r][f];
        if (!piece) return moves;

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [df, dr] of directions) {
            for (let dist = 1; dist <= 3; dist++) {
                const nf = f + df * dist;
                const nr = r + dr * dist;
                if (!this.isInside(nf, nr)) break;

                const target = this.grid[nr][nf];
                if (!target) {
                    moves.push(new Move([f, r], [nf, nr], piece, null));
                } else if (target.color !== color) {
                    moves.push(new Move([f, r], [nf, nr], piece, target));
                } else {
                    // O'z figurasi ustiga qo'na olmaydi, lekin undan sakrab keyingi katakka o'ta oladi
                }
            }
        }
        return moves;
    }

    // ================================================================
    // 6. PIYODA YURISHLARI (1, 2 yoki 3 katak oldinga, promotion)
    // ================================================================
    getPawnPseudoMoves(f, r, color) {
        const moves = [];
        const piece = this.grid[r][f];
        if (!piece) return moves;

        const direction = color === WHITE ? 1 : -1;
        const promotionRank = color === WHITE ? 9 : 0;
        const promoPieces = [PIECE_QUEEN, PIECE_NUR, PIECE_ROOK, PIECE_BISHOP, PIECE_KNIGHT];

        // Piyoda faqat birinchi yurishida (boshlang'ich katagida: Oqlar r=1, Qoralar r=8) 1, 2 yoki 3 katak yura oladi.
        // Keyingi barcha yurishlarda esa qat'iy 1 qadamdan yuradi!
        const isInitialRank = (color === WHITE && r === 1) || (color === BLACK && r === 8);
        const maxForward = isInitialRank ? 3 : 1;

        // Oldinga surilish
        for (let dist = 1; dist <= maxForward; dist++) {
            const nr = r + direction * dist;
            if (!this.isInside(f, nr)) break;
            if (this.grid[nr][f] !== null) break; // Yo'l to'silgan

            if (nr === promotionRank) {
                for (const promo of promoPieces) {
                    moves.push(new Move([f, r], [f, nr], piece, null, promo));
                }
            } else {
                moves.push(new Move([f, r], [f, nr], piece, null));
            }
        }

        // Urish (diagonal)
        for (const df of [-1, 1]) {
            const nf = f + df;
            const nr = r + direction;
            if (this.isInside(nf, nr)) {
                const target = this.grid[nr][nf];
                if (target && target.color !== color) {
                    if (nr === promotionRank) {
                        for (const promo of promoPieces) {
                            moves.push(new Move([f, r], [nf, nr], piece, target, promo));
                        }
                    } else {
                        moves.push(new Move([f, r], [nf, nr], piece, target));
                    }
                }
            }
        }

        return moves;
    }

    getKnightPseudoMoves(f, r, color) {
        const moves = [];
        const piece = this.grid[r][f];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [df, dr] of offsets) {
            const nf = f + df;
            const nr = r + dr;
            if (this.isInside(nf, nr)) {
                const target = this.grid[nr][nf];
                if (!target || target.color !== color) {
                    moves.push(new Move([f, r], [nf, nr], piece, target));
                }
            }
        }
        return moves;
    }

    getSlidingPseudoMoves(f, r, color, directions) {
        const moves = [];
        const piece = this.grid[r][f];
        for (const [df, dr] of directions) {
            for (let dist = 1; dist < 10; dist++) {
                const nf = f + df * dist;
                const nr = r + dr * dist;
                if (!this.isInside(nf, nr)) break;
                const target = this.grid[nr][nf];
                if (!target) {
                    moves.push(new Move([f, r], [nf, nr], piece, null));
                } else {
                    if (target.color !== color) {
                        moves.push(new Move([f, r], [nf, nr], piece, target));
                    }
                    break;
                }
            }
        }
        return moves;
    }

    getBishopPseudoMoves(f, r, color) {
        return this.getSlidingPseudoMoves(f, r, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getRookPseudoMoves(f, r, color) {
        return this.getSlidingPseudoMoves(f, r, color, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    }

    getQueenPseudoMoves(f, r, color) {
        return this.getSlidingPseudoMoves(f, r, color, [
            [1, 1], [1, -1], [-1, 1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ]);
    }

    getKingStandardPseudoMoves(f, r, color) {
        const moves = [];
        const piece = this.grid[r][f];
        for (let df = -1; df <= 1; df++) {
            for (let dr = -1; dr <= 1; dr++) {
                if (df === 0 && dr === 0) continue;
                const nf = f + df;
                const nr = r + dr;
                if (this.isInside(nf, nr)) {
                    const target = this.grid[nr][nf];
                    if (!target || target.color !== color) {
                        moves.push(new Move([f, r], [nf, nr], piece, target));
                    }
                }
            }
        }
        return moves;
    }

    // ================================================================
    // 7. ROKIROVKA — 3 XIL
    // 1. Qisqa: Shoh E(4)->C(2), Rux A(0)->N(3)
    // 2. Uzun: Shoh E(4)->G(8), Rux H(9)->F(7)
    // 3. O'rta: Shoh E(4)->M(6), Rux H(9)->D(5)
    // ================================================================
    getCastlingMoves(color) {
        const moves = [];
        const rights = this.castlingRights[color];
        if (rights.castled || rights.K_moved) return moves;

        const rank = color === WHITE ? 0 : 9;
        const king = this.grid[rank][4];
        if (!king || king.color !== color || king.type !== PIECE_KING) return moves;

        if (this.isSquareAttacked(4, rank, color)) return moves;

        // 1. Qisqa rokirovka
        if (!rights.R_A_moved) {
            const rookA = this.grid[rank][0];
            if (rookA && rookA.color === color && rookA.type === PIECE_ROOK) {
                if (this.grid[rank][1] === null &&
                    this.grid[rank][2] === null &&
                    this.grid[rank][3] === null) {
                    if (!this.isSquareAttacked(3, rank, color) &&
                        !this.isSquareAttacked(2, rank, color)) {
                        moves.push(new Move([4, rank], [2, rank], king, null, null, 'short'));
                    }
                }
            }
        }

        // 2 va 3 uchun Rux H
        if (!rights.R_H_moved) {
            const rookH = this.grid[rank][9];
            if (rookH && rookH.color === color && rookH.type === PIECE_ROOK) {
                const dEmpty = this.grid[rank][5] === null;
                const mEmpty = this.grid[rank][6] === null;
                const fEmpty = this.grid[rank][7] === null;
                const gEmpty = this.grid[rank][8] === null;

                if (dEmpty && mEmpty && fEmpty && gEmpty) {
                    // 2. Uzun rokirovka: Shoh E(4)->G(8), Rux H(9)->F(7)
                    if (!this.isSquareAttacked(5, rank, color) &&
                        !this.isSquareAttacked(6, rank, color) &&
                        !this.isSquareAttacked(7, rank, color) &&
                        !this.isSquareAttacked(8, rank, color)) {
                        moves.push(new Move([4, rank], [8, rank], king, null, null, 'long'));
                    }

                    // 3. O'rta rokirovka: Shoh E(4)->M(6), Rux H(9)->D(5)
                    if (!this.isSquareAttacked(5, rank, color) &&
                        !this.isSquareAttacked(6, rank, color)) {
                        moves.push(new Move([4, rank], [6, rank], king, null, null, 'middle'));
                    }
                }
            }
        }

        return moves;
    }

    isSquareAttacked(f, r, defendingColor) {
        const attackingColor = defendingColor === WHITE ? BLACK : WHITE;

        // 1. Piyoda
        const pawnDir = attackingColor === WHITE ? -1 : 1;
        const attackerRank = r + pawnDir;
        for (const df of [-1, 1]) {
            const af = f + df;
            if (this.isInside(af, attackerRank)) {
                const p = this.grid[attackerRank][af];
                if (p && p.color === attackingColor && p.type === PIECE_PAWN) return true;
            }
        }

        // 2. Ot
        const knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [df, dr] of knightOffsets) {
            const af = f + df;
            const ar = r + dr;
            if (this.isInside(af, ar)) {
                const p = this.grid[ar][af];
                if (p && p.color === attackingColor && p.type === PIECE_KNIGHT) return true;
            }
        }

        // 3. NUR (sakrab o'ta oladi)
        const orthoDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [df, dr] of orthoDirs) {
            for (let dist = 1; dist <= 3; dist++) {
                const af = f + df * dist;
                const ar = r + dr * dist;
                if (!this.isInside(af, ar)) break;
                const p = this.grid[ar][af];
                if (p && p.color === attackingColor && p.type === PIECE_NUR) return true;
            }
        }

        // 4. Fil va Farzin (diagonal)
        const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [df, dr] of diagDirs) {
            for (let dist = 1; dist < 10; dist++) {
                const af = f + df * dist;
                const ar = r + dr * dist;
                if (!this.isInside(af, ar)) break;
                const p = this.grid[ar][af];
                if (p) {
                    if (p.color === attackingColor && (p.type === PIECE_BISHOP || p.type === PIECE_QUEEN)) return true;
                    break;
                }
            }
        }

        // 5. Rux va Farzin (ortogonal)
        for (const [df, dr] of orthoDirs) {
            for (let dist = 1; dist < 10; dist++) {
                const af = f + df * dist;
                const ar = r + dr * dist;
                if (!this.isInside(af, ar)) break;
                const p = this.grid[ar][af];
                if (p) {
                    if (p.color === attackingColor && (p.type === PIECE_ROOK || p.type === PIECE_QUEEN)) return true;
                    break;
                }
            }
        }

        // 6. Shoh
        for (let df = -1; df <= 1; df++) {
            for (let dr = -1; dr <= 1; dr++) {
                if (df === 0 && dr === 0) continue;
                const af = f + df;
                const ar = r + dr;
                if (this.isInside(af, ar)) {
                    const p = this.grid[ar][af];
                    if (p && p.color === attackingColor && p.type === PIECE_KING) return true;
                }
            }
        }

        return false;
    }

    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        return this.isSquareAttacked(kingPos[0], kingPos[1], color);
    }

    cloneCastlingRights() {
        return {
            [WHITE]: { ...this.castlingRights[WHITE] },
            [BLACK]: { ...this.castlingRights[BLACK] }
        };
    }

    makeMove(move) {
        const [ff, fr] = move.fromSq;
        const [tf, tr] = move.toSq;
        const piece = this.grid[fr][ff];
        const color = piece.color;

        this.moveHistory.push(move);

        if (move.castlingType) {
            const rank = fr;
            this.grid[fr][ff] = null;
            this.grid[tr][tf] = piece;
            this.castlingRights[color].K_moved = true;
            this.castlingRights[color].castled = true;

            if (move.castlingType === 'short') {
                const rook = this.grid[rank][0];
                this.grid[rank][0] = null;
                this.grid[rank][3] = rook;
                this.castlingRights[color].R_A_moved = true;
            } else if (move.castlingType === 'long') {
                const rook = this.grid[rank][9];
                this.grid[rank][9] = null;
                this.grid[rank][7] = rook;
                this.castlingRights[color].R_H_moved = true;
            } else if (move.castlingType === 'middle') {
                const rook = this.grid[rank][9];
                this.grid[rank][9] = null;
                this.grid[rank][5] = rook;
                this.castlingRights[color].R_H_moved = true;
            }
        } else {
            this.grid[fr][ff] = null;
            if (move.promotion) {
                this.grid[tr][tf] = new Piece(color, move.promotion);
            } else {
                this.grid[tr][tf] = piece;
            }

            if (piece.type === PIECE_KING) {
                this.castlingRights[color].K_moved = true;
            } else if (piece.type === PIECE_ROOK) {
                if (fr === 0 && ff === 0 && color === WHITE) this.castlingRights[WHITE].R_A_moved = true;
                else if (fr === 0 && ff === 9 && color === WHITE) this.castlingRights[WHITE].R_H_moved = true;
                else if (fr === 9 && ff === 0 && color === BLACK) this.castlingRights[BLACK].R_A_moved = true;
                else if (fr === 9 && ff === 9 && color === BLACK) this.castlingRights[BLACK].R_H_moved = true;
            }

            if (move.captured && move.captured.type === PIECE_ROOK) {
                if (tr === 0 && tf === 0) this.castlingRights[WHITE].R_A_moved = true;
                else if (tr === 0 && tf === 9) this.castlingRights[WHITE].R_H_moved = true;
                else if (tr === 9 && tf === 0) this.castlingRights[BLACK].R_A_moved = true;
                else if (tr === 9 && tf === 9) this.castlingRights[BLACK].R_H_moved = true;
            }
        }

        this.turn = this.turn === WHITE ? BLACK : WHITE;
    }

    undoMove(savedRights) {
        if (this.moveHistory.length === 0) return;
        const move = this.moveHistory.pop();
        const [ff, fr] = move.fromSq;
        const [tf, tr] = move.toSq;
        const color = move.piece.color;

        this.turn = color;
        this.castlingRights = savedRights;

        if (move.castlingType) {
            const rank = fr;
            this.grid[tr][tf] = null;
            this.grid[fr][ff] = move.piece;
            if (move.castlingType === 'short') {
                const rook = this.grid[rank][3];
                this.grid[rank][3] = null;
                this.grid[rank][0] = rook;
            } else if (move.castlingType === 'long') {
                const rook = this.grid[rank][7];
                this.grid[rank][7] = null;
                this.grid[rank][9] = rook;
            } else if (move.castlingType === 'middle') {
                const rook = this.grid[rank][5];
                this.grid[rank][5] = null;
                this.grid[rank][9] = rook;
            }
        } else {
            this.grid[tr][tf] = move.captured;
            this.grid[fr][ff] = move.piece;
        }
    }

    getPseudoLegalMoves(color) {
        const moves = [];
        for (let r = 0; r < 10; r++) {
            for (let f = 0; f < 10; f++) {
                const p = this.grid[r][f];
                if (!p || p.color !== color) continue;
                if (p.type === PIECE_PAWN) moves.push(...this.getPawnPseudoMoves(f, r, color));
                else if (p.type === PIECE_KNIGHT) moves.push(...this.getKnightPseudoMoves(f, r, color));
                else if (p.type === PIECE_BISHOP) moves.push(...this.getBishopPseudoMoves(f, r, color));
                else if (p.type === PIECE_ROOK) moves.push(...this.getRookPseudoMoves(f, r, color));
                else if (p.type === PIECE_QUEEN) moves.push(...this.getQueenPseudoMoves(f, r, color));
                else if (p.type === PIECE_NUR) moves.push(...this.getNurPseudoMoves(f, r, color));
                else if (p.type === PIECE_KING) moves.push(...this.getKingStandardPseudoMoves(f, r, color));
            }
        }
        moves.push(...this.getCastlingMoves(color));
        return moves;
    }

    getLegalMoves(color = this.turn) {
        const pseudo = this.getPseudoLegalMoves(color);
        const legal = [];
        const savedRights = this.cloneCastlingRights();

        for (const m of pseudo) {
            this.makeMove(m);
            if (!this.isInCheck(color)) {
                legal.push(m);
            }
            this.undoMove(savedRights);
        }
        return legal;
    }

    isCheckmate(color = this.turn) {
        return this.isInCheck(color) && this.getLegalMoves(color).length === 0;
    }

    isStalemate(color = this.turn) {
        return !this.isInCheck(color) && this.getLegalMoves(color).length === 0;
    }
}
