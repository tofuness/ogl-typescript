import { Transform } from './Transform';
import { Mat3 } from '../math/Mat3';
import { Mat4 } from '../math/Mat4';
import { Geometry } from './Geometry';
import { Program } from './Program';
import { OGLRenderingContext } from './Renderer';
import { Camera } from './Camera';
import { Vec3 } from '../math/Vec3';
import { Vec2 } from '../math/Vec2';

let ID = 0;

export interface MeshOptions {
    geometry: Geometry;
    program: Program;
    mode: GLenum;
    frustumCulled: boolean;
    renderOrder: number;
}

export interface DrawOptions {
    camera: Camera;
}

export class Mesh extends Transform {
    name: string;
    numInstances;

    gl: OGLRenderingContext;
    id: number;
    geometry: Geometry;
    program: Program;
    mode: GLenum;
    frustumCulled: boolean;
    renderOrder: number;

    modelViewMatrix: Mat4;
    normalMatrix: Mat3;

    beforeRenderCallbacks: Array<any>;
    afterRenderCallbacks: Array<any>;

    // raycast.ts
    hit: Partial<{
        localPoint: Vec3;
        distance: number;
        point: Vec3;
        faceNormal: Vec3;
        localFaceNormal: Vec3;
        uv: Vec2;
        localNormal: Vec3;
        normal: Vec3;
    }> = null;

    constructor(
        gl: OGLRenderingContext,
        { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 }: Partial<MeshOptions> = {}
    ) {
        super();
        if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
        this.gl = gl;
        this.id = ID++;
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;

        // Override sorting to force an order
        this.renderOrder = renderOrder;
        this.modelViewMatrix = new Mat4();
        this.normalMatrix = new Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
    }

    onBeforeRender(f) {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f) {
        this.afterRenderCallbacks.push(f);
        return this;
    }

    draw({ camera }: Partial<DrawOptions> = {}) {
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));

        // Set the matrix uniforms
        if (camera) {
            // Add empty matrix uniforms to program if unset
            if (!this.program.uniforms.modelMatrix) {
                Object.assign(this.program.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }

            // Set the matrix uniforms
            this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
            this.program.uniforms.cameraPosition.value = camera.worldPosition;
            this.program.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            this.program.uniforms.modelMatrix.value = this.worldMatrix;
            this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            this.program.uniforms.normalMatrix.value = this.normalMatrix;
        }

        // determine if faces need to be flipped - when mesh scaled negatively
        let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;

        this.program.use({ flipFaces });
        this.geometry.draw({ mode: this.mode, program: this.program });

        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
}
