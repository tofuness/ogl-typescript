import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Transform } from './Transform';
import { Camera } from './Camera';
import { RenderTarget } from './RenderTarget';
export interface RendererOptions {
    canvas: HTMLCanvasElement | null;
    width: number;
    height: number;
    dpr: number;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    antialias: boolean;
    premultipliedAlpha: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: string;
    autoClear: boolean;
    webgl: number;
    gl: OGLRenderingContext | null;
}
export declare type OGLRenderingContext = {
    renderer: Renderer;
    canvas: HTMLCanvasElement;
} & (ExpoWebGLRenderingContext | WebGL2RenderingContext | WebGLRenderingContext);
export declare type DeviceParameters = {
    maxTextureUnits?: number;
    maxAnisotropy?: number;
};
export declare type RenderState = {
    blendFunc?: {
        src: GLenum;
        dst: GLenum;
        srcAlpha?: any;
        dstAlpha?: any;
    };
    blendEquation?: {
        modeRGB: GLenum;
        modeAlpha?: any;
    };
    cullFace?: number;
    frontFace?: number;
    depthMask?: boolean;
    depthFunc?: number;
    premultiplyAlpha?: boolean;
    flipY?: boolean;
    unpackAlignment?: number;
    viewport?: {
        width: number | null;
        height: number | null;
    };
    textureUnits?: Array<number>;
    activeTextureUnit?: number;
    framebuffer?: any;
    boundBuffer?: any;
    uniformLocations?: Map<number, WebGLUniformLocation>;
};
export declare type RenderExtensions = {
    [key: string]: any;
};
export declare class Renderer {
    dpr: number;
    alpha: boolean;
    color: boolean;
    depth: boolean;
    stencil: boolean;
    premultipliedAlpha: boolean;
    autoClear: boolean;
    gl: OGLRenderingContext;
    isWebgl2: boolean;
    width: number;
    height: number;
    parameters: DeviceParameters;
    state: RenderState;
    extensions: RenderExtensions;
    vertexAttribDivisor: Function;
    drawArraysInstanced: Function;
    drawElementsInstanced: Function;
    createVertexArray: Function;
    bindVertexArray: Function;
    deleteVertexArray: Function;
    drawBuffers: Function;
    currentProgram: number;
    currentGeometry: string | null;
    get id(): number;
    private _id;
    constructor({ canvas, width, height, dpr, alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference, autoClear, webgl, gl }?: Partial<RendererOptions>);
    setSize(width: number, height: number): void;
    setViewport(width: number, height: number): void;
    enable(id: GLenum): void;
    disable(id: GLenum): void;
    setBlendFunc(src: GLenum, dst: GLenum, srcAlpha: GLenum, dstAlpha: GLenum): void;
    setBlendEquation(modeRGB: GLenum, modeAlpha: GLenum): void;
    setCullFace(value: GLenum): void;
    setFrontFace(value: GLenum): void;
    setDepthMask(value: GLboolean): void;
    setDepthFunc(value: GLenum): void;
    activeTexture(value: number): void;
    bindFramebuffer({ target, buffer }?: {
        target?: number;
        buffer?: any;
    }): void;
    getExtension(extension: string, webgl2Func?: keyof WebGL2RenderingContext, extFunc?: string): any;
    sortOpaque(a: any, b: any): number;
    sortTransparent(a: any, b: any): number;
    sortUI(a: any, b: any): number;
    getRenderList({ scene, camera, frustumCull, sort }: {
        scene: Transform;
        camera: Camera;
        frustumCull: boolean;
        sort: boolean;
    }): any[];
    render({ scene, camera, target, update, sort, frustumCull, clear, }: Partial<{
        scene: Transform;
        camera: Camera;
        target: RenderTarget;
        update: boolean;
        sort: boolean;
        frustumCull: boolean;
        clear: boolean;
    }>): void;
}
