import { Transform } from './core/Transform';
import { Mesh } from './core/Mesh';
import { OGLRenderingContext } from './core/Renderer';

export const isArrayLike = <T>(term: any): term is ArrayLike<T> => {
    if (term.length) return true;
    return false;
};

export const isMesh = (node: Transform | Mesh): node is Mesh => {
    return !!(node as any).draw;
};

export const isWebGl2 = (gl: OGLRenderingContext): gl is OGLRenderingContext & WebGL2RenderingContext => {
    return gl.renderer.isWebgl2;
};
