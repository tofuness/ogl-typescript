import { OGLRenderingContext } from '../core/Renderer';
export declare class GLTFLoader {
    static load(gl: OGLRenderingContext, src: string): Promise<{
        json: any;
        buffers: [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
        bufferViews: any;
        images: any;
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parse(gl: any, desc: any, dir: any): Promise<{
        json: any;
        buffers: [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
        bufferViews: any;
        images: any;
        textures: any;
        materials: any;
        meshes: any;
        nodes: any;
        animations: any;
        scenes: any;
        scene: any;
    }>;
    static parseDesc(src: any): Promise<any>;
    static unpackGLB(glb: any): any;
    static resolveURI(uri: any, dir: any): string;
    static loadBuffers(desc: any, dir: any): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    static parseBufferViews(gl: any, desc: any, buffers: any): any;
    static parseImages(gl: any, desc: any, dir: any, bufferViews: any): any;
    static parseTextures(gl: any, desc: any, images: any): any;
    static parseMaterials(gl: any, desc: any, textures: any): any;
    static parseSkins(gl: any, desc: any, bufferViews: any): any;
    static parseMeshes(gl: any, desc: any, bufferViews: any, materials: any, skins: any): any;
    static parsePrimitives(gl: any, primitives: any, desc: any, bufferViews: any, materials: any, numInstances: any): any;
    static parseAccessor(index: any, desc: any, bufferViews: any): {
        data: any;
        size: any;
        type: any;
        normalized: any;
        buffer: any;
        stride: any;
        offset: any;
        count: any;
        min: any;
        max: any;
    };
    static parseNodes(gl: any, desc: any, meshes: any, skins: any): any;
    static populateSkins(skins: any, nodes: any): void;
    static parseAnimations(gl: any, desc: any, nodes: any, bufferViews: any): any;
    static parseScenes(desc: any, nodes: any): any;
}
