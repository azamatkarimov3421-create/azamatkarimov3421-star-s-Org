/**
 * NUR CHESS 100 - Professional Debyutlar Kitobi (Opening Book)
 * Nurfullo Nurmatovning rasmiy qo'llanmasi va 10x10 grossmeyster debyutlari
 * Har xil va aqlli strategiyalar bilan boyitilgan
 */

// 10x10 koordinatalari:
// Ustunlar (files): 0=A, 1=B, 2=C, 3=N, 4=E(Shoh), 5=D(Farzin), 6=M, 7=F, 8=G, 9=H
// Qatorlar (ranks): 0..9 (Oqlar: 0-figuralar, 1-piyodalar; Qoralar: 9-figuralar, 8-piyodalar)

export const OPENING_BOOK = [
    // 1. "O'zbekcha Hujum (Ot bilan qarshi zarba)"
    {
        name: "O'zbekcha Hujum (Ot bilan qarshi zarba)",
        moves: [
            { from: [6, 1], to: [6, 4] }, // 1. п M2-M5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [8, 0], to: [7, 2] }, // 2. Ot G1-F3
            { from: [4, 8], to: [4, 5] }, // 2... п E9-E6
            { from: [3, 1], to: [3, 3] }, // 3. п N2-N4
            { from: [5, 8], to: [5, 5] }, // 3... п D9-D6
        ]
    },

    // 2. "O'zbekcha Himoya (Qanotdan bosim)"
    {
        name: "O'zbekcha Himoya (Qanotdan bosim)",
        moves: [
            { from: [6, 1], to: [6, 4] }, // 1. п M2-M5
            { from: [4, 8], to: [4, 5] }, // 1... п E9-E6
            { from: [5, 1], to: [5, 4] }, // 2. п D2-D5
            { from: [1, 9], to: [2, 7] }, // 2... Ot B10-C8
            { from: [1, 0], to: [2, 2] }, // 3. Ot B1-C3
            { from: [6, 8], to: [6, 6] }, // 3... п M9-M7
        ]
    },

    // 3. "Klassik Shoh Debyuti (Hindcha javob)"
    {
        name: "Klassik Shoh Debyuti (Hindcha javob)",
        moves: [
            { from: [4, 1], to: [4, 4] }, // 1. п E2-E5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [5, 1], to: [5, 4] }, // 2. п D2-D5
            { from: [6, 8], to: [6, 5] }, // 2... п M9-M6
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [4, 8], to: [4, 6] }, // 3... п E9-E7
        ]
    },

    // 4. "Klassik Shoh Debyuti (Sitsiliacha qanot qarshiligi)"
    {
        name: "Klassik Shoh Debyuti (Sitsiliacha qanot)",
        moves: [
            { from: [4, 1], to: [4, 4] }, // 1. п E2-E5
            { from: [6, 8], to: [6, 5] }, // 1... п M9-M6
            { from: [8, 0], to: [7, 2] }, // 2. Ot G1-F3
            { from: [5, 8], to: [5, 5] }, // 2... п D9-D6
            { from: [3, 1], to: [3, 3] }, // 3. п N2-N4
            { from: [1, 9], to: [2, 7] }, // 3... Ot B10-C8
        ]
    },

    // 5. "Farzin Qanoti Bosimi (D2-D5)"
    {
        name: "Farzin Qanoti Bosimi (D2-D5)",
        moves: [
            { from: [5, 1], to: [5, 4] }, // 1. п D2-D5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [1, 0], to: [2, 2] }, // 2. Ot B1-C3
            { from: [4, 8], to: [4, 5] }, // 2... п E9-E6
            { from: [6, 1], to: [6, 3] }, // 3. п M2-M4
            { from: [1, 9], to: [2, 7] }, // 3... Ot B10-C8
        ]
    },

    // 6. "Farzin Qanoti (Markaziy javob)"
    {
        name: "Farzin Qanoti (Markaziy javob)",
        moves: [
            { from: [5, 1], to: [5, 4] }, // 1. п D2-D5
            { from: [6, 8], to: [6, 5] }, // 1... п M9-M6
            { from: [8, 0], to: [7, 2] }, // 2. Ot G1-F3
            { from: [4, 8], to: [4, 5] }, // 2... п E9-E6
            { from: [1, 0], to: [2, 2] }, // 3. Ot B1-C3
            { from: [1, 9], to: [2, 7] }, // 3... Ot B10-C8
        ]
    },

    // 7. "NURning Taktik Sakrashi (Tezkor N1-N4)"
    {
        name: "NURning Taktik Sakrashi (Tezkor N1-N4)",
        moves: [
            { from: [3, 0], to: [3, 3] }, // 1. Nr N1-N4
            { from: [4, 8], to: [4, 5] }, // 1... п E9-E6
            { from: [6, 1], to: [6, 4] }, // 2. п M2-M5
            { from: [8, 9], to: [7, 7] }, // 2... Ot G10-F8
            { from: [8, 0], to: [7, 2] }, // 3. Ot G1-F3
            { from: [5, 8], to: [5, 5] }, // 3... п D9-D6
        ]
    },

    // 8. "NURning Taktik Sakrashi (Markaziy tosiq)"
    {
        name: "NURning Taktik Sakrashi (Markaziy tosiq)",
        moves: [
            { from: [3, 0], to: [3, 3] }, // 1. Nr N1-N4
            { from: [5, 8], to: [5, 5] }, // 1... п D9-D6
            { from: [1, 0], to: [2, 2] }, // 2. Ot B1-C3
            { from: [8, 9], to: [7, 7] }, // 2... Ot G10-F8
            { from: [4, 1], to: [4, 4] }, // 3. п E2-E5
            { from: [6, 8], to: [6, 5] }, // 3... п M9-M6
        ]
    },

    // 9. "Sharq Otlar Rivoji (Ot G1-F3)"
    {
        name: "Sharq Otlar Rivoji (Ot G1-F3)",
        moves: [
            { from: [8, 0], to: [7, 2] }, // 1. Ot G1-F3
            { from: [5, 8], to: [5, 5] }, // 1... п D9-D6
            { from: [4, 1], to: [4, 4] }, // 2. п E2-E5
            { from: [1, 9], to: [2, 7] }, // 2... Ot B10-C8
            { from: [6, 1], to: [6, 3] }, // 3. п M2-M4
            { from: [4, 8], to: [4, 5] }, // 3... п E9-E6
        ]
    },

    // 10. "Qanot Flang Bosimi (N2-N5)"
    {
        name: "Qanot Flang Bosimi (N2-N5)",
        moves: [
            { from: [3, 1], to: [3, 4] }, // 1. п N2-N5
            { from: [8, 9], to: [7, 7] }, // 1... Ot G10-F8
            { from: [8, 0], to: [7, 2] }, // 2. Ot G1-F3
            { from: [4, 8], to: [4, 5] }, // 2... п E9-E6
            { from: [6, 0], to: [6, 3] }, // 3. Nr M1-M4
            { from: [5, 8], to: [5, 5] }, // 3... п D9-D6
        ]
    }
];

/**
 * Doskadagi yurishlar tarixiga qarab kitobdan mos yurishni tanlash
 */
export function findBookMove(moveHistory) {
    const historyLen = moveHistory ? moveHistory.length : 0;
    if (historyLen >= 6) return null; // 6 yarim yurishdan (3 to'liq yurishdan) keyin dvigatel mustaqil hisoblaydi

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

    // Mos keluvchi variantlar orasidan dinamik tanlash
    const chosenLine = candidateLines[Math.floor(Math.random() * candidateLines.length)];
    return chosenLine.moves[historyLen];
}
