import { Renderer, Camera, Transform, Texture, TextureLoader, Program, Geometry, Mesh } from '../../src';
import { Box } from '../../src';

const vertex = /* glsl */ `
            precision highp float;
            precision highp int;

            attribute vec2 uv;
            attribute vec3 position;
            attribute vec3 normal;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;

            varying vec2 vUv;
            varying vec3 vNormal;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragment = /* glsl */ `
            precision highp float;
            precision highp int;

            uniform sampler2D tMap;

            varying vec2 vUv;
            varying vec3 vNormal;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 tex = texture2D(tMap, vUv).rgb;
                
                vec3 light = normalize(vec3(0.5, 1.0, -0.3));
                float shading = dot(normal, light) * 0.15;
                
                gl_FragColor.rgb = tex + shading;
                gl_FragColor.a = 1.0;
            }
        `;

const renderer = new Renderer({ dpr: 2 });
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);

const camera = new Camera(gl, { fov: 45 });
camera.position.set(3, 1.5, 4);
camera.lookAt([1, 0.2, 0]);

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
}
window.addEventListener('resize', resize, false);
resize();

const scene = new Transform();

// Upload empty texture while source loading
const texture = new Texture(gl);
const img = new Image();

// update image value with source once loaded
img.onload = () => (texture.image = img);
img.src = '../../assets/saddle.jpg';

// Alternatively, you can use the TextureLoader class's load method that handles
// these steps for you. It also handles compressed textures and fallbacks.
// const texture = TextureLoader.load(gl, { src: 'assets/saddle.jpg'});

const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
        tMap: { value: texture },
    },
});

let mesh;
loadModel();
async function loadModel() {
    const data = await (await fetch(`assets/saddle.json`)).json();

    const geometry = new Geometry(gl, {
        position: { size: 3, data: new Float32Array(data.position) },
        uv: { size: 2, data: new Float32Array(data.uv) },
        normal: { size: 3, data: new Float32Array(data.normal) },
    });

    mesh = new Mesh(gl, { geometry, program });
    mesh.position.set(0, 0, 0);
    mesh.setParent(scene);
}

const videoGeometry = new Box(gl, { width: 1.78, height: 1, depth: 1.78 });

// Init empty texture while source loading
const videoTexture = new Texture(gl, {
    generateMipmaps: false,
    width: 1024,
    height: 512,
});

// Create video with attributes that let it autoplay
// Check update loop to see when video is attached to texture
let video: HTMLVideoElement = document.createElement('video');
video.src = '../../assets/laputa.mp4';

// Disclaimer: video autoplay is a confusing, constantly-changing browser feature.
// The best approach is to never assume that it will work, and therefore prepare for a fallback.
// Tested on mac: Chrome, Safari, Firefox; android: chrome
video.loop = true;
video.muted = true;
video.play();

// TODO: test ios. Possible add following
// video.setAttribute('crossorigin', 'anonymous');
// video.setAttribute('webkit-playsinline', true);
// video.setAttribute('playsinline', true);

const videoProgram = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
        tMap: { value: videoTexture },
    },
    cullFace: null,
});
const videoMesh = new Mesh(gl, {
    geometry: videoGeometry,
    program: videoProgram,
});
videoMesh.position.set(0, 0.5, -4);
videoMesh.scale.set(1.5);
videoMesh.setParent(scene);

requestAnimationFrame(update);
function update(t) {
    requestAnimationFrame(update);

    // Attach video and/or update texture when video is ready
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        if (!videoTexture.image) videoTexture.image = video;
        videoTexture.needsUpdate = true;
    }

    if (mesh) mesh.rotation.y -= 0.005;
    videoMesh.rotation.y += 0.003;
    renderer.render({ scene, camera });
}

document.getElementsByClassName('Info')[0].innerHTML = 'Textures. Model by Google Poly. Film by Studio Ghibli.';
document.title = 'OGL • Textures';
