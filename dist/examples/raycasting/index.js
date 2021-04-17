import {R as Renderer, a as Camera, O as Orbit, T as Transform, P as Program, M as Mesh, h as Vec2, i as Raycast} from "../../chunks/GLTFSkin.e3c4699d.js";
import {P as Plane} from "../../chunks/Plane.7e1c7186.js";
import {B as Box} from "../../chunks/Box.d06f990d.js";
import {S as Sphere} from "../../chunks/Sphere.f04a3d27.js";
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

            uniform float uHit;

            varying vec3 vNormal;

            void main() {
                vec3 normal = normalize(vNormal);
                float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
                vec3 color = mix(vec3(0.2, 0.8, 1.0), vec3(1.0, 0.2, 0.8), uHit);
                gl_FragColor.rgb = color + lighting * 0.1;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl);
camera.position.set(2, 1, 5);
const orbit = new Orbit(camera);
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
const program = new Program(gl, {
  vertex,
  fragment,
  cullFace: null,
  uniforms: {
    uHit: {value: 0}
  }
});
const plane = new Mesh(gl, {geometry: planeGeometry, program});
plane.position.set(0, 1.3, 0);
plane.setParent(scene);
const sphere = new Mesh(gl, {geometry: sphereGeometry, program});
sphere.setParent(scene);
const cube = new Mesh(gl, {geometry: cubeGeometry, program});
cube.position.set(0, -1.3, 0);
cube.setParent(scene);
function updateHitUniform({mesh}) {
  program.uniforms.uHit.value = mesh.isHit ? 1 : 0;
}
plane.onBeforeRender(updateHitUniform);
sphere.onBeforeRender(updateHitUniform);
cube.onBeforeRender(updateHitUniform);
requestAnimationFrame(update);
function update() {
  requestAnimationFrame(update);
  orbit.update();
  renderer.render({scene, camera});
}
const mouse = new Vec2();
const raycast = new Raycast(gl);
const meshes = [plane, sphere, cube];
sphere.geometry.raycast = "sphere";
document.addEventListener("mousemove", move, false);
document.addEventListener("touchmove", move, false);
function move(e) {
  mouse.set(2 * (e.x / renderer.width) - 1, 2 * (1 - e.y / renderer.height) - 1);
  raycast.castMouse(camera, mouse);
  meshes.forEach((mesh) => mesh.isHit = false);
  const hits = raycast.intersectBounds(meshes);
  hits.forEach((mesh) => mesh.isHit = true);
}
document.getElementsByClassName("Info")[0].innerHTML = "Projection and Raycasting";
document.title = "OGL \u2022 Projection and Raycasting";
