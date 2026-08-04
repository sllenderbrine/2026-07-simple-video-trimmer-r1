import { Vec2 } from "../Vectors/Vec2.js"
import { Vec3 } from "../Vectors/Vec3.js"
import { clamp, lerp } from "../Utility/MathUtility.js";
import { getWhiteNoise3d, getWhiteNoise4d } from "./WhiteNoise.js";

export const PERLIN_2D_GRADIENT_COUNT = 12;
export const PERLIN_3D_GRADIENT_COUNT = 16;
export const PERLIN_MAX_VALUE = 1 - 1e-7;

export function perlinFade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

export const PERLIN_GRADIENTS_2D: Vec2[] = [];
for(let i=0; i<PERLIN_2D_GRADIENT_COUNT; i++) {
    const angle = 2 * Math.PI * i / PERLIN_2D_GRADIENT_COUNT;
    PERLIN_GRADIENTS_2D.push(Vec2.fromComponents(Math.cos(angle), Math.sin(angle)));
}

export function getPerlin2dVector(x: number, y: number, seed: number) {
    return PERLIN_GRADIENTS_2D[Math.floor(getWhiteNoise3d(x, y, seed) * PERLIN_2D_GRADIENT_COUNT)]!;
}

export function getPerlin2dValue(x: number, y: number, seed: number) {
    const g0x = Math.floor(x);
    const g0y = Math.floor(y);
    const g1x = g0x + 1;
    const g1y = g0y + 1;
    const f0x = x - g0x;
    const f0y = y - g0y;
    const f1x = x - g1x;
    const f1y = y - g1y;
    const cAAv = getPerlin2dVector(g0x, g0y, seed);
    const cAA = cAAv.x * f0x + cAAv.y * f0y;
    const cABv = getPerlin2dVector(g0x, g1y, seed);
    const cAB = cABv.x * f0x + cABv.y * f1y;
    const cBAv = getPerlin2dVector(g1x, g0y, seed);
    const cBA = cBAv.x * f1x + cBAv.y * f0y;
    const cBBv = getPerlin2dVector(g1x, g1y, seed);
    const cBB = cBBv.x * f1x + cBBv.y * f1y;
    const tx = perlinFade(f0x);
    const ty = perlinFade(f0y);
    const cA = lerp(cAA, cBA, tx);
    const cB = lerp(cAB, cBB, tx);
    const c = lerp(cA, cB, ty);
    return clamp(c * 0.5 + 0.5, 0, PERLIN_MAX_VALUE);
}

export const PERLIN_GRADIENTS_3D: Vec3[] = [];
for(let i=0; i<PERLIN_3D_GRADIENT_COUNT; i++) {
    const y = 1 - (2 * i) / (PERLIN_3D_GRADIENT_COUNT - 1);
    const r = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    PERLIN_GRADIENTS_3D.push(Vec3.fromComponents(Math.cos(angle) * r, y, Math.sin(angle) * r));
}

export function getPerlin3dVector(x: number, y: number, z: number, seed: number) {
    return PERLIN_GRADIENTS_3D[Math.floor(getWhiteNoise4d(x, y, z, seed) * 16)]!;
}

export function getPerlin3dValue(x: number, y: number, z: number, seed: number) {
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
    const cAAAv = getPerlin3dVector(g0x, g0y, g0z, seed);
    const cAAA = cAAAv.x * f0x + cAAAv.y * f0y + cAAAv.z * f0z;
    const cAABv = getPerlin3dVector(g0x, g0y, g1z, seed);
    const cAAB = cAABv.x * f0x + cAABv.y * f0y + cAABv.z * f1z;
    const cABAv = getPerlin3dVector(g0x, g1y, g0z, seed);
    const cABA = cABAv.x * f0x + cABAv.y * f1y + cABAv.z * f0z;
    const cABBv = getPerlin3dVector(g0x, g1y, g1z, seed);
    const cABB = cABBv.x * f0x + cABBv.y * f1y + cABBv.z * f1z;
    const cBAAv = getPerlin3dVector(g1x, g0y, g0z, seed);
    const cBAA = cBAAv.x * f1x + cBAAv.y * f0y + cBAAv.z * f0z;
    const cBABv = getPerlin3dVector(g1x, g0y, g1z, seed);
    const cBAB = cBABv.x * f1x + cBABv.y * f0y + cBABv.z * f1z;
    const cBBAv = getPerlin3dVector(g1x, g1y, g0z, seed);
    const cBBA = cBBAv.x * f1x + cBBAv.y * f1y + cBBAv.z * f0z;
    const cBBBv = getPerlin3dVector(g1x, g1y, g1z, seed);
    const cBBB = cBBBv.x * f1x + cBBBv.y * f1y + cBBBv.z * f1z;
    const tx = perlinFade(f0x);
    const ty = perlinFade(f0y);
    const tz = perlinFade(f0z);
    const cAA = lerp(cAAA, cBAA, tx);
    const cAB = lerp(cAAB, cBAB, tx);
    const cBA = lerp(cABA, cBBA, tx);
    const cBB = lerp(cABB, cBBB, tx);
    const cA = lerp(cAA, cBA, ty);
    const cB = lerp(cAB, cBB, ty);
    const c = lerp(cA, cB, tz);
    return clamp(c * 0.5 + 0.5, 0, PERLIN_MAX_VALUE);
}