/**
 * NUR CHESS 100 - Professional Debyutlar Kitobi (Opening Book)
 * Nurfullo Nurmatovning rasmiy qo'llanmasi va 10x10 grossmeyster debyutlari
 * Har xil va aqlli strategiyalar bilan boyitilgan
 */

// 10x10 koordinatalari:
// Ustunlar (files): 0=A, 1=B, 2=C, 3=N, 4=E(Shoh), 5=D(Farzin), 6=M, 7=F, 8=G, 9=H
// Qatorlar (ranks): 0..9 (Oqlar: 0-figuralar, 1-piyodalar; Qoralar: 9-figuralar, 8-piyodalar)

export const OPENING_BOOK = [
    // 1. "O'zbekcha Himoya" (Muallif tavsiyasi: M va N markaziy piyodalar)
    {
        name: "O'zbekcha Himoya (Asosiy variant)",
        moves: [
            { from: [6, 1], to: [6, 4] }, // 1. п M2-M5 (3 katak sakrash)
            { from: [6, 8], to: [6, 5] }, // 1... п M9-M6
            { from: [3, 1], to: [3, 4] }, // 2. п N2-N5
            { from: [3, 8], to: [3, 5] }, // 2... п N9-N6
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [8, 9], to: [7, 7] }, // 3... Ot G10-F8
            { from: [1, 0], to: [2, 2] }, // 4. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 4... Ot B10-C8
        ]
    },

    // 2. "O'zbekcha Himoya (Otlar bilan qarshi hujum)"
    {
        name: "O'zbekcha Himoya (Otlar jangi)",
        moves: [
            { from: [6, 1], to: [6, 4] }, // 1. п M2-M5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [8, 0], to: [7, 2] }, // 2. Ot G1-F3
            { from: [6, 8], to: [6, 5] }, // 2... п M9-M6
            { from: [1, 0], to: [2, 2] }, // 3. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 3... Ot B10-C8
        ]
    },

    // 3. "Klassik Shoh Hujumi" (E2-E5 3 katak!)
    {
        name: "Klassik Shoh Hujumi (E-Piyoda)",
        moves: [
            { from: [4, 1], to: [4, 4] }, // 1. п E2-E5
            { from: [4, 8], to: [4, 5] }, // 1... п E9-E6
            { from: [5, 1], to: [5, 4] }, // 2. п D2-D5
            { from: [5, 8], to: [5, 5] }, // 2... п D9-D6
            { from: [3, 0], to: [3, 3] }, // 3. Nr N1-N4 (Nur sakrashi)
            { from: [3, 9], to: [3, 6] }, // 3... Nr N10-N7
        ]
    },

    // 4. "Shoh Piyodasiga Hindcha Javob"
    {
        name: "Shoh Piyodasi (Hindcha variant)",
        moves: [
            { from: [4, 1], to: [4, 4] }, // 1. п E2-E5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [5, 1], to: [5, 4] }, // 2. п D2-D5
            { from: [6, 8], to: [6, 5] }, // 2... п M9-M6
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [4, 8], to: [4, 6] }, // 3... п E9-E7
        ]
    },

    // 5. "Farzin Qanoti Bosimi" (D2-D5)
    {
        name: "Farzin Qanoti Bosimi",
        moves: [
            { from: [5, 1], to: [5, 4] }, // 1. п D2-D5
            { from: [5, 8], to: [5, 5] }, // 1... п D9-D6
            { from: [1, 0], to: [2, 2] }, // 2. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 2... Ot B10-C8
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [8, 9], to: [7, 7] }, // 3... Ot G10-F8
            { from: [6, 1], to: [6, 4] }, // 4. п M2-M5
            { from: [6, 8], to: [6, 5] }, // 4... п M9-M6
        ]
    },

    // 6. "NURning Tezkor Sakrashi" (N1-N4)
    {
        name: "NURning Tezkor Sakrashi",
        moves: [
            { from: [3, 0], to: [3, 3] }, // 1. Nr N1-N4
            { from: [3, 9], to: [3, 6] }, // 1... Nr N10-N7
            { from: [6, 1], to: [6, 4] }, // 2. п M2-M5
            { from: [6, 8], to: [6, 5] }, // 2... п M9-M6
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [8, 9], to: [7, 7] }, // 3... Ot G10-F8
        ]
    },

    // 7. "Sharq Otlar Rivoji" (Ot G1-F3)
    {
        name: "Sharq Otlar Rivoji",
        moves: [
            { from: [8, 0], to: [7, 2] }, // 1. Ot G1-F3
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [4, 1], to: [4, 4] }, // 2. п E2-E5
            { from: [4, 8], to: [4, 5] }, // 2... п E9-E6
            { from: [1, 0], to: [2, 2] }, // 3. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 3... Ot B10-C8
        ]
    },

    // 8. "Qanot Flang Bosimi" (N2-N5)
    {
        name: "Qanot Flang Bosimi",
        moves: [
            { from: [3, 1], to: [3, 4] }, // 1. п N2-N5
            { from: [3, 8], to: [3, 5] }, // 1... п N9-N6
            { from: [6, 0], to: [6, 3] }, // 2. Nr M1-M4
            { from: [6, 9], to: [6, 6] }, // 2... Nr M10-M7
            { from: [2, 0], to: [4, 2] }, // 3. Fil C1-E3
            { from: [2, 9], to: [4, 7] }, // 3... Fil C10-E8
        ]
    }
];

/**
 * Doskadagi yurishlar tarixiga qarab kitobdan mos yurishni tanlash
 */
export function findBookMove(moveHistory) {
    const historyLen = moveHistory ? moveHistory.length : 0;
    if (historyLen >= 8) return null; // 8-yurishdan keyin engine hisoblaydi

    // Mos keluvchi barcha variantlarni izlash
    const candidateLines = OPENING_BOOK.filter(line => {
        if (line.moves.length <= historyLen) return false;
        for (let i = 0; i < historyLen; i++) {
            const hMove = moveHistory[i];
            const bMove = line.moves[i];
            if (
                hMove.fromSq[0] !== bMove.from[0] ||
                hMove.fromSq[1] !== bMove.from[1] ||
                hMove.toSq[0] !== bMove.to[0] ||
                hMove.toSq[1] !== bMove.to[1]
            ) {
                return false;
            }
        }
        return true;
    });

    if (candidateLines.length === 0) return null;

    // Mos variantlar orasidan tasodifiy tanlash (xilma-xillikni ta'minlaydi)
    const chosenLine = candidateLines[Math.floor(Math.random() * candidateLines.length)];
    return chosenLine.moves[historyLen];
}
