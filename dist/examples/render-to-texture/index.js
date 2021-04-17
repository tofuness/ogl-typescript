import {R as Renderer, a as Camera, b as Texture, P as Program, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {R as RenderTarget} from "../../chunks/RenderTarget.e49cf8bd.js";
import {B as Box} from "../../chunks/Box.d06f990d.js";
import "../../chunks/Plane.7e1c7186.js";
const vertex = `
            precision highp float;
            precision highp int;

            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;

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
                float lighting = 0.2 * dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
                vec3 tex = texture2D(tMap, vUv).rgb;
                gl_FragColor.rgb = tex + lighting + vec3(vUv - 0.5, 0.0) * 0.1;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
const camera = new Camera(gl, {fov: 35});
camera.position.set(0, 1, 5);
camera.lookAt([0, 0, 0]);
const targetCamera = new Camera(gl, {fov: 35});
targetCamera.position.set(0, 1, 5);
targetCamera.lookAt([0, 0, 0]);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  targetCamera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const geometry = new Box(gl);
const texture = new Texture(gl, {
  image: new Uint8Array([191, 25, 54, 255, 96, 18, 54, 255, 96, 18, 54, 255, 37, 13, 53, 255]),
  width: 2,
  height: 2,
  magFilter: gl.NEAREST
});
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: texture}
  }
});
const target = new RenderTarget(gl, {
  width: 512,
  height: 512
});
const targetProgram = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: target.texture}
  }
});
const mesh = new Mesh(gl, {geometry, program});
const targetMesh = new Mesh(gl, {geometry, program: targetProgram});
requestAnimationFrame(update);
function update() {
  requestAnimationFrame(update);
  mesh.rotation.y -= 0.02;
  targetMesh.rotation.y -= 5e-3;
  targetMesh.rotation.x -= 0.01;
  gl.clearColor(0.15, 0.05, 0.2, 1);
  renderer.render({scene: mesh, camera, target});
  gl.clearColor(1, 1, 1, 1);
  renderer.render({scene: targetMesh, camera: targetCamera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Render to texture";
document.title = "OGL \u2022 Render to texture";
