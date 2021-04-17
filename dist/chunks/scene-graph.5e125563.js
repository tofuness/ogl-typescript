import {R as Renderer, a as Camera, P as Program, T as Transform, M as Mesh} from "./GLTFSkin.e3c4699d.js";
import {B as Box} from "./Box.d06f990d.js";
import {S as Sphere} from "./Sphere.f04a3d27.js";
import "./Plane.7e1c7186.js";
const vertex = `
            precision highp float;
            precision highp int;

            attribute vec3 position;
            attribute vec3 normal;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;

            varying vec3 vNormal;
            varying vec4 vMVPos;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                
                vMVPos = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * vMVPos;
            }
        `;
const fragment = `
            precision highp float;
            precision highp int;

            varying vec3 vNormal;
            varying vec4 vMVPos;

            void main() {
                vec3 normal = normalize(vNormal);
                float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
                vec3 color = vec3(1.0, 0.5, 0.2) * (1.0 - 0.5 * lighting) + vMVPos.xzy * 0.1;
                
                float dist = length(vMVPos);
                float fog = smoothstep(4.0, 10.0, dist);
                color = mix(color, vec3(1.0), fog);
                
                gl_FragColor.rgb = color;
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
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const sphereGeometry = new Sphere(gl, {radius: 0.15});
const cubeGeometry = new Box(gl, {width: 0.3, height: 0.3, depth: 0.3});
const program = new Program(gl, {
  vertex,
  fragment
});
const scene = new Transform();
const sphere = new Mesh(gl, {geometry: sphereGeometry, program});
sphere.speed = -0.5;
sphere.setParent(scene);
const shapes = [sphere];
for (let i = 0; i < 50; i++) {
  const geometry = Math.random() > 0.5 ? cubeGeometry : sphereGeometry;
  const shape = new Mesh(gl, {geometry, program});
  shape.scale.set(Math.random() * 0.3 + 0.7);
  shape.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
  shape.speed = (Math.random() - 0.5) * 0.7;
  shape.setParent(shapes[Math.floor(Math.random() * shapes.length)]);
  shapes.push(shape);
}
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  shapes.forEach((shape) => {
    shape.rotation.y += 0.03 * shape.speed;
    shape.rotation.x += 0.04 * shape.speed;
    shape.rotation.z += 0.01 * shape.speed;
  });
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Scene Graph Hierarchy";
document.title = "OGL \u2022 Scene Graph Hierarchy";
