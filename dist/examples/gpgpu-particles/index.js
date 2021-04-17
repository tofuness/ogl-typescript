import {b as Texture, P as Program, M as Mesh, R as Renderer, a as Camera, h as Vec2, G as Geometry} from "../../chunks/GLTFSkin.e3c4699d.js";
import {R as RenderTarget} from "../../chunks/RenderTarget.e49cf8bd.js";
import {T as Triangle} from "../../chunks/Triangle.f7efba91.js";
class GPGPU {
  constructor(gl2, {
    data = new Float32Array(16),
    geometry: geometry2 = new Triangle(gl2),
    type = null
  }) {
    this.gl = gl2;
    const initialData = data;
    this.passes = [];
    this.geometry = geometry2;
    this.dataLength = initialData.length / 4;
    this.size = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(this.dataLength))) / Math.LN2));
    this.coords = new Float32Array(this.dataLength * 2);
    for (let i = 0; i < this.dataLength; i++) {
      const x = i % this.size / this.size;
      const y = Math.floor(i / this.size) / this.size;
      this.coords.set([x, y], i * 2);
    }
    const floatArray = (() => {
      if (initialData.length === this.size * this.size * 4) {
        return initialData;
      } else {
        const a = new Float32Array(this.size * this.size * 4);
        a.set(initialData);
        return a;
      }
    })();
    this.uniform = {
      value: new Texture(gl2, {
        image: floatArray,
        target: gl2.TEXTURE_2D,
        type: gl2.FLOAT,
        format: gl2.RGBA,
        internalFormat: gl2.renderer.isWebgl2 ? gl2.RGBA32F : gl2.RGBA,
        wrapS: gl2.CLAMP_TO_EDGE,
        wrapT: gl2.CLAMP_TO_EDGE,
        generateMipmaps: false,
        minFilter: gl2.NEAREST,
        magFilter: gl2.NEAREST,
        width: this.size,
        flipY: false
      })
    };
    const options = {
      width: this.size,
      height: this.size,
      type: type || gl2.HALF_FLOAT || gl2.renderer.extensions["OES_texture_half_float"].HALF_FLOAT_OES,
      format: gl2.RGBA,
      internalFormat: gl2.renderer.isWebgl2 ? type === gl2.FLOAT ? gl2.RGBA32F : gl2.RGBA16F : gl2.RGBA,
      minFilter: gl2.NEAREST,
      depth: false,
      unpackAlignment: 1
    };
    this.fbo = {
      read: new RenderTarget(gl2, options),
      write: new RenderTarget(gl2, options),
      swap: () => {
        let temp = this.fbo.read;
        this.fbo.read = this.fbo.write;
        this.fbo.write = temp;
        this.uniform.value = this.fbo.read.texture;
      }
    };
  }
  addPass({vertex: vertex2 = defaultVertex, fragment: fragment2 = defaultFragment, uniforms = {}, textureUniform = "tMap", enabled = true} = {}) {
    uniforms[textureUniform] = this.uniform;
    const program2 = new Program(this.gl, {vertex: vertex2, fragment: fragment2, uniforms});
    const mesh = new Mesh(this.gl, {geometry: this.geometry, program: program2});
    const pass = {
      mesh,
      program: program2,
      uniforms,
      enabled,
      textureUniform
    };
    this.passes.push(pass);
    return pass;
  }
  render() {
    const enabledPasses = this.passes.filter((pass) => pass.enabled);
    enabledPasses.forEach((pass, i) => {
      this.gl.renderer.render({
        scene: pass.mesh,
        target: this.fbo.write,
        clear: false
      });
      this.fbo.swap();
    });
  }
}
const defaultVertex = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;
const defaultFragment = `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
const vertex = `
            precision highp float;

            attribute vec2 coords;
            attribute vec4 random;

            uniform float uTime;
            uniform sampler2D tPosition;
            uniform sampler2D tVelocity;

            varying vec4 vRandom;
            varying vec4 vVelocity;

            void main() {
                vRandom = random;

                // Get position from texture, rather than attribute
                vec4 position = texture2D(tPosition, coords);
                vVelocity = texture2D(tVelocity, coords);
                
                // Add some subtle random oscillating so it never fully stops
                position.xy += sin(vec2(uTime) * vRandom.wy + vRandom.xz * 6.28) * vRandom.zy * 0.1;

                gl_Position = vec4(position.xy, 0, 1);
                gl_PointSize = mix(2.0, 15.0, vRandom.x);

                // Make bigger while moving
                gl_PointSize *= 1.0 + min(1.0, length(vVelocity.xy));

            }
        `;
const fragment = `
            precision highp float;

            varying vec4 vRandom;
            varying vec4 vVelocity;

            void main() {

                // Circle shape
                if (step(0.5, length(gl_PointCoord.xy - 0.5)) > 0.0) discard;

                // Random colour
                vec3 color = vec3(vRandom.zy, 1.0) * mix(0.7, 2.0, vRandom.w);

                // Fade to white when not moving, with an ease off curve
                gl_FragColor.rgb = mix(vec3(1), color, 1.0 - pow(1.0 - smoothstep(0.0, 0.7, length(vVelocity.xy)), 2.0));

                gl_FragColor.a = 1.0;
            }
        `;
const positionFragment = `
            precision highp float;

            uniform float uTime;
            uniform sampler2D tVelocity;

            // Default texture uniform for GPGPU pass is 'tMap'.
            // Can use the textureUniform parameter to update.
            uniform sampler2D tMap;

            varying vec2 vUv;

            void main() {
                vec4 position = texture2D(tMap, vUv);
                vec4 velocity = texture2D(tVelocity, vUv);

                position.xy += velocity.xy * 0.01;
                                
                // Keep in bounds
                vec2 limits = vec2(1);
                position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 2.0;
                position.xy -= step(limits.xy, position.xy) * limits.xy * 2.0;

                gl_FragColor = position;
            }
        `;
const velocityFragment = `
            precision highp float;

            uniform float uTime;
            uniform sampler2D tPosition;
            uniform sampler2D tMap;
            uniform vec2 uMouse;

            varying vec2 vUv;

            void main() {
                vec4 position = texture2D(tPosition, vUv);
                vec4 velocity = texture2D(tMap, vUv);

                // Repulsion from mouse
                vec2 toMouse = position.xy - uMouse;
                float strength = smoothstep(0.3, 0.0, length(toMouse));
                velocity.xy += strength * normalize(toMouse) * 0.5;

                // Friction
                velocity.xy *= 0.98;

                gl_FragColor = velocity;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(0, 0, 5);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const time = {value: 0};
const mouse = {value: new Vec2()};
const numParticles = 65536;
const initialPositionData = new Float32Array(numParticles * 4);
const initialVelocityData = new Float32Array(numParticles * 4);
const random = new Float32Array(numParticles * 4);
for (let i = 0; i < numParticles; i++) {
  initialPositionData.set([
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    0,
    1
  ], i * 4);
  initialVelocityData.set([0, 0, 0, 1], i * 4);
  random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
}
const position = new GPGPU(gl, {data: initialPositionData});
const velocity = new GPGPU(gl, {data: initialVelocityData});
position.addPass({
  fragment: positionFragment,
  uniforms: {
    uTime: time,
    tVelocity: velocity.uniform
  }
});
velocity.addPass({
  fragment: velocityFragment,
  uniforms: {
    uTime: time,
    uMouse: mouse,
    tPosition: position.uniform
  }
});
const geometry = new Geometry(gl, {
  random: {size: 4, data: random},
  coords: {size: 2, data: position.coords}
});
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    uTime: time,
    tPosition: position.uniform,
    tVelocity: velocity.uniform
  }
});
const points = new Mesh(gl, {geometry, program, mode: gl.POINTS});
const isTouchCapable = "ontouchstart" in window;
if (isTouchCapable) {
  window.addEventListener("touchstart", updateMouse, false);
  window.addEventListener("touchmove", updateMouse, false);
} else {
  window.addEventListener("mousemove", updateMouse, false);
}
function updateMouse(e) {
  if (e.changedTouches && e.changedTouches.length) {
    e.x = e.changedTouches[0].pageX;
    e.y = e.changedTouches[0].pageY;
  }
  if (e.x === void 0) {
    e.x = e.pageX;
    e.y = e.pageY;
  }
  mouse.value.set(e.x / gl.renderer.width * 2 - 1, (1 - e.y / gl.renderer.height) * 2 - 1);
}
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  time.value = t * 1e-3;
  velocity.render();
  position.render();
  renderer.render({scene: points, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "GPGPU Particles (General-Purpose computing on Graphics Processing Units)";
document.title = "OGL \u2022 GPGPU Particles (General-Purpose computing on Graphics Processing Units)";
