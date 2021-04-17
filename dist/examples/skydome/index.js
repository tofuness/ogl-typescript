import {R as Renderer, a as Camera, O as Orbit, T as Transform, b as Texture, P as Program, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {S as Sphere} from "../../chunks/Sphere.f04a3d27.js";
const vertex = `
            precision highp float;
            precision highp int;

            attribute vec2 uv;
            attribute vec3 position;
            attribute vec3 normal;

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
            precision highp int;

            uniform sampler2D tMap;

            varying vec2 vUv;

            void main() {
                vec3 tex = texture2D(tMap, vUv).rgb;
                
                gl_FragColor.rgb = tex;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(0, 0, 8);
const controls = new Orbit(camera, {
  enablePan: false,
  enableZoom: false
});
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
img.src = "../assets/sky.jpg";
const geometry = new Sphere(gl, {radius: 1, widthSegments: 64});
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
const skybox = new Mesh(gl, {geometry, program});
skybox.scale.set(10);
skybox.setParent(scene);
requestAnimationFrame(update);
function update() {
  requestAnimationFrame(update);
  controls.update();
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = 'Skydome. Image credit <a href="https://www.flickr.com/photos/charlesashaw/6264765128" target="_blank">charlesashaw</a>.';
document.title = "OGL \u2022 Skydome";
