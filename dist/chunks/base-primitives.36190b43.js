import {R as Renderer, a as Camera, O as Orbit, T as Transform, P as Program, M as Mesh} from "./GLTFSkin.e3c4699d.js";
import {P as Plane} from "./Plane.7e1c7186.js";
import {B as Box} from "./Box.d06f990d.js";
import {S as Sphere} from "./Sphere.f04a3d27.js";
import {C as Cylinder} from "./Cylinder.97b1a4f2.js";
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
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 35});
camera.position.set(0, 1, 7);
camera.lookAt([0, 0, 0]);
const controls = new Orbit(camera);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const planeGeometry = new Plane(gl);
const sphereGeometry = new Sphere(gl);
const cubeGeometry = new Box(gl);
const cylinderGeometry = new Cylinder(gl);
const program = new Program(gl, {
  vertex,
  fragment,
  cullFace: null
});
const plane = new Mesh(gl, {geometry: planeGeometry, program});
plane.position.set(0, 1.3, 0);
plane.setParent(scene);
const sphere = new Mesh(gl, {geometry: sphereGeometry, program});
sphere.position.set(1.3, 0, 0);
sphere.setParent(scene);
const cube = new Mesh(gl, {geometry: cubeGeometry, program});
cube.position.set(0, -1.3, 0);
cube.setParent(scene);
const cylinder = new Mesh(gl, {geometry: cylinderGeometry, program});
cylinder.position.set(-1.3, 0, 0);
cylinder.setParent(scene);
requestAnimationFrame(update);
function update() {
  requestAnimationFrame(update);
  controls.update();
  plane.rotation.y -= 0.02;
  sphere.rotation.y -= 0.03;
  cube.rotation.y -= 0.04;
  cylinder.rotation.y -= 0.02;
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Base Primitives - Plane, Cube, Sphere, Cylinder";
document.title = "OGL \u2022 Base Primitives - Plane, Cube, Sphere, Cylinder";
