/**
 * NUR CHESS 100 - Zobrist Hashing (BigInt 64-bit)
 */

import { WHITE, BLACK, PIECE_PAWN, PIECE_KNIGHT, PIECE_BISHOP, PIECE_NUR, PIECE_ROOK, PIECE_QUEEN, PIECE_KING } from './board_constants.js';

function pseudoRandom64(seed) {
    // 64-bit Xorshift PRNG
    let x = BigInt(seed);
    return function() {
        x ^= (x << 13n) & 0xFFFFFFFFFFFFFFFFn;
        x ^= (x >> 7n) & 0xFFFFFFFFFFFFFFFFn;
        x ^= (x << 17n) & 0xFFFFFFFFFFFFFFFFn;
        return x & 0xFFFFFFFFFFFFFFFFn;
    };
}

export class Zobrist {
    constructor() {
        const rng = pseudoRandom64(100100100n);
        this.pieceTable = new Array(10);
        for (let r = 0; r < 10; r++) {
            this.pieceTable[r] = new Array(10);
            for (let f = 0; f < 10; f++) {
                this.pieceTable[r][f] = {
                    [WHITE]: {
                        [PIECE_PAWN]: rng(),
                        [PIECE_KNIGHT]: rng(),
                        [PIECE_BISHOP]: rng(),
                        [PIECE_NUR]: rng(),
                        [PIECE_ROOK]: rng(),
                        [PIECE_QUEEN]: rng(),
                        [PIECE_KING]: rng()
                    },
                    [BLACK]: {
                        [PIECE_PAWN]: rng(),
                        [PIECE_KNIGHT]: rng(),
                        [PIECE_BISHOP]: rng(),
                        [PIECE_NUR]: rng(),
                        [PIECE_ROOK]: rng(),
                        [PIECE_QUEEN]: rng(),
                        [PIECE_KING]: rng()
                    }
                };
            }
        }
        this.turnKey = rng();
    }

    hashBoard(grid, turn) {
        let h = 0n;
        for (let r = 0; r < 10; r++) {
            const row = grid[r];
            const tableRow = this.pieceTable[r];
            for (let f = 0; f < 10; f++) {
                const piece = row[f];
                if (piece) {
                    h ^= tableRow[f][piece.color][piece.type];
                }
            }
        }
        if (turn === BLACK) {
            h ^= this.turnKey;
        }
        return h;
    }
}
