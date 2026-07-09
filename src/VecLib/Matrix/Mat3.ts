export type Mat3 = Float32Array;

export function fromComponents(
    n11: number, n12: number, n13: number,
    n21: number, n22: number, n23: number,
    n31: number, n32: number, n33: number,
    out: Mat3 = new Float32Array(9)
): Mat3 {
    out[0] = n11; out[1] = n12; out[2] = n13;
    out[3] = n21; out[4] = n22; out[5] = n23;
    out[6] = n31; out[7] = n32; out[8] = n33;
    return out;
}
    
// identity transformation
export function fromIdentity(out: Mat3 = new Float32Array(9)): Mat3 {
    return fromComponents(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
        out
    );
}

// 2d translation transformation
export function fromTranslation(x: number, y: number, out: Mat3 = new Float32Array(9)): Mat3 {
    return fromComponents(
        1, 0, 0,
        0, 1, 0,
        x, y, 1,
        out
    );
}

// 2d scale transformation
export function fromScale(x: number, y: number, out: Mat3 = new Float32Array(9)): Mat3 {
    return fromComponents(
        x, 0, 0,
        0, y, 0,
        0, 0, 1,
        out
    );
}

// 2d rotation transformation
export function fromRotation(angle: number, out: Mat3 = new Float32Array(9)): Mat3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return fromComponents(
        c,  s, 0,
        -s, c, 0,
        0,  0, 1,
        out
    );
}

// top left 3x3 portion of a 4x4 matrix
export function fromMat4(a: Float32Array, out: Mat3 = new Float32Array(9)) {
    const n11 = a[0]!;
    const n12 = a[1]!;
    const n13 = a[2]!;
    const n21 = a[4]!;
    const n22 = a[5]!;
    const n23 = a[6]!;
    const n31 = a[8]!;
    const n32 = a[9]!;
    const n33 = a[10]!;
    return fromComponents(
        n11, n12, n13,
        n21, n22, n23,
        n31, n32, n33,
        out
    );
}

export function fromMul(a: Mat3, b: Mat3, out: Mat3 = new Float32Array(9)): Mat3 {
    const a0 = a[0]!, a1 = a[1]!, a2 = a[2]!;
    const a3 = a[3]!, a4 = a[4]!, a5 = a[5]!;
    const a6 = a[6]!, a7 = a[7]!, a8 = a[8]!;

    const b0 = b[0]!, b1 = b[1]!, b2 = b[2]!;
    const b3 = b[3]!, b4 = b[4]!, b5 = b[5]!;
    const b6 = b[6]!, b7 = b[7]!, b8 = b[8]!;

    return fromComponents(
        a0*b0  + a3*b1  + a6*b2,
        a1*b0  + a4*b1  + a7*b2,
        a2*b0  + a5*b1  + a8*b2,

        a0*b3  + a3*b4  + a6*b5,
        a1*b3  + a4*b4  + a7*b5,
        a2*b3  + a5*b4  + a8*b5,

        a0*b6  + a3*b7  + a6*b8,
        a1*b6  + a4*b7  + a7*b8,
        a2*b6  + a5*b7  + a8*b8,
        out
    );
}

export function fromTranspose(a: Mat3, out: Mat3 = new Float32Array(9)) {
    return fromComponents(
        a[0]!, a[3]!, a[6]!,
        a[1]!, a[4]!, a[7]!,
        a[2]!, a[5]!, a[8]!,
        out
    );
}

export function fromInvert(a: Mat3, out: Mat3 = new Float32Array(9)): Mat3 {
    const a00 = a[0]!, a01 = a[1]!, a02 = a[2]!;
    const a10 = a[3]!, a11 = a[4]!, a12 = a[5]!;
    const a20 = a[6]!, a21 = a[7]!, a22 = a[8]!;

    const b01 =  a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 =  a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (det === 0) {
        throw new Error("Cannot invert 3x3 matrix");
    }

    det = 1.0 / det;

    return fromComponents(
        b01 * det,
        (-a22 * a01 + a02 * a21) * det,
        ( a12 * a01 - a02 * a11) * det,

        b11 * det,
        ( a22 * a00 - a02 * a20) * det,
        (-a12 * a00 + a02 * a10) * det,

        b21 * det,
        (-a21 * a00 + a01 * a20) * det,
        ( a11 * a00 - a01 * a10) * det,
        out
    );
}

export function fromNormal(a: Float32Array, out: Mat3 = new Float32Array(9)): Mat3 {
    return fromTranspose(fromInvert(fromMat4(a, out), out), out);
}