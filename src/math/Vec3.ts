import { clamp, PI_OVER_TWO } from './MathUtils';
import { Mat3 } from './Mat3';
import { Mat4 } from './Mat4';

export class Vec3 extends Array<number> {
    // constant: number; // TODO: only be used in Camera class
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v: number) {
        this[0] = v;
    }

    set y(v: number) {
        this[1] = v;
    }

    set z(v: number) {
        this[2] = v;
    }

    set(x: number, y: number = x, z: number = x): this {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v: Vec3): this {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v: Vec3): this {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Sets this vector to va + vb
     */
    addVectors(va: Vec3, vb: Vec3): this {
        this.x = va.x + vb.x;
        this.y = va.y + vb.y;
        this.z = va.z + vb.z;
        return this;
    }

    sub(v: Vec3): this {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Sets this vector to va - vb.
     */
    subVectors(va: Vec3, vb: Vec3): this {
        this.x = va.x - vb.x;
        this.y = va.x - vb.x;
        this.z = va.z - vb.z;
        return this;
    }

    multiply(v: Vec3): this {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }

    divide(v: Vec3): this {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    }

    /**
     * Returns the inverse of the components of a vec3
     * @returns this
     */
    inverse(): this {
        this.x = 1.0 / this.x;
        this.y = 1.0 / this.y;
        this.z = 1.0 / this.z;
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len(): number {
        return Math.hypot(this.x, this.y, this.z);
    }

    squaredLen(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }

    distance(v: Vec3): number {
        const x = v.x - this.x;
        const y = v.y - this.y;
        const z = v.z - this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    squaredDistance(v: Vec3): number {
        const x = v.x - this.x;
        const y = v.y - this.y;
        const z = v.z - this.z;
        return x * x + y * y + z * z;
    }

    negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    cross(v: Vec3): this {
        return this.crossVectors(this, v);
    }

    /**
     * Sets this vector to cross product of va and vb.
     */
    crossVectors(va: Vec3, vb: Vec3): this {
        const ax = va.x;
        const ay = va.y;
        const az = va.z;

        const bx = vb.x;
        const by = vb.y;
        const bz = vb.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }

    scale(s: number): this {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    normalize(): this {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let len = x * x + y * y + z * z;
        if (len <= 0) {
            len = 1; // error
        } else {
            len = 1 / Math.sqrt(len);
        }
        this.x = x * len;
        this.y = y * len;
        this.z = z * len;
        return this;
    }

    dot(v: Vec3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    equals(v: Vec3): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    /**
     *
     * Transforms the vec3 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * m[0] m[3] m[6]     x
     * m[1] m[4] m[7]  *  y
     * m[2] m[5] m[8]     z
     *
     * m[0] * x + m[3] * y + m[6] * z
     * m[1] * x + m[4] * y + m[7] * z
     * m[2] * x + m[5] * y + m[8] * z
     *
     * @param mat3
     * @returns this
     */
    applyMatrix3(m: Mat3): this {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.x = m[0] * x + m[3] * y + m[6] * z;
        this.y = m[1] * x + m[4] * y + m[7] * z;
        this.y = m[2] * x + m[5] * y + m[8] * z;
        return this;
    }

    /**
     *
     * m[0] m[4] m[8]  m[12]     x
     * m[1] m[5] m[9]  m[13]  *  y
     * m[2] m[6] m[10] m[14]     z
     * m[3] m[7] m[11] m[15]     1
     *
     * @param mat4
     * @returns
     */
    applyMatrix4(m: Mat4): this {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        // let w = m[3] * x + m[7] * y + m[11] * z + m[15]
        this.x = m[0] * x + m[4] * y + m[8] * z + m[12];
        this.y = m[1] * x + m[5] * y + m[9] * z + m[13];
        this.z = m[2] * x + m[6] * y + m[10] * z + m[14];
        return this;
    }

    // TODO: mat4 quaternion
    // scaleRotateMatrix4(mat4) {
    //     Vec3Func.scaleRotateMat4(this, this, mat4);
    //     return this;
    // }

    // applyQuaternion(q) {
    //     Vec3Func.transformQuat(this, this, q);
    //     return this;
    // }

    angle(v: Vec3): number {
        const denominator = Math.sqrt(this.squaredLen() * v.squaredLen());
        if (denominator === 0) return PI_OVER_TWO;
        const theta = this.dot(v) / denominator;
        // clamp, to handle numerical problems
        return Math.acos(clamp(theta, -1, 1));
    }

    lerp(v: Vec3, t: number) {
        this.x += t * (v.x - this.x);
        this.y += t * (v.y - this.y);
        this.z += t * (v.z - this.z);
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        return this;
    }

    toArray(a: Float32Array | Array<number> = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    // TODO: mat4
    // transformDirection(mat4) {
    //     const x = this[0];
    //     const y = this[1];
    //     const z = this[2];

    //     this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
    //     this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
    //     this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

    //     return this.normalize();
    // }
}
