import {Dot} from "@/types";

/** Сколько точек используются для скругления кривой */
const SMOOTH_FACTOR = 4;

/** Сглаживание методом скальзящей средней сохранением конечных точек */
export const smoothLine = (line: Dot[]): Dot[] => {
    const lineLen = line.length;
    const res: Dot[] = [];

    for (let i = 0; i < lineLen; i++) {
        if (i < SMOOTH_FACTOR || i >= lineLen - SMOOTH_FACTOR) res.push(line[i]);
        else {
            let sumX = 0, sumY = 0;

            for (let j = 0; j < SMOOTH_FACTOR * 2; j++) {
                const [x, y] = line[i + j - SMOOTH_FACTOR];

                sumX += x;
                sumY += y;
            }

            res.push([sumX / SMOOTH_FACTOR / 2, sumY / SMOOTH_FACTOR / 2]);
        } 
    }

    return res;
}