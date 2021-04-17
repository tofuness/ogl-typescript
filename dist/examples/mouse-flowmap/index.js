import {h as Vec2, M as Mesh, P as Program, R as Renderer, b as Texture} from "../../chunks/GLTFSkin.e3c4699d.js";
import {T as Triangle} from "../../chunks/Triangle.f7efba91.js";
import {R as RenderTarget} from "../../chunks/RenderTarget.e49cf8bd.js";
class Flowmap {
  constructor(gl2, {
    size = 128,
    falloff = 0.3,
    alpha = 1,
    dissipation = 0.98,
    type
  } = {}) {
    const _this = this;
    this.gl = gl2;
    this.uniform = {value: null};
    this.mask = {
      read: null,
      write: null,
      swap: () => {
        let temp = _this.mask.read;
        _this.mask.read = _this.mask.write;
        _this.mask.write = temp;
        _this.uniform.value = _this.mask.read.texture;
      }
    };
    {
      createFBOs();
      this.aspect = 1;
      this.mouse = new Vec2();
      this.velocity = new Vec2();
      this.mesh = initProgram();
    }
    function createFBOs() {
      if (!type)
        type = gl2.HALF_FLOAT || gl2.renderer.extensions["OES_texture_half_float"].HALF_FLOAT_OES;
      let minFilter = (() => {
        if (gl2.renderer.isWebgl2)
          return gl2.LINEAR;
        if (gl2.renderer.extensions[`OES_texture_${type === gl2.FLOAT ? "" : "half_"}float_linear`])
          return gl2.LINEAR;
        return gl2.NEAREST;
      })();
      const options = {
        width: size,
        height: size,
        type,
        format: gl2.RGBA,
        internalFormat: gl2.renderer.isWebgl2 ? type === gl2.FLOAT ? gl2.RGBA32F : gl2.RGBA16F : gl2.RGBA,
        minFilter,
        depth: false
      };
      _this.mask.read = new RenderTarget(gl2, options);
      _this.mask.write = new RenderTarget(gl2, options);
      _this.mask.swap();
    }
    function initProgram() {
      return new Mesh(gl2, {
        geometry: new Triangle(gl2),
        program: new Program(gl2, {
          vertex: vertex$1,
          fragment: fragment$1,
          uniforms: {
            tMap: _this.uniform,
            uFalloff: {value: falloff * 0.5},
            uAlpha: {value: alpha},
            uDissipation: {value: dissipation},
            uAspect: {value: 1},
            uMouse: {value: _this.mouse},
            uVelocity: {value: _this.velocity}
          },
          depthTest: false
        })
      });
    }
  }
  update() {
    this.mesh.program.uniforms.uAspect.value = this.aspect;
    this.gl.renderer.render({
      scene: this.mesh,
      target: this.mask.write,
      clear: false
    });
    this.mask.swap();
  }
}
const vertex$1 = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;
const fragment$1 = `
    precision highp float;

    uniform sampler2D tMap;

    uniform float uFalloff;
    uniform float uAlpha;
    uniform float uDissipation;
    
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tMap, vUv) * uDissipation;

        vec2 cursor = vUv - uMouse;
        cursor.x *= uAspect;

        vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
        float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

        color.rgb = mix(color.rgb, stamp, vec3(falloff));

        gl_FragColor = color;
    }
`;
const vertex = `
            attribute vec2 uv;
            attribute vec2 position;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;
const fragment = `
            precision highp float;
            precision highp int;

            uniform sampler2D tWater;
            uniform sampler2D tFlow;
            uniform float uTime;

            varying vec2 vUv;

            void main() {
                
                // R and G values are velocity in the x and y direction
                // B value is the velocity length
                vec3 flow = texture2D(tFlow, vUv).rgb;

                // Use flow to adjust the uv lookup of a texture
                vec2 uv = gl_FragCoord.xy / 600.0;
                uv += flow.xy * 0.05;
                vec3 tex = texture2D(tWater, uv).rgb;

                // Oscillate between raw values and the affected texture above
                tex = mix(tex, flow * 0.5 + 0.5, smoothstep( -0.3, 0.7, sin(uTime)));

                gl_FragColor.rgb = tex;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
let aspect = 1;
const mouse = new Vec2(-1);
const velocity = new Vec2();
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  aspect = window.innerWidth / window.innerHeight;
}
window.addEventListener("resize", resize, false);
resize();
const flowmap = new Flowmap(gl);
const geometry = new Triangle(gl);
const texture = new Texture(gl, {wrapS: gl.REPEAT, wrapT: gl.REPEAT});
const img = new Image();
img.onload = () => texture.image = img;
img.src = "../../assets/water.jpg";
const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    uTime: {value: 0},
    tWater: {value: texture},
    tFlow: flowmap.uniform
  }
});
const mesh = new Mesh(gl, {geometry, program});
const isTouchCapable = "ontouchstart" in window;
if (isTouchCapable) {
  window.addEventListener("touchstart", updateMouse, false);
  window.addEventListener("touchmove", updateMouse, false);
} else {
  window.addEventListener("mousemove", updateMouse, false);
}
let lastTime;
const lastMouse = new Vec2();
function updateMouse(e) {
  if (e.changedTouches && e.changedTouches.length) {
    e.x = e.changedTouches[0].pageX;
    e.y = e.changedTouches[0].pageY;
  }
  if (e.x === void 0) {
    e.x = e.pageX;
    e.y = e.pageY;
  }
  mouse.set(e.x / gl.renderer.width, 1 - e.y / gl.renderer.height);
  if (!lastTime) {
    lastTime = performance.now();
    lastMouse.set(e.x, e.y);
  }
  const deltaX = e.x - lastMouse.x;
  const deltaY = e.y - lastMouse.y;
  lastMouse.set(e.x, e.y);
  let time = performance.now();
  let delta = Math.max(14, time - lastTime);
  lastTime = time;
  velocity.x = deltaX / delta;
  velocity.y = deltaY / delta;
  velocity.needsUpdate = true;
}
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  if (!velocity.needsUpdate) {
    mouse.set(-1);
    velocity.set(0);
  }
  velocity.needsUpdate = false;
  flowmap.aspect = aspect;
  flowmap.mouse.copy(mouse);
  flowmap.velocity.lerp(velocity, velocity.len ? 0.5 : 0.1);
  flowmap.update();
  program.uniforms.uTime.value = t * 1e-3;
  renderer.render({scene: mesh});
}
document.getElementsByClassName("Info")[0].innerHTML = 'Mouse Flowmap. Texture by <a href="https://www.deviantart.com/berserkitty/art/Seamless-Cartoon-styled-Water-Texture-743787929" target="_blank">BerserKitty</a>';
document.title = "OGL \u2022 Mouse Flowmap";
