import { degreesToRadians } from "../Utility/MathUtility.js";
import { Vec3 } from "../Vectors/Vec3.js";
import * as Mat4 from "../Matrix/Mat4.js";

export class Camera3D {
    aspect: number;
    verticalFov: number;
    near: number;
    far: number;
    position = Vec3.zero();
    rotation = Vec3.zero();
    forward = Vec3.zero();
    forwardFlat = Vec3.zero();
    up = Vec3.zero();
    right = Vec3.zero();
    viewMatrix = Mat4.fromIdentity();
    perspectiveMatrix = Mat4.fromIdentity();

    constructor(fov: number = degreesToRadians(90), aspect = 1, near = 0.1, far = 1000) {
        this.verticalFov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    calculateForward() {
        Vec3.FORWARD.rotateXyz(this.rotation.x, this.rotation.y, this.rotation.z, this.forward);
    }

    calculateUp() {
        Vec3.UP.rotateXyz(this.rotation.x, this.rotation.y, this.rotation.z, this.up);
    }

    calculateRight() {
        Vec3.RIGHT.rotateXyz(this.rotation.x, this.rotation.y, this.rotation.z, this.right);
    }

    calculateForwardFlat() {
        Vec3.FORWARD.rotateY(this.rotation.y, this.forwardFlat);
    }

    calculatePerspectiveMatrix() {
        Mat4.fromPerspective(this.verticalFov, this.aspect, this.near, this.far, this.perspectiveMatrix);
    }

    calculateViewMatrix() {
        Mat4.fromCameraView(
            this.position.x, this.position.y, this.position.z,
            this.rotation.x, this.rotation.y, this.rotation.z,
            this.viewMatrix
        );
    }
    
    lookAt(position: Vec3) {
        let f = this.position.look(position);
        this.rotation = Vec3.fromComponents(f.pitch(), f.yaw(), 0);
    }
}