import * as Mat4Func from './functions/Mat4Func';
import { Vec3 } from './Vec3';

// prettier-ignore
export class Mat4 extends Array<number> {
    /**
     * create a 4*4 Matrix
     *
     * m11, m12, m13, m14
     * m21, m22, m23, m24
     * m31, m32, m33, m34
     * m41, m42, m43, m44
     *
     * default to :
     *
     * 1 0 0 0
     * 0 1 0 0
     * 0 0 1 0
     * 0 0 0 1
     *
     * in column major, we store as
     * [m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44]
     *
     * @param m11 row 1 column 1
     * @param m12 row 1 column 2
     * @param m13 row 1 column 3
     * @param m14 row 1 column 4
     * @param m21 row 2 column 1
     * @param m22 row 2 column 2
     * @param m23 row 2 column 3
     * @param m24 row 2 column 4
     * @param m31 row 3 column 1
     * @param m32 row 3 column 2
     * @param m33 row 3 column 3
     * @param m34 row 3 column 4
     * @param m41 row 4 column 1
     * @param m42 row 4 column 2
     * @param m43 row 4 column 3
     * @param m44 row 4 column 4
     * @returns a new 4*4 matrix in column major
     */
    constructor(
        m11 = 1, m12 = 0, m13 = 0, m14 = 0,
        m21 = 0, m22 = 1, m23 = 0, m24 = 0,
        m31 = 0, m32 = 0, m33 = 1, m34 = 0,
        m41 = 0, m42 = 0, m43 = 0, m44 = 1
    ) {
        super(
            m11, m21, m31, m41,
            m12, m22, m32, m42, 
            m13, m23, m33, m43, 
            m14, m24, m34, m44);
        return this;
    }

    get x() {
        // m14
        return this[12];
    }

    get y() {
        //m24
        return this[13];
    }

    get z() {
        // m34
        return this[14];
    }

    get w() {
        // m44
        return this[15];
    }

    set x(v: number) {
        this[12] = v;
    }

    set y(v: number) {
        this[13] = v;
    }

    set z(v: number) {
        this[14] = v;
    }

    set w(v: number) {
        this[15] = v;
    }

    /**
     * set in row-major, we store in column-major
     * [m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44]
     *
     * @param m11 row 1 column 1
     * @param m12 row 1 column 2
     * @param m13 row 1 column 3
     * @param m14 row 1 column 4
     * @param m21 row 2 column 1
     * @param m22 row 2 column 2
     * @param m23 row 2 column 3
     * @param m24 row 2 column 4
     * @param m31 row 3 column 1
     * @param m32 row 3 column 2
     * @param m33 row 3 column 3
     * @param m34 row 3 column 4
     * @param m41 row 4 column 1
     * @param m42 row 4 column 2
     * @param m43 row 4 column 3
     * @param m44 row 4 column 4
     * @returns
     */
    set(
        m11 = 1, m12 = 0, m13 = 0, m14 = 0,
        m21 = 0, m22 = 1, m23 = 0, m24 = 0,
        m31 = 0, m32 = 0, m33 = 1, m34 = 0,
        m41 = 0, m42 = 0, m43 = 0, m44 = 1
    ): this {
        this[0]  = m11; this[1]  = m21; this[2]  = m31; this[3]  = m41;
        this[4]  = m12; this[5]  = m22; this[6]  = m32; this[7]  = m42;
        this[8]  = m13; this[9]  = m23; this[10] = m33; this[11] = m43;
        this[12] = m14; this[13] = m24; this[14] = m34; this[15] = m44;
        return this;
    }

    /**
     * Translate by the given vector 3
     *
     * 1 0 0 x     m[0] m[4] m[8]  m[12]
     * 0 1 0 y  *  m[1] m[5] m[9]  m[13]
     * 0 0 1 z     m[2] m[6] m[10] m[14]
     * 0 0 0 1     m[3] m[7] m[11] m[15]
     *
     * m[0] + x * m[3], m[4] + x * m[7], m[8] + x * m[11],  m[12] + x * m[15]
     * m[1] + y * m[3], m[5] + y * m[7], m[9] + y * m[11],  m[13] + y * m[15]
     * m[2] + z * m[3], m[6] + z * m[7], m[10] + z * m[11], m[14] + z * m[15]
     * m[3]           , m[7]           , m[11]            , m[15]
     *
     * @param v Vec3
     * @returns this
     */
    translate(v: Vec3): this {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        this[0] += x * this[3]; this[4] += x * this[7]; this[8]  += x * this[11]; this[12] += x * this[15];
        this[1] += y * this[3]; this[5] += y * this[7]; this[9]  += y * this[11]; this[13] += y * this[15];
        this[2] += z * this[3]; this[6] += z * this[7]; this[10] += z * this[11]; this[14] += z * this[15];
        return this;
    }

    /**
     * Rotate radians around x axis
     * 
     * 1, 0,  0, 0,     m[0] m[4] m[8]  m[12]
     * 0, c, -s, 0,  *  m[1] m[5] m[9]  m[13]
     * 0, s,  c, 0,     m[2] m[6] m[10] m[14]
     * 0, 0,  0, 1      m[3] m[7] m[11] m[15]
     * 
     * m[0]               , m[4]               , m[8]                , m[12]
     * c * m[1] - s * m[2], c * m[5] - s * m[6], c * m[9] - s * m[10], c * m[13] - s * m[14]
     * s * m[1] + c * m[2], s * m[5] + c * m[6], s * m[9] + c * m[10], s * m[13] + c * m[14]
     * m[3]               , m[7]               , m[11]               , m[15]
     * 
     * @param rad radians
     * @returns this
     */
    rotateX(rad:number):this{
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const t1 = this[1];
        const t2 = this[2];
        const t5 = this[5];
        const t6 = this[6];
        const t9 = this[9];
        const t10 = this[10];
        const t13 = this[13];
        const t14 = this[14];

        this[1] = c * t1 - s * t2;
        this[2] = s * t1 + c * t2;
        this[5] = c * t5 - s * t6;
        this[6] = s * t5 + c * t6;
        this[9] = c * t9 - s * t10;
        this[10] = s * t9 + c * t10;
        this[13] = c * t13 - s * t14;
        this[14] = s * t13 + c * t14;

        return this;
    }

    /**
     * Rorate radians around y axis
     * 
     * c , 0,  s, 0,
     * 0 , 1,  0, 0,  *  this
     * -s, 0,  c, 0,
     * 0 , 0,  0, 1
     * 
     * @param rad radians
     * @returns this
     */
    rotateY(rad:number):this{
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        return this;
    }

    /**
     * Rorate radians around z axis
     * 
     * c, -s, 0, 0,
     * s,  c, 0, 0,  *  this
     * 0,  0, 1, 0,
     * 0,  0, 0, 1
     * 
     * @param rad radians
     * @returns this
     */
    rotateZ(rad:number):this{
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        return this;
    }

    rotate(v, axis, m = this) {
        Mat4Func.rotate(this, m, v, axis);
        return this;
    }

    /**
     * Scale by the given vector 3
     *
     * x 0 0 0     m[0] m[4] m[8]  m[12]
     * 0 y 0 0  *  m[1] m[5] m[9]  m[13]
     * 0 0 z 0     m[2] m[6] m[10] m[14]
     * 0 0 0 1     m[3] m[7] m[11] m[15]
     *
     * x * m[0], x * m[4], x * m[8] , x * m[12]
     * y * m[1], y * m[5], y * m[9] , y * m[13]
     * z * m[2], z * m[6], z * m[10], z * m[14]
     * m[3]    , m[7]    , m[11]    , m[15]
     *
     *
     * @param v Vec3
     * @returns this
     */
    scale(v: Vec3): this {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        this[0] *= x; this[4] *= x; this[8]  *= x; this[12] *= x;
        this[1] *= y; this[5] *= y; this[9]  *= y; this[13] *= y;
        this[2] *= z; this[6] *= z; this[10] *= z; this[14] *= z;
        return this;
    }

    multiply(ma, mb) {
        if (mb) {
            Mat4Func.multiply(this, ma, mb);
        } else {
            Mat4Func.multiply(this, this, ma);
        }
        return this;
    }

    identity() {
        Mat4Func.identity(this);
        return this;
    }

    copy(m) {
        Mat4Func.copy(this, m);
        return this;
    }

    fromPerspective({
        fov,
        aspect,
        near,
        far,
    }: Partial<{
        fov: number;
        aspect: number;
        near: number;
        far: number;
    }> = {}) {
        Mat4Func.perspective(this, fov, aspect, near, far);
        return this;
    }

    fromOrthogonal({ left, right, bottom, top, near, far }) {
        Mat4Func.ortho(this, left, right, bottom, top, near, far);
        return this;
    }

    fromQuaternion(q) {
        Mat4Func.fromQuat(this, q);
        return this;
    }

    setPosition(v) {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
        return this;
    }

    inverse(m = this) {
        Mat4Func.invert(this, m);
        return this;
    }

    compose(q, pos, scale) {
        Mat4Func.fromRotationTranslationScale(this, q, pos, scale);
        return this;
    }

    getRotation(q) {
        Mat4Func.getRotation(q, this);
        return this;
    }

    getTranslation(pos) {
        Mat4Func.getTranslation(pos, this);
        return this;
    }

    getScaling(scale) {
        Mat4Func.getScaling(scale, this);
        return this;
    }

    getMaxScaleOnAxis() {
        return Mat4Func.getMaxScaleOnAxis(this);
    }

    lookAt<T extends number[]>(eye: T, target, up) {
        Mat4Func.targetTo(this, eye, target, up);
        return this;
    }

    determinant() {
        return Mat4Func.determinant(this);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        this[4] = a[o + 4];
        this[5] = a[o + 5];
        this[6] = a[o + 6];
        this[7] = a[o + 7];
        this[8] = a[o + 8];
        this[9] = a[o + 9];
        this[10] = a[o + 10];
        this[11] = a[o + 11];
        this[12] = a[o + 12];
        this[13] = a[o + 13];
        this[14] = a[o + 14];
        this[15] = a[o + 15];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        a[o + 4] = this[4];
        a[o + 5] = this[5];
        a[o + 6] = this[6];
        a[o + 7] = this[7];
        a[o + 8] = this[8];
        a[o + 9] = this[9];
        a[o + 10] = this[10];
        a[o + 11] = this[11];
        a[o + 12] = this[12];
        a[o + 13] = this[13];
        a[o + 14] = this[14];
        a[o + 15] = this[15];
        return a;
    }
}
