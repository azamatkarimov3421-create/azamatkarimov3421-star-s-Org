/**
 * NUR CHESS 100 - Professional Debyutlar Kitobi (Opening Book)
 * Nurfullo Nurmatovning rasmiy qo'llanmasi va 10x10 grossmeyster debyutlari
 */

import { WHITE, BLACK } from './board_constants.js';

// Debyut pozitsiyalari va tavsiya etilgan eng kuchli yurishlar
// Har bir pozitsiya kaliti doskaning o'ziga xos yurishlar zanjiri yoki soddalashtirilgan FEN/tarix
export const OPENING_BOOK = [
    // 1. "O'zbekcha himoya" (Muallif tavsiyasi)
    // Oqlar: m2->m5 (3 katak sakrash), Qoralar: m9->m6
    // Oqlar: n2->n5, Qoralar: n9->n6
    // Oqlar: G1->F3 (Ot), Qoralar: G10->F8 (Ot)
    // Oqlar: B1->C3 (Ot), Qoralar: B10->C8 (Ot)
    {
        name: "O'zbekcha himoya (Asosiy variant)",
        moves: [
            { from: [6, 1], to: [6, 4] }, // 1. п M2-M5
            { from: [6, 8], to: [6, 5] }, // 1... п M9-M6
            { from: [3, 1], to: [3, 4] }, // 2. п N2-N5
            { from: [3, 8], to: [3, 5] }, // 2... п N9-N6
            { from: [8, 0], to: [7, 2] }, // 3. От G1-F3
            { from: [8, 9], to: [7, 7] }, // 3... Ot G10-F8
            { from: [1, 0], to: [2, 2] }, // 4. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 4... Ot B10-C8
        ]
    },

    // 2. Markaziy Shoh Piyodasi Hujumi (E2->E5 3 katak!)
    {
        name: "Klassik Markaziy Hujum (E-Piyoda)",
        moves: [
            { from: [4, 1], to: [4, 4] }, // 1. п E2-E5
            { from: [4, 8], to: [4, 5] }, // 1... п E9-E6
            { from: [5, 1], to: [5, 4] }, // 2. п D2-D5
            { from: [5, 8], to: [5, 5] }, // 2... п D9-D6
            { from: [3, 0], to: [3, 3] }, // 3. Nr N1-N4 (Nur markazga)
            { from: [3, 9], to: [3, 6] }, // 3... Nr N10-N7
        ]
    },

    // 3. NUR Qanot Rivojlanishi va Tezkor Rokirovka
    {
        name: "NUR Flang Taktikasi",
        moves: [
            { from: [3, 1], to: [3, 3] }, // 1. п N2-N4
            { from: [3, 8], to: [3, 6] }, // 1... п N9-N7
            { from: [6, 0], to: [6, 3] }, // 2. Nr M1-M4
            { from: [6, 9], to: [6, 6] }, // 2... Nr M10-M7
            { from: [2, 0], to: [4, 2] }, // 3. Fil C1-E3
            { from: [2, 9], to: [4, 7] }, // 3... Fil C10-E8
        ]
    },

    // 4. Farzin Qanoti Bosimi (D2->D5)
    {
        name: "Farzin Qanoti Bosimi",
        moves: [
            { from: [5, 1], to: [5, 4] }, // 1. п D2-D5
            { from: [5, 8], to: [5, 5] }, // 1... п D9-D6
            { from: [1, 0], to: [2, 2] }, // 2. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 2... Ot B10-C8
            { from: [7, 0], to: [5, 2] }, // 3. Fil F1-D3
            { from: [7, 9], to: [5, 7] }, // 3... Fil F10-D8
        ]
    }
];

export function findBookMove(moveHistory) {
    const historyLen = moveHistory.length;
    if (historyLen >= 8) return null; // 8-yurishdan keyin hisoblash engine'ga o'tadi

    const candidateLines = OPENING_BOOK.filter(line => {
        if (line.moves.length <= historyLen) return false;
        for (let i = 0; i < historyLen; i++) {
            const hMove = moveHistory[i];
            const bMove = line.moves[i];
            if (hMove.fromSq[0] !== bMove.from[0] ||
                hMove.fromSq[1] !== bMove.from[1] ||
                hMove.toSq[0] !== bMove.to[0] ||
                hMove.toSq[1] !== bMove.to[1]) {
                return false;
            }
        }
        return true;
    });

    if (candidateLines.length === 0) return null;

    // Tasodifiy bitta to'g'ri kitob liniyasini tanlash
    const chosenLine = candidateLines[Math.floor(Math.random() * candidateLines.length)];
    return chosenLine.moves[historyLen];
}
