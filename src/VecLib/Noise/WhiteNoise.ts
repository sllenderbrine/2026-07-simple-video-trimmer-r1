import { clamp } from "../Utility/MathUtility.js";

const LESS_THAN_ONE = 1 - 1e-7;

export function getValue2(x: number, y: number) {
    let h = Math.imul(x, 0xcc9e2d51) ^ Math.imul(y, 0x1b873593);

    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = h ^ (h >>> 16);

    return clamp((h >>> 0) / 0xFFFFFFFF, 0, LESS_THAN_ONE);
}

export function getValue3(x: number, y: number, z: number) {
    let h = Math.imul(x, 0x7a143589);
    h = Math.imul(h ^ y, 0xab949b23);
    h = Math.imul(h ^ z, 0xcd13491f);
    
    h = Math.imul(h ^ (h >>> 16), 0x5bf036c9);
    h = Math.imul(h ^ (h >>> 15), 0x91d4bc5d);
    h = h ^ (h >>> 16);

    return clamp((h >>> 0) / 0xFFFFFFFF, 0, LESS_THAN_ONE);
}

export function getValue4(x: number, y: number, z: number, w: number) {
    let h = Math.imul(x, 0x47b54139);
    h = Math.imul(h ^ y, 0x56123b4f);
    h = Math.imul(h ^ z, 0x6d94b2a1);
    h = Math.imul(h ^ w, 0x7b23c51d);
    
    h = Math.imul(h ^ (h >>> 16), 0x4fb39c65);
    h = Math.imul(h ^ (h >>> 13), 0x22b2ae35);
    h = h ^ (h >>> 16);

    return clamp((h >>> 0) / 0xFFFFFFFF, 0, LESS_THAN_ONE);
}