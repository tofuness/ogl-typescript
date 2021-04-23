export class Vec2 extends Array<number> {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set(x: number, y: number = x): this {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v: Vec2): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    add(va: Vec2): this {
        this.x += va.x;
        this.y += va.y;
        return this;
    }

    sub(va: Vec2): this {
        this.x -= va.x;
        this.y -= va.y;
        return this;
    }

    multiply(v: Vec2): this {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    divide(v: Vec2): this {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    inverse(): this {
        this.x = 1.0 / this.x;
        this.y = 1.0 / this.y;
        return this;
    }

    squaredLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    len(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    distance(v: Vec2): number {
        const x = v.x - this.x;
        const y = v.y - this.y;
        return Math.sqrt(x * x + y * y);
    }

    squaredDistance(v: Vec2): number {
        const x = v.x - this.x;
        const y = v.y - this.y;
        return x * x + y * y;
    }

    negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    // https://www.youtube.com/watch?v=-n_C7tD55_A
    // 2d cross product
    cross(va: Vec2): number {
        return this.x * va.y - this.y * va.x;
    }

    scale(n: number): this {
        this.x *= n;
        this.y *= n;
        return this;
    }

    normalize(): this {
        // squaredLength()
        let len = this.x * this.x + this.y * this.y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x *= len;
            this.y *= len;
        } else {
            this.x = 1;
            this.y = 0;
        }
        return this;
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    equals(v: Vec2): boolean {
        return this.x === v.x && this.y === v.y;
    }

    // TODO: mat3 mat4
    // applyMatrix3(mat3) {
    //     Vec2Func.transformMat3(this, this, mat3);
    //     return this;
    // }

    // applyMatrix4(mat4) {
    //     Vec2Func.transformMat4(this, this, mat4);
    //     return this;
    // }

    lerp(v: Vec2, t: number): this {
        this.x += t * (v.x - this.x);
        this.y += t * (v.y - this.y);
        return this;
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    fromArray(a: ArrayLike<number>, o: number = 0): this {
        this.x = a[o];
        this.y = a[o + 1];
        return this;
    }

    toArray(a = [], o = 0): number[] {
        a[o] = this.x;
        a[o + 1] = this.y;
        return a;
    }
}
