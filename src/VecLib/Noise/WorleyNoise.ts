import * as WhiteNoise from "./WhiteNoise.js";

export function getPoint2(x: number, y: number, seed: number, t: number = 1): [number, number, number, number, number, number] {
    let radius = Math.ceil(t);
    let g0x = Math.floor(x);
    let g0y = Math.floor(y);
    let closestDist1 = Infinity;
    let px1 = 0;
    let py1 = 0;
    let closestDist2 = Infinity;
    let px2 = 0;
    let py2 = 0;
    for(let offsetX=-radius; offsetX<=radius; offsetX++) {
        for(let offsetY=-radius; offsetY<=radius; offsetY++) {
            let g1x = g0x + offsetX;
            let g1y = g0y + offsetY;
            let g2x = g1x + t * WhiteNoise.getValue3(g1x, g1y, seed);
            let g2y = g1y + t * WhiteNoise.getValue3(g1x, g1y, seed + 1);
            let dx = x - g2x;
            let dy = y - g2y;
            let dist = dx * dx + dy * dy;
            if(dist < closestDist1) {
                closestDist2 = closestDist1;
                px2 = px1;
                py2 = py1;
                closestDist1 = dist;
                px1 = g2x;
                py1 = g2y;
            } else if(dist < closestDist2) {
                closestDist2 = dist;
                px2 = g2x;
                py2 = g2y;
            }
        }
    }
    return [ px1, py1, Math.sqrt(closestDist1), px2, py2, Math.sqrt(closestDist2) ];
}

export function getValue2(x: number, y: number, seed: number, t?: number) {
    const res = getPoint2(x, y, seed, t);
    return WhiteNoise.getValue3(res[0], res[1], seed);
}

export function getDist2(x: number, y: number, seed: number, t?: number) {
    const res = getPoint2(x, y, seed, t);
    return res[2];
}

export function getEdge2(x: number, y: number, seed: number, t?: number) {
    const res = getPoint2(x, y, seed, t);
    return res[5] - res[2];
}