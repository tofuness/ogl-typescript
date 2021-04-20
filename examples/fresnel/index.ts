import { Renderer, Camera, Transform, Program, Mesh, Sphere, Vec3 } from '../../src';

const params = {
    backgroundColor: { r: 182, g: 216, b: 242 },
    baseColor: { r: 182, g: 216, b: 242 },
    fresnelColor: { r: 247, g: 246, b: 207 },
    fresnelFactor: 1.5,
};

{
    const renderer = new Renderer({ dpr: 2 });
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    gl.clearColor(params.backgroundColor.r / 255, params.backgroundColor.g / 255, params.backgroundColor.b / 255, 1);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 1, 7);
    camera.lookAt([0, 0, 0]);

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }
    window.addEventListener('resize', resize, false);
    resize();

    const scene = new Transform();

    const sphereGeometry = new Sphere(gl, {
        radius: 1,
        widthSegments: 128,
    });

    const vertex = /* glsl */ `
        attribute vec3 position;
        attribute vec2 uv;
        attribute vec3 normal;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {					
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vPosition = position;
            vUv = uv;
            vNormal = normalize(vec3(mat3(modelViewMatrix) * normal));
        }
    `;

    const fragment = /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 fresnelColor;
        uniform vec3 baseColor;
        uniform float powerOfFactor;
        uniform vec3 cameraPosition;
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vec3(vPosition.x, vPosition.y, vPosition.z));
            float fresnelFactor = dot(viewDirection, vNormal);
            
            float inversefresnelFactor = clamp(1. - fresnelFactor, 0., 1.);
            
            // Shaping function
            fresnelFactor = pow(fresnelFactor, powerOfFactor);
            inversefresnelFactor = pow(inversefresnelFactor, powerOfFactor);
            gl_FragColor = vec4(fresnelFactor * baseColor + fresnelColor * inversefresnelFactor, 1.);
        }
    `;

    const uniforms = {
        fresnelColor: {
            value: new Vec3(params.fresnelColor.r / 255, params.fresnelColor.g / 255, params.fresnelColor.b / 255),
        },
        baseColor: {
            value: new Vec3(params.baseColor.r / 255, params.baseColor.g / 255, params.baseColor.b / 255),
        },
        powerOfFactor: { value: params.fresnelFactor },
        cameraPosition: { value: camera.position },
    };

    const program = new Program(gl, {
        vertex: vertex,
        fragment: fragment,
        uniforms: uniforms,
    });

    const sphere = new Mesh(gl, { geometry: sphereGeometry, program });
    sphere.setParent(scene);

    requestAnimationFrame(update);
    function update() {
        requestAnimationFrame(update);
        sphere.rotation.x += 0.01;
        sphere.rotation.z += 0.02;

        renderer.render({ scene, camera });
    }
}

document.getElementsByClassName('Info')[0].innerHTML = 'Simple Fresnel Shader';
document.title = 'Frustum Culling. Model by Google Poly';
