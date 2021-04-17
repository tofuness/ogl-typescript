import {R as Renderer, a as Camera, T as Transform, b as Texture, P as Program, G as Geometry, M as Mesh} from "./GLTFSkin.e3c4699d.js";
import {B as Box} from "./Box.d06f990d.js";
import "./Plane.7e1c7186.js";
const vertex = `
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
const fragment = `
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
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(3, 1.5, 4);
camera.lookAt([1, 0.2, 0]);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const texture = new Texture(gl);
const img = new Image();
img.onload = () => texture.image = img;
img.src = "../../assets/saddle.jpg";
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: texture}
  }
});
let mesh;
loadModel();
async function loadModel() {
  const data = await (await fetch(`assets/saddle.json`)).json();
  const geometry = new Geometry(gl, {
    position: {size: 3, data: new Float32Array(data.position)},
    uv: {size: 2, data: new Float32Array(data.uv)},
    normal: {size: 3, data: new Float32Array(data.normal)}
  });
  mesh = new Mesh(gl, {geometry, program});
  mesh.position.set(0, 0, 0);
  mesh.setParent(scene);
}
const videoGeometry = new Box(gl, {width: 1.78, height: 1, depth: 1.78});
const videoTexture = new Texture(gl, {
  generateMipmaps: false,
  width: 1024,
  height: 512
});
let video = document.createElement("video");
video.src = "../../assets/laputa.mp4";
video.loop = true;
video.muted = true;
video.play();
const videoProgram = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: videoTexture}
  },
  cullFace: null
});
const videoMesh = new Mesh(gl, {
  geometry: videoGeometry,
  program: videoProgram
});
videoMesh.position.set(0, 0.5, -4);
videoMesh.scale.set(1.5);
videoMesh.setParent(scene);
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  if (video.readyState >= video.HAVE_ENOUGH_DATA) {
    if (!videoTexture.image)
      videoTexture.image = video;
    videoTexture.needsUpdate = true;
  }
  if (mesh)
    mesh.rotation.y -= 5e-3;
  videoMesh.rotation.y += 3e-3;
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Textures. Model by Google Poly. Film by Studio Ghibli.";
document.title = "OGL \u2022 Textures";
