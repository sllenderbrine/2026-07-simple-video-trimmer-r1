export type Mat4 = Float32Array;

export function fromComponents(
    n11: number, n12: number, n13: number, n14: number,
    n21: number, n22: number, n23: number, n24: number,
    n31: number, n32: number, n33: number, n34: number,
    n41: number, n42: number, n43: number, n44: number,
    out: Mat4 = new Float32Array(16)
): Mat4 {
    out[ 0] = n11; out[ 1] = n12; out[ 2] = n13; out[ 3] = n14;
    out[ 4] = n21; out[ 5] = n22; out[ 6] = n23; out[ 7] = n24;
    out[ 8] = n31; out[ 9] = n32; out[10] = n33; out[11] = n34;
    out[12] = n41; out[13] = n42; out[14] = n43; out[15] = n44;
    return out;
}

// identity transformation
export function fromIdentity(out: Mat4 = new Float32Array(16)): Mat4 {
    return fromComponents(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
        out
    );
}

// 3d translation transformation
export function fromTranslation(x: number, y: number, z: number, out: Mat4 = new Float32Array(16)): Mat4 {
    return fromComponents(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
        out
    );
}

// 3d scale transformation
export function fromScale(x: number, y: number, z: number, out: Mat4 = new Float32Array(16)): Mat4 {
    return fromComponents(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
        out
    );
}

// 3d rotation transformation (YXZ)
export function fromRotation(rx: number, ry: number, rz: number, out: Mat4 = new Float32Array(16)): Mat4 {
    const sx = Math.sin(rx), cx = Math.cos(rx);
    const sy = Math.sin(ry), cy = Math.cos(ry);
    const sz = Math.sin(rz), cz = Math.cos(rz);
    const sxsy = sx * sy;
    const sxcy = sx * cy;

    const n11 = cz*cy + -sz*sxsy;
    const n12 = sz*cy + cz*sxsy;
    const n13 = cx*-sy;
    const n21 = -sz*cx;
    const n22 = cz*cx;
    const n23 = sx;
    const n31 = cz*sy + sz*sxcy;
    const n32 = sz*sy + cz*-sxcy;
    const n33 = cx*cy;

    return fromComponents(
        n11, n12, n13, 0,
        n21, n22, n23, 0,
        n31, n32, n33, 0,
        0,   0,   0,   1,
        out
    );
}

export function fromPerspective(fovY: number, aspect: number, near: number, far: number, out: Mat4 = new Float32Array(16)): Mat4 {
    const f = 1 / Math.tan(fovY / 2);
    const nf = 1 / (near - far);
    
    const n11 = f/aspect;
    const n33 = (far + near) * nf;
    const n43 = 2 * far * near * nf;

    return fromComponents(
        n11, 0, 0,   0,
        0,   f, 0,   0,
        0,   0, n33, -1,
        0,   0, n43, 0,
        out
    );
}

// negative translation and negative rotation (YXZ)
export function fromCameraView(x: number, y: number, z: number, rx: number, ry: number, rz: number, out: Mat4 = new Float32Array(16)): Mat4 {
    const ax = -rx;
    const ay = -ry;
    const az = -rz;

    const sx = Math.sin(ax), cx = Math.cos(ax);
    const sy = Math.sin(ay), cy = Math.cos(ay);
    const sz = Math.sin(az), cz = Math.cos(az);
    const sxsy = sx * sy;
    const sxcy = sx * cy;

    const n11  = cz * cy + -sz * sxsy;
    const n12  = sz * cy + cz * sxsy;
    const n13  = cx * -sy;

    const n21  = -sz * cx;
    const n22  = cz * cx;
    const n23  = sx;

    const n31  = cz * sy + sz * sxcy;
    const n32  = sz * sy + cz * -sxcy;
    const n33 = cx * cy;

    const n41 = -(n11 * x + n21 * y + n31 * z);
    const n42 = -(n12 * x + n22 * y + n32 * z);
    const n43 = -(n13 * x + n23 * y + n33 * z);

    return fromComponents(
        n11, n12, n13, 0,
        n21, n22, n23, 0,
        n31, n32, n33, 0,
        n41, n42, n43, 1,
        out
    );
}

export function multiply(a: Mat4, b: Mat4, out: Mat4 = new Float32Array(16)): Mat4 {
    const a0  = a[0]!,  a1  = a[1]!,  a2  = a[2]!,  a3  = a[3]!;
    const a4  = a[4]!,  a5  = a[5]!,  a6  = a[6]!,  a7  = a[7]!;
    const a8  = a[8]!,  a9  = a[9]!,  a10 = a[10]!, a11 = a[11]!;
    const a12 = a[12]!, a13 = a[13]!, a14 = a[14]!, a15 = a[15]!;

    const b0  = b[0]!,  b1  = b[1]!,  b2  = b[2]!,  b3  = b[3]!;
    const b4  = b[4]!,  b5  = b[5]!,  b6  = b[6]!,  b7  = b[7]!;
    const b8  = b[8]!,  b9  = b[9]!,  b10 = b[10]!, b11 = b[11]!;
    const b12 = b[12]!, b13 = b[13]!, b14 = b[14]!, b15 = b[15]!;

    return fromComponents(
        a0*b0  + a4*b1  + a8*b2   + a12*b3,
        a1*b0  + a5*b1  + a9*b2   + a13*b3,
        a2*b0  + a6*b1  + a10*b2  + a14*b3,
        a3*b0  + a7*b1  + a11*b2  + a15*b3,

        a0*b4  + a4*b5  + a8*b6   + a12*b7,
        a1*b4  + a5*b5  + a9*b6   + a13*b7,
        a2*b4  + a6*b5  + a10*b6  + a14*b7,
        a3*b4  + a7*b5  + a11*b6  + a15*b7,

        a0*b8  + a4*b9  + a8*b10  + a12*b11,
        a1*b8  + a5*b9  + a9*b10  + a13*b11,
        a2*b8  + a6*b9  + a10*b10 + a14*b11,
        a3*b8  + a7*b9  + a11*b10 + a15*b11,

        a0*b12 + a4*b13 + a8*b14  + a12*b15,
        a1*b12 + a5*b13 + a9*b14  + a13*b15,
        a2*b12 + a6*b13 + a10*b14 + a14*b15,
        a3*b12 + a7*b13 + a11*b14 + a15*b15,
        out
    );
}