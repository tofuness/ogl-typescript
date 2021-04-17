import {R as Renderer, a as Camera, O as Orbit, T as Transform, P as Program, M as Mesh} from "./GLTFSkin.e3c4699d.js";
import {P as Plane} from "./Plane.7e1c7186.js";
import {T as TextureLoader} from "./TextureLoader.aa00ac28.js";
document.getElementsByClassName("Info")[0].innerHTML = "Compressed Textures.";
document.title = "OGL \u2022 Compressed Textures";
const vertex = `
            attribute vec2 uv;
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fragment = `
            precision highp float;

            uniform sampler2D tMap;

            varying vec2 vUv;

            void main() {
                gl_FragColor = texture2D(tMap, vUv * 2.0);
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(-1, 0.5, 2);
const controls = new Orbit(camera);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const texture = TextureLoader.load(gl, {
  src: {
    s3tc: "../../assets/compressed/s3tc-m-y.ktx",
    etc: "../../assets/compressed/etc-m-y.ktx",
    pvrtc: "../../assets/compressed/pvrtc-m-y.ktx",
    jpg: "../../assets/compressed/uv.jpg"
  },
  wrapS: gl.REPEAT,
  wrapT: gl.REPEAT
});
document.body.querySelector(".Info").textContent += ` Supported format chosen: '${texture.ext}'.`;
const geometry = new Plane(gl);
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: texture}
  },
  cullFace: null
});
const mesh = new Mesh(gl, {geometry, program});
mesh.setParent(scene);
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  controls.update();
  renderer.render({scene, camera});
}
