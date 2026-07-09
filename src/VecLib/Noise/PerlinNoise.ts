import * as WhiteNoise from "./WhiteNoise.js";
import { Vec2 } from "../Vectors/Vec2.js"
import { Vec3 } from "../Vectors/Vec3.js"
import { clamp, lerp } from "../Utility/MathUtility.js";

const LESS_THAN_ONE = 1 - 1e-7;

export function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
}

export const gradients2: Vec2[] = [];
for(let i=0; i<12; i++) {
    const angle = 2 * Math.PI * i / 12;
    gradients2.push(Vec2.fromComponents(Math.cos(angle), Math.sin(angle)));
}

export function getVector2(x: number, y: number, seed: number) {
    return gradients2[Math.floor(WhiteNoise.getValue3(x, y, seed) * 12)]!;
}

export function getValue2(x: number, y: number, seed: number) {
    const g0x = Math.floor(x);
    const g0y = Math.floor(y);
    const g1x = g0x + 1;
    const g1y = g0y + 1;
    const f0x = x - g0x;
    const f0y = y - g0y;
    const f1x = x - g1x;
    const f1y = y - g1y;
    const cAAv = getVector2(g0x, g0y, seed);
    const cAA = cAAv.x * f0x + cAAv.y * f0y;
    const cABv = getVector2(g0x, g1y, seed);
    const cAB = cABv.x * f0x + cABv.y * f1y;
    const cBAv = getVector2(g1x, g0y, seed);
    const cBA = cBAv.x * f1x + cBAv.y * f0y;
    const cBBv = getVector2(g1x, g1y, seed);
    const cBB = cBBv.x * f1x + cBBv.y * f1y;
    const tx = fade(f0x);
    const ty = fade(f0y);
    const cA = lerp(cAA, cBA, tx);
    const cB = lerp(cAB, cBB, tx);
    const c = lerp(cA, cB, ty);
    return clamp(c * 0.5 + 0.5, 0, LESS_THAN_ONE);
}

export const gradients3: Vec3[] = [];
for(let i=0; i<16; i++) {
    const y = 1 - (2 * i) / 15;
    const r = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    gradients3.push(Vec3.fromComponents(Math.cos(angle) * r, y, Math.sin(angle) * r));
}

export function getVector3(x: number, y: number, z: number, seed: number) {
    return gradients3[Math.floor(WhiteNoise.getValue4(x, y, z, seed) * 16)]!;
}

export function getValue3(x: number, y: number, z: number, seed: number) {
    const g0x = Math.floor(x);
    const g0y = Math.floor(y);
    const g0z = Math.floor(z);
    const g1x = g0x + 1;
    const g1y = g0y + 1;
    const g1z = g0z + 1;
    const f0x = x - g0x;
    const f0y = y - g0y;
    const f0z = z - g0z;
    const f1x = x - g1x;
    const f1y = y - g1y;
    const f1z = z - g1z;
    const cAAAv = getVector3(g0x, g0y, g0z, seed);
    const cAAA = cAAAv.x * f0x + cAAAv.y * f0y + cAAAv.z * f0z;
    const cAABv = getVector3(g0x, g0y, g1z, seed);
    const cAAB = cAABv.x * f0x + cAABv.y * f0y + cAABv.z * f1z;
    const cABAv = getVector3(g0x, g1y, g0z, seed);
    const cABA = cABAv.x * f0x + cABAv.y * f1y + cABAv.z * f0z;
    const cABBv = getVector3(g0x, g1y, g1z, seed);
    const cABB = cABBv.x * f0x + cABBv.y * f1y + cABBv.z * f1z;
    const cBAAv = getVector3(g1x, g0y, g0z, seed);
    const cBAA = cBAAv.x * f1x + cBAAv.y * f0y + cBAAv.z * f0z;
    const cBABv = getVector3(g1x, g0y, g1z, seed);
    const cBAB = cBABv.x * f1x + cBABv.y * f0y + cBABv.z * f1z;
    const cBBAv = getVector3(g1x, g1y, g0z, seed);
    const cBBA = cBBAv.x * f1x + cBBAv.y * f1y + cBBAv.z * f0z;
    const cBBBv = getVector3(g1x, g1y, g1z, seed);
    const cBBB = cBBBv.x * f1x + cBBBv.y * f1y + cBBBv.z * f1z;
    const tx = fade(f0x);
    const ty = fade(f0y);
    const tz = fade(f0z);
    const cAA = lerp(cAAA, cBAA, tx);
    const cAB = lerp(cAAB, cBAB, tx);
    const cBA = lerp(cABA, cBBA, tx);
    const cBB = lerp(cABB, cBBB, tx);
    const cA = lerp(cAA, cBA, ty);
    const cB = lerp(cAB, cBB, ty);
    const c = lerp(cA, cB, tz);
    return clamp(c * 0.5 + 0.5, 0, LESS_THAN_ONE);
}