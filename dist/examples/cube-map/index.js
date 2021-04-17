import {R as Renderer, a as Camera, O as Orbit, T as Transform, b as Texture, P as Program, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {B as Box} from "../../chunks/Box.d06f990d.js";
import "../../chunks/Plane.7e1c7186.js";
const vertex = `
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            varying vec3 vDir;

            void main() {
                vDir = normalize(position);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fragment = `
            precision highp float;

            // uniform type is samplerCube rather than sampler2D
            uniform samplerCube tMap;

            varying vec3 vDir;

            void main() {

                // sample function is textureCube rather than texture2D
                vec3 tex = textureCube(tMap, vDir).rgb;
                
                gl_FragColor.rgb = tex;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(-2, 1, -3);
const controls = new Orbit(camera, {ease: 1});
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const texture = new Texture(gl, {
  target: gl.TEXTURE_CUBE_MAP
});
loadImages();
async function loadImages() {
  function loadImage(src) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });
  }
  const images = await Promise.all([
    loadImage("../../assets/cube/posx.jpg"),
    loadImage("../../assets/cube/negx.jpg"),
    loadImage("../../assets/cube/posy.jpg"),
    loadImage("../../assets/cube/negy.jpg"),
    loadImage("../../assets/cube/posz.jpg"),
    loadImage("../../assets/cube/negz.jpg")
  ]);
  texture.image = images;
}
const geometry = new Box(gl);
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    tMap: {value: texture}
  },
  cullFace: null
});
const skybox = new Mesh(gl, {geometry, program});
skybox.setParent(scene);
skybox.scale.set(20);
const mesh = new Mesh(gl, {geometry, program});
mesh.setParent(scene);
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  controls.update();
  mesh.rotation.y += 3e-3;
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = 'Cube Map. Texture by <a href="http://www.humus.name" target="_blank">Humus</a>';
document.title = "OGL \u2022 Cube Map";
