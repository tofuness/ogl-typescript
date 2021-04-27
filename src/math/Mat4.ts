import * as Mat4Func from './functions/Mat4Func';
import { Vec3 } from './Vec3';

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
    // prettier-ignore
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

    setPosition(v: Vec3): this {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
        return this;
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
    // prettier-ignore
    set(
        m11 = 1, m12 = 0, m13 = 0, m14 = 0,
        m21 = 0, m22 = 1, m23 = 0, m24 = 0,
        m31 = 0, m32 = 0, m33 = 1, m34 = 0,
        m41 = 0, m42 = 0, m43 = 0, m44 = 1
    ): this {
        this[0] = m11; this[4] = m12; this[8 ] = m13; this[12] = m14;
        this[1] = m21; this[5] = m22; this[9 ] = m23; this[13] = m24;
        this[2] = m31; this[6] = m32; this[10] = m33; this[14] = m34;
        this[3] = m41; this[7] = m42; this[11] = m43; this[15] = m44;
        return this;
    }

    transpose(): this {
        const t = this;
        let temp = t[1];
        t[1] = t[4];
        t[4] = temp;
        temp = t[2];
        t[2] = t[8];
        t[8] = temp;
        temp = t[3];
        t[3] = t[12];
        t[12] = temp;
        temp = t[6];
        t[6] = t[9];
        t[9] = temp;
        temp = t[7];
        t[7] = t[13];
        t[13] = temp;
        temp = t[11];
        t[11] = t[14];
        t[14] = temp;
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
    // prettier-ignore
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
    // prettier-ignore
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
     * Rotate radians around y axis
     *
     * c , 0,  s, 0,     m[0] m[4] m[8] m[12]
     * 0 , 1,  0, 0,  *  m[1] m[5] m[9] m[13]
     * -s, 0,  c, 0,     m[2] m[6] m[10] m[14]
     * 0 , 0,  0, 1      m[3] m[7] m[11] m[15]
     *
     * c * m[0] + s * m[2] , c * m[4] + s * m[6] , c * m[8] + s * m[10] , c * m[12] + s * m[14]
     * m[1]                , m[5]                , m[9]                 , m[13]
     * -s * m[0] + c * m[2], -s * m[4] + c * m[6], -s * m[8] + c * m[10], -s * m[12] + c * m[14]
     * m[3]                , m[7]                , m[11]                , m[15]
     *
     * @param rad radians
     * @returns this
     */
    // prettier-ignore
    rotateY(rad:number):this{
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = this[0];
        const m31 = this[2];
        const m12 = this[4];
        const m32 = this[6];
        const m13 = this[8];
        const m33 = this[10];
        const m14 = this[12];
        const m34 = this[14];
        this[0] = c * m11 + s * m31;  this[4] = c * m12 + s * m32;  this[8] = c * m13 + s * m33;  this[12] = c * m14 + s * m34;
        this[2] = -s * m11 + c * m31; this[6] = -s * m12 + c * m32; this[10] = -s * m13 + c * m33;this[14] = -s * m14 + c * m34; 
        return this;
    }

    /**
     * Rotate radians around z axis
     *
     * c, -s, 0, 0,     m[0] m[4] m[8] m[12]
     * s,  c, 0, 0,  *  m[1] m[5] m[9] m[13]
     * 0,  0, 1, 0,     m[2] m[6] m[10] m[14]
     * 0,  0, 0, 1      m[3] m[7] m[11] m[15]
     *
     * @param rad radians
     * @returns this
     */
    // prettier-ignore
    rotateZ(rad:number):this{
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = this[0];
        const m21 = this[1];
        const m12 = this[4];
        const m22 = this[5];
        const m13 = this[8];
        const m23 = this[9];
        const m14 = this[12];
        const m24 = this[13];

        this[0] = c * m11 - s * m21; this[4] = c * m12 - s * m22; this[8] = c * m13 - s * m23; this[12] = c * m14 - s * m24;
        this[1] = s * m11 + c * m21; this[5] = s * m12 + c * m22; this[9] = s * m13 + c * m23; this[13] = s * m14 + c * m24;
        return this;
    }

    rotate(rad: number, axis: Vec3): this {
        return this.premultiply(new Mat4().fromRotationAxis(axis, rad));
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
    // prettier-ignore
    scale(v: Vec3): this {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        this[0] *= x; this[4] *= x; this[8]  *= x; this[12] *= x;
        this[1] *= y; this[5] *= y; this[9]  *= y; this[13] *= y;
        this[2] *= z; this[6] *= z; this[10] *= z; this[14] *= z;
        return this;
    }

    // prettier-ignore
    multiplyMatrices(ma: Mat4, mb: Mat4): this {

        const t = this;
        const a11 = ma[0], a12 = ma[4], a13 = ma[8],  a14 = ma[12];
        const a21 = ma[1], a22 = ma[5], a23 = ma[9],  a24 = ma[13];
        const a31 = ma[2], a32 = ma[6], a33 = ma[10], a34 = ma[14];
        const a41 = ma[3], a42 = ma[7], a43 = ma[11], a44 = ma[15];

        // Cache only the current column of the second matrix
        let b1 = mb[0], b2 = mb[1], b3 = mb[2], b4 = mb[3];

        t[0] = a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
        t[1] = a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
        t[2] = a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
        t[3] = a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;

        b1 = mb[4]; b2 = mb[5]; b3 = mb[6]; b4 = mb[7];

        t[4] = a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
        t[5] = a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
        t[6] = a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
        t[7] = a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;

        b1 = mb[8]; b2 = mb[9]; b3 = mb[10]; b4 = mb[11];

        t[8] = a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
        t[9] = a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
        t[10] = a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
        t[11] = a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;

        b1 = mb[12]; b2 = mb[13]; b3 = mb[14]; b4 = mb[15];

        t[8] = a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
        t[9] = a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
        t[10] = a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
        t[11] = a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;

        return this;
    }

    multiply(m: Mat4): this {
        return this.multiplyMatrices(this, m);
    }

    premultiply(m: Mat4): this {
        return this.multiplyMatrices(m, this);
    }

    identity(): this {
        return this.set();
    }

    copy(m: Mat4): this {
        const t = this;
        t[0] = m[0];
        t[1] = m[1];
        t[2] = m[2];
        t[3] = m[3];
        t[4] = m[4];
        t[5] = m[5];
        t[6] = m[6];
        t[7] = m[7];
        t[8] = m[8];
        t[9] = m[9];
        t[10] = m[10];
        t[11] = m[11];
        t[12] = m[12];
        t[13] = m[13];
        t[14] = m[14];
        t[15] = m[15];
        return this;
    }

    /**
     * Sets this matrix as rotation transform around axis by rad radians.
     *
     * c = cos(rad) , s = sin(rad) , t = 1 - cos(rad)
     *
     * tx^2 + c , txy - sz, txz + sy, 0
     * txy + sz , ty^2 + c, tyz - sx, 0
     * txz - sy , tyz + sx, tz^2 + c, 0
     * 0        , 0       , 0       , 1
     *
     * @param rad
     * @param axis
     * @returns this
     */
    // prettier-ignore
    fromRotationAxis(axis: Vec3, rad: number): this {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const t = 1 - c;
        const x = axis.x, y = axis.y, z = axis.z;
        const tx = t * x, ty = t * y;

        this.set(
            tx * x + c    , tx * y - s * z, tx * z + s * y, 0,
            tx * y + s * z, ty * y + c    , ty * z - s * x, 0,
            tx * z - s * y, ty * z + s * x, t * z * z + c , 0,
            0             , 0             , 0             , 1
        );

        return this;
    }

    /**
     * Sets this matrix as a perspective projection matrix
     *
     * @param fov Vertical field of view in radians
     * @param aspect Aspect ratio. typically viewport width/height
     * @param near Near bound of the frustum
     * @param far Far bound of the frustum
     * @returns
     */
    // prettier-ignore
    fromPerspective(fov: number, aspect: number, near: number, far: number): this {
        const yScale = 1.0 / Math.tan(fov / 2.0);
        const xScale = yScale / aspect;
        const nf = 1 / (near - far);
        const t = this;
        t[0] = xScale; t[4] = 0;      t[8] = 0;                  t[12] = 0;
        t[1] = 0;      t[5] = yScale; t[9] = 0;                  t[13] = 0;
        t[2] = 0;      t[6] = 0;      t[10] = (far + near) * nf; t[14] = 2 * far * near * nf;
        t[3] = 0;      t[7] = 0;      t[11] = -1;                t[15] = 0;
        return this;
    }

    /**
     * Sets this matrix as a orthogonal projection matrix
     *
     * @param left Left bound of the frustum
     * @param right Right bound of the frustum
     * @param bottom Bottom bound of the frustum
     * @param top Top bound of the frustum
     * @param near Near bound of the frustum
     * @param far Far bound of the frustum
     * @returns this
     */
    // prettier-ignore
    fromOrthogonal(left: number, right: number, bottom: number, top: number, near: number, far: number): this {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        const t = this;
        t[0] = -2 * lr; t[4] = 0;       t[8] = 0;       t[12] = (left + right) * lr;
        t[1] = 0;       t[5] = -2 * bt; t[9] = 0;       t[13] = (top + bottom) * bt;
        t[2] = 0;       t[6] = 0;       t[10] = 2 * nf; t[14] = (far + near) * nf;
        t[3] = 0;       t[7] = 0;       t[11] = 0;      t[15] = 1;
        return this;
    }

    /**
     * Sets this matrix from a Quaternion
     *
     * 1-2y²-2z²    2xy-2zw    2xz+2yw    0
     * 2xy+2zw      1-2x²-2z²  2yz-2xw    0
     * 2xz-2yw      2yz+2xw    1-2x²-2y²  0
     * 0            0          0          1
     * @param q Quaternion to create matrix from
     * @returns
     */
    // prettier-ignore
    fromQuaternion(q) {
        const x = q[0], y = q[1], z = q[2], w = q[3];
        const x2 = x + x, y2 = y + y, z2 = z + z; 
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        const t = this;

        t[0] = 1 - yy - zz;
        t[1] = yx + wz;
        t[2] = zx - wy;
        t[3] = 0;

        t[4] = yx - wz;
        t[5] = 1 - xx - zz;
        t[6] = zy + wx;
        t[7] = 0;

        t[8] = zx + wy;
        t[9] = zy - wx;
        t[10] = 1 - xx - yy;
        t[11] = 0;

        t[12] = 0;
        t[13] = 0;
        t[14] = 0;
        t[15] = 1;

        return this;
    }

    compose(q: Quat, pos: Vec3, scale: Vec3): this {
        const x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        const x2 = x + x,
            y2 = y + y,
            z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = scale.x;
        const sy = scale.y;
        const sz = scale.z;

        const t = this;

        t[0] = (1 - (yy + zz)) * sx;
        t[1] = (yx + wz) * sx;
        t[2] = (zx - wy) * sx;
        t[3] = 0;

        t[4] = (yx - wz) * sy;
        t[5] = (1 - (xx + zz)) * sy;
        t[6] = (zy + wx) * sy;
        t[7] = 0;

        t[8] = (zx + wy) * sz;
        t[9] = (zy - wx) * sz;
        t[10] = (1 - (xx + yy)) * sz;
        t[11] = 0;

        t[12] = pos.x;
        t[13] = pos.y;
        t[14] = pos.z;
        t[15] = 1;

        return this;
    }

    decompose(quat: Quat, pos: Vec3, scale: Vec3) {
        const t = this;
        let sx = Math.hypot(t[0], t[1], t[2]);
        const sy = Math.hypot(t[4], t[5], t[6]);
        const sz = Math.hypot(t[8], t[9], t[10]);

        // if determine is negative, we need to invert one scale
        const det = this.determinant();
        if (det < 0) sx = -sx;

        pos.x = t[12];
        pos.y = t[13];
        pos.z = t[14];

        // scale the rotation part
        _m1.copy(this);

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        _m1[0] *= invSX;
        _m1[1] *= invSX;
        _m1[2] *= invSX;

        _m1[4] *= invSY;
        _m1[5] *= invSY;
        _m1[6] *= invSY;

        _m1[8] *= invSZ;
        _m1[9] *= invSZ;
        _m1[10] *= invSZ;

        // TODO: quat
        quat.setFromRotationMatrix(_m1);

        scale.x = sx;
        scale.y = sy;
        scale.z = sz;

        return this;
    }

    inverse(): this {
        // three.js
        const t = this,
            n11 = t[0],
            n21 = t[1],
            n31 = t[2],
            n41 = t[3],
            n12 = t[4],
            n22 = t[5],
            n32 = t[6],
            n42 = t[7],
            n13 = t[8],
            n23 = t[9],
            n33 = t[10],
            n43 = t[11],
            n14 = t[12],
            n24 = t[13],
            n34 = t[14],
            n44 = t[15],
            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        const detInv = 1 / det;

        t[0] = t11 * detInv;
        t[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        t[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        t[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        t[4] = t12 * detInv;
        t[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        t[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        t[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        t[8] = t13 * detInv;
        t[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        t[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        t[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        t[12] = t14 * detInv;
        t[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        t[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        t[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        return this;
    }

    getRotation(q) {
        Mat4Func.getRotation(q, this);
        return this;
    }

    getTranslation(pos: Vec3): Vec3 {
        pos.x = this[12];
        pos.y = this[13];
        pos.z = this[14];
        return pos;
    }

    getScaling(scale: Vec3): Vec3 {
        const t = this;
        scale.x = Math.hypot(t[0], t[1], t[2]);
        scale.y = Math.hypot(t[4], t[5], t[6]);
        scale.z = Math.hypot(t[8], t[9], t[10]);
        return scale;
    }

    getMaxScaleOnAxis(): number {
        const t = this;
        let n11 = t[0];
        let n21 = t[1];
        let n31 = t[2];
        let n12 = t[4];
        let n22 = t[5];
        let n32 = t[6];
        let n13 = t[8];
        let n23 = t[9];
        let n33 = t[10];

        const x = n11 * n11 + n21 * n21 + n31 * n31;
        const y = n12 * n12 + n22 * n22 + n32 * n32;
        const z = n13 * n13 + n23 * n23 + n33 * n33;

        return Math.sqrt(Math.max(x, y, z));
    }

    lookAt<T extends number[]>(eye: T, target, up) {
        Mat4Func.targetTo(this, eye, target, up);
        return this;
    }

    determinant(): number {
        // http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
        const t = this;
        const m00 = t[0],
            m01 = t[4],
            m02 = t[8],
            m03 = t[12],
            m10 = t[1],
            m11 = t[5],
            m12 = t[9],
            m13 = t[13],
            m20 = t[2],
            m21 = t[6],
            m22 = t[10],
            m23 = t[14],
            m30 = t[3],
            m31 = t[7],
            m32 = t[11],
            m33 = t[15];

        return (
            m03 * m12 * m21 * m30 -
            m02 * m13 * m21 * m30 -
            m03 * m11 * m22 * m30 +
            m01 * m13 * m22 * m30 +
            m02 * m11 * m23 * m30 -
            m01 * m12 * m23 * m30 -
            m03 * m12 * m20 * m31 +
            m02 * m13 * m20 * m31 +
            m03 * m10 * m22 * m31 -
            m00 * m13 * m22 * m31 -
            m02 * m10 * m23 * m31 +
            m00 * m12 * m23 * m31 +
            m03 * m11 * m20 * m32 -
            m01 * m13 * m20 * m32 -
            m03 * m10 * m21 * m32 +
            m00 * m13 * m21 * m32 +
            m01 * m10 * m23 * m32 -
            m00 * m11 * m23 * m32 -
            m02 * m11 * m20 * m33 +
            m01 * m12 * m20 * m33 +
            m02 * m10 * m21 * m33 -
            m00 * m12 * m21 * m33 -
            m01 * m10 * m22 * m33 +
            m00 * m11 * m22 * m33
        );
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

const _m1 = new Mat4();
