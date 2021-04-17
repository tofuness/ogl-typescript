import {R as Renderer, a as Camera, T as Transform, P as Program, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {B as Box} from "../../chunks/Box.d06f990d.js";
import "../../chunks/Plane.7e1c7186.js";
const vertex = `
            precision highp float;
            precision highp int;

            attribute vec3 position;
            attribute vec3 normal;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;

            varying vec3 vNormal;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fragment = `
            precision highp float;
            precision highp int;

            varying vec3 vNormal;

            void main() {
                vec3 normal = normalize(vNormal);
                float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
                gl_FragColor.rgb = vec3(0.2, 0.8, 1.0) + lighting * 0.1;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 35, far: 3e3});
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const cubeGeometry = new Box(gl);
const program = new Program(gl, {
  vertex,
  fragment
});
let meshes = [];
function setMeshCount(count) {
  count = parseInt(count) || 1e3;
  for (let i = 0; i < meshes.length; ++i)
    scene.removeChild(meshes[i]);
  meshes = [];
  for (let i = 0; i < count; ++i) {
    let mesh = new Mesh(gl, {geometry: cubeGeometry, program});
    mesh.position.set(-100 + Math.random() * 200, -100 + Math.random() * 200, -100 + Math.random() * 200);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.addChild(mesh);
    meshes.push(mesh);
  }
  document.getElementById("meshCountInput").value = count;
}
window.setMeshCount = setMeshCount;
setMeshCount(1e3);
requestAnimationFrame(update);
function update() {
  requestAnimationFrame(update);
  let time = performance.now() / 3e4;
  camera.position.set(Math.sin(time) * 180, 80, Math.cos(time) * 180);
  camera.lookAt([0, 0, 0]);
  for (let i = 0; i < meshes.length; ++i) {
    meshes[i].rotation.x += 0.01;
    meshes[i].rotation.y += 0.01;
  }
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Performance - High mesh count</span>";
document.title = "OGL \u2022 Performance - High mesh count";
