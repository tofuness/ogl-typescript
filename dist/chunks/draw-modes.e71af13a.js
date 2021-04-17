import {R as Renderer, a as Camera, T as Transform, G as Geometry, P as Program, M as Mesh} from "./GLTFSkin.e3c4699d.js";
const vertex = `
            precision highp float;
            precision highp int;

            attribute vec2 uv;
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                
                // gl_PointSize only applicable for gl.POINTS draw mode
                gl_PointSize = 5.0;
            }
        `;
const fragment = `
            precision highp float;
            precision highp int;

            uniform float uTime;

            varying vec2 vUv;

            void main() {
                gl_FragColor.rgb = 0.5 + 0.3 * sin(vUv.yxx + uTime) + vec3(0.2, 0.0, 0.1);
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer();
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 15});
camera.position.z = 15;
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const geometry = new Geometry(gl, {
  position: {size: 3, data: new Float32Array([-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0])},
  uv: {size: 2, data: new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])},
  index: {data: new Uint16Array([0, 1, 2, 1, 3, 2])}
});
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    uTime: {value: 0}
  }
});
const points = new Mesh(gl, {mode: gl.POINTS, geometry, program});
points.setParent(scene);
points.position.set(-1, 1, 0);
const lineStrip = new Mesh(gl, {mode: gl.LINES, geometry, program});
lineStrip.setParent(scene);
lineStrip.position.set(1, 1, 0);
const lineLoop = new Mesh(gl, {mode: gl.LINE_LOOP, geometry, program});
lineLoop.setParent(scene);
lineLoop.position.set(-1, -1, 0);
const triangles = new Mesh(gl, {mode: gl.TRIANGLES, geometry, program});
triangles.setParent(scene);
triangles.position.set(1, -1, 0);
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  program.uniforms.uTime.value = t * 1e-3;
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Draw Modes";
document.title = "OGL \u2022 Draw Modes";
