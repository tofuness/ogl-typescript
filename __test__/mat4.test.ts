import { translate } from '../src/math/functions/Mat4Func';
import { Mat4 } from '../src/math/Mat4';
import { Vec3 } from '../src/math/Vec3';

test('test should work', () => {
    expect('A').toBe('A');
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    expect([1, 2, 3]).not.toEqual([1, 2, 3, 4]);
    expect([1, 2, 3]).not.toEqual([3, 2, 1]);
    expect(new Mat4()).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(matrixEquals4(new Mat4(), new Mat4())).toBeTruthy();
    expect(matrixEquals4(new Mat4(), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])).toBeTruthy();
});

describe('mat4', () => {
    let identity: Mat4;
    let mat1: Mat4;
    let mat2: Mat4;
    let mat3: Mat4;
    const X: Vec3 = new Vec3(1, 0, 0);
    const Y: Vec3 = new Vec3(0, 1, 0);
    const Z: Vec3 = new Vec3(0, 0, 1);

    beforeEach(() => {
        identity = new Mat4();
        mat1 = new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1);
        mat2 = new Mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        mat3 = new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1);
    });

    test('x,y,z', () => {
        identity.x = 1;
        identity.y = 2;
        identity.z = 3;
        expect(identity).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
        expect(identity.x).toBe(1);
        expect(identity.y).toBe(2);
        expect(identity.z).toBe(3);

        identity.setPosition(new Vec3(4, 5, 6));
        expect(identity).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1]);
        expect(identity.x).toBe(4);
        expect(identity.y).toBe(5);
        expect(identity.z).toBe(6);
    });

    test('set in row-major save in column major', () => {
        expect(matrixEquals4(mat2, [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16])).toBeTruthy();
        mat1.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        expect(matrixEquals4(mat1, [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16])).toBeTruthy();
    });

    // prettier-ignore
    test('transpose', () => {
        expect(mat1.transpose()).toEqual([
            1, 0, 0, 0, 
            0, 1, 0, 0, 
            0, 0, 1, 0, 
            1, 2, 3, 1
        ]);
        expect(matrixEquals4(mat2.transpose(), new Mat4(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16))).toBeTruthy();
        mat1.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        expect(matrixEquals4(mat1.transpose(), new Mat4(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16))).toBeTruthy();
    });

    test('translate', () => {
        console.log(...new Vec3());
        expect(matrixEquals4(identity.clone().translate(1, 2, 3), new Mat4().setPosition(new Vec3(1, 2, 3)))).toBeTruthy();
        expect(matrixEquals4(new Mat4().preTranslate(1, 2, 3), new Mat4().setPosition(new Vec3(1, 2, 3)))).toBeTruthy();
        expect(matrixEquals4(new Mat4().preTranslate(1, 2, 3), new Mat4().translate(1, 2, 3))).toBeTruthy();
        expect(matrixEquals4(mat2.clone().preTranslate(1, 2, 3), mat2.clone().translate(1, 2, 3))).toBeFalsy();
        expect(matrixEquals4(identity.clone().translate(1, 2, 3).preTranslate(-1, -2, -3), identity)).toBeTruthy();

        // TODO: transform vector
    });

    // prettier-ignore
    test('rotateX/Y/Z', () => {
        expect(matrixEquals4(
            new Mat4().rotateX(0.12), 
            new Mat4().preRotateX(0.12))
        ).toBeTruthy();

        expect(matrixEquals4(
            new Mat4().rotateY(0.12), 
            new Mat4().preRotateY(0.12))
        ).toBeTruthy();

        expect(matrixEquals4(
            new Mat4().rotateZ(0.12), 
            new Mat4().preRotateZ(0.12))
        ).toBeTruthy();

        // I * X * Y = X * I * Y
        expect(matrixEquals4(
            new Mat4().rotateX(0.12).rotateY(Math.PI / 3), 
            new Mat4().rotateY(Math.PI / 3).preRotateX(0.12))
        ).toBeTruthy();

        // I * X * Y * Z  =  X * Y * Z * I
        expect(matrixEquals4(
            new Mat4().rotateX(0.12).rotateY(Math.PI / 3).rotateZ(1.24), 
            new Mat4().preRotateZ(1.24).preRotateY(Math.PI / 3).preRotateX(0.12))
        ).toBeTruthy();

        // console.log( mat1.clone().rotateX(0.12));
        // console.log(mat1.clone().fromRotationAxis(X, 0.12))
        // console.log(mat1.clone().multiply( new Mat4().fromRotationAxis(X,0.12)));

        // //
        expect(matrixEquals4(
            new Mat4().rotateX(0.12), 
            new Mat4().multiply( new Mat4().fromRotationAxis(X,0.12))
        )).toBeTruthy();

        // rotateX(rad) = rotate(rad,X)
        expect(matrixEquals4(
            new Mat4().rotateX(0.12), 
            new Mat4().rotate(0.12,X)
        )).toBeTruthy();

        expect(matrixEquals4(
                    new Mat4().rotateY(0.12), 
                    new Mat4().rotate(0.12,Y)
                )).toBeTruthy();
        expect(matrixEquals4(
                    new Mat4().rotateZ(0.12), 
                    new Mat4().rotate(0.12,Z)
                )).toBeTruthy();


    });

    test('multiply', () => {
        mat1.multiply(mat3);

        expect(matrixEquals4(mat1, new Mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 7, 9, 1))).toBeTruthy();

        let m = new Mat4().fromRotationAxis(X, 0.2);

        // I * m = m
        expect(matrixEquals4(identity.multiply(m), m)).toBeTruthy();
    });

    test('identity', () => {
        expect(mat1.identity()).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    test('create', () => {
        expect(new Mat4()).toEqual(identity);
    });

    // prettier-ignore
    test('clone', () => {
        const c =new Mat4().clone()
        expect(c).toEqual(identity);
        expect(c === identity).toBeFalsy();
        expect(mat1.clone()).toEqual([
            1, 0, 0, 1, 
            0, 1, 0, 2, 
            0, 0, 1, 3, 
            0, 0, 0, 1
        ]);
    });

    test('invert translate', () => {
        let m = new Mat4().translate(1, 2, 3);
        let m2 = new Mat4().translate(-1, -2, -3);
        m.inverse();
        expect(m).toEqual(m2);
    });

    test('invert scale', () => {
        // mat1.scale(new Vec3(4, 5, 6));
        // expect(mat1).toEqual(new Mat4(1, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1, 3, 0, 0, 0, 1));
        // let m2 = new Mat4().scale(new Vec3(-1, -2, -3));
        // m.inverse();
        // console.log(mat1);
        // console.log(m2);
        // expect(m).toEqual(m2);
        // var a = new Mat4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        // var b = new Vec3(2, 3, 4);
        // var c = new Mat4().set(2, 6, 12, 4, 10, 18, 28, 8, 18, 30, 44, 12, 26, 42, 60, 16);
        // a.scale(b);
        // console.log(a);
        // expect(matrixEquals4(a, c)).toBeTruthy();
    });
    //-----------------
    // test('translate', () => {
    //     // let m = new Mat4().translate(new Vec3(1, 2, 3));
    //     let m = new Mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16).translate(new Vec3(1, 2, 3));
    //     // console.log(m);
    //     let m2 = new Mat4(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    //     // translate(m2, m2, new Vec3(1, 2, 3));
    //     // console.log(m2);
    // });
});

function matrixEquals4(a: number[], b: number[], tolerance = 0.0001) {
    if (a.length != b.length) {
        return false;
    }
    for (var i = 0, il = a.length; i < il; i++) {
        var delta = a[i] - b[i];
        if (delta > tolerance) {
            return false;
        }
    }
    return true;
}
