import { Vec2 } from "../Vectors/Vec2.js";
import { Vec3 } from "../Vectors/Vec3.js";


export class Geometry3D {
    positions: Vec3[] = [];
    texcoords: Vec2[] = [];
    normals: Vec3[] = [];
    constructor() {

    }
    
    clone() {
        const geom = new Geometry3D();
        this.forEach((pos, tex, normal) => {
            geom.positions.push(pos.clone());
            geom.texcoords.push(tex.clone());
            geom.normals.push(normal.clone());
        });
        return geom;
    }

    addTriangle(
        pos1: Vec3, tex1: Vec2,
        pos2: Vec3, tex2: Vec2,
        pos3: Vec3, tex3: Vec2,
    ) {
        const normal = pos2.look(pos3).cross(pos1.look(pos2)).normSelf();
        this.positions.push(pos1, pos2, pos3);
        this.normals.push(normal, normal, normal);
        this.texcoords.push(tex1, tex2, tex3);
    }

    forEach(callback: (pos: Vec3, tex: Vec2, normal: Vec3, i: number) => void) {
        for(let i=0; i<this.positions.length; i++) {
            callback(
                this.positions[i]!,
                this.texcoords[i]!,
                this.normals[i]!,
                i
            );
        }
    }
}