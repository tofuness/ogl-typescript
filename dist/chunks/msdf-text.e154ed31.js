import {R as Renderer, a as Camera, O as Orbit, T as Transform, b as Texture, P as Program, G as Geometry, M as Mesh} from "./GLTFSkin.e3c4699d.js";
function Text({
  font,
  text,
  width = Infinity,
  align = "left",
  size = 1,
  letterSpacing = 0,
  lineHeight = 1.4,
  wordSpacing = 0,
  wordBreak = false
}) {
  const _this = this;
  let glyphs, buffers;
  let baseline, scale;
  const newline = /\n/;
  const whitespace = /\s/;
  {
    parseFont();
    createGeometry();
  }
  function parseFont() {
    glyphs = {};
    font.chars.forEach((d) => glyphs[d.char] = d);
  }
  function createGeometry() {
    font.common.lineHeight;
    baseline = font.common.base;
    scale = size / baseline;
    let chars = text.replace(/[ \n]/g, "");
    let numChars = chars.length;
    buffers = {
      position: new Float32Array(numChars * 4 * 3),
      uv: new Float32Array(numChars * 4 * 2),
      id: new Float32Array(numChars * 4),
      index: new Uint16Array(numChars * 6)
    };
    for (let i = 0; i < numChars; i++) {
      buffers.id[i] = i;
      buffers.index.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3], i * 6);
    }
    layout();
  }
  function layout() {
    const lines = [];
    let cursor = 0;
    let wordCursor = 0;
    let wordWidth = 0;
    let line = newLine();
    function newLine() {
      const line2 = {
        width: 0,
        glyphs: []
      };
      lines.push(line2);
      wordCursor = cursor;
      wordWidth = 0;
      return line2;
    }
    let maxTimes = 100;
    let count = 0;
    while (cursor < text.length && count < maxTimes) {
      count++;
      const char = text[cursor];
      if (!line.width && whitespace.test(char)) {
        cursor++;
        wordCursor = cursor;
        wordWidth = 0;
        continue;
      }
      if (newline.test(char)) {
        cursor++;
        line = newLine();
        continue;
      }
      const glyph = glyphs[char] || glyphs[" "];
      if (line.glyphs.length) {
        const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
        let kern = getKernPairOffset(glyph.id, prevGlyph.id) * scale;
        line.width += kern;
        wordWidth += kern;
      }
      line.glyphs.push([glyph, line.width]);
      let advance = 0;
      if (whitespace.test(char)) {
        wordCursor = cursor;
        wordWidth = 0;
        advance += wordSpacing * size;
      } else {
        advance += letterSpacing * size;
      }
      advance += glyph.xadvance * scale;
      line.width += advance;
      wordWidth += advance;
      if (line.width > width) {
        if (wordBreak && line.glyphs.length > 1) {
          line.width -= advance;
          line.glyphs.pop();
          line = newLine();
          continue;
        } else if (!wordBreak && wordWidth !== line.width) {
          let numGlyphs = cursor - wordCursor + 1;
          line.glyphs.splice(-numGlyphs, numGlyphs);
          cursor = wordCursor;
          line.width -= wordWidth;
          line = newLine();
          continue;
        }
      }
      cursor++;
    }
    if (!line.width)
      lines.pop();
    populateBuffers(lines);
  }
  function populateBuffers(lines) {
    const texW = font.common.scaleW;
    const texH = font.common.scaleH;
    let y = 0.07 * size;
    let j = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let line = lines[lineIndex];
      for (let i = 0; i < line.glyphs.length; i++) {
        const glyph = line.glyphs[i][0];
        let x = line.glyphs[i][1];
        if (align === "center") {
          x -= line.width * 0.5;
        } else if (align === "right") {
          x -= line.width;
        }
        if (whitespace.test(glyph.char))
          continue;
        x += glyph.xoffset * scale;
        y -= glyph.yoffset * scale;
        let w = glyph.width * scale;
        let h = glyph.height * scale;
        buffers.position.set([x, y - h, 0, x, y, 0, x + w, y - h, 0, x + w, y, 0], j * 4 * 3);
        let u = glyph.x / texW;
        let uw = glyph.width / texW;
        let v = 1 - glyph.y / texH;
        let vh = glyph.height / texH;
        buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], j * 4 * 2);
        y += glyph.yoffset * scale;
        j++;
      }
      y -= size * lineHeight;
    }
    _this.buffers = buffers;
    _this.numLines = lines.length;
    _this.height = _this.numLines * size * lineHeight;
  }
  function getKernPairOffset(id1, id2) {
    for (let i = 0; i < font.kernings.length; i++) {
      let k = font.kernings[i];
      if (k.first < id1)
        continue;
      if (k.second < id2)
        continue;
      if (k.first > id1)
        return 0;
      if (k.first === id1 && k.second > id2)
        return 0;
      return k.amount;
    }
    return 0;
  }
  this.resize = function(options) {
    ({width} = options);
    layout();
  };
  this.update = function(options) {
    ({text} = options);
    createGeometry();
  };
}
const vertex100 = `
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
            }
        `;
const fragment100 = `
            #extension GL_OES_standard_derivatives : enable

            precision highp float;
            precision highp int;

            uniform sampler2D tMap;

            varying vec2 vUv;

            void main() {

                vec3 tex = texture2D(tMap, vUv).rgb;
                float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
                float d = fwidth(signedDist);
                float alpha = smoothstep(-d, d, signedDist);

                if (alpha < 0.01) discard;

                gl_FragColor.rgb = vec3(0.0);
                gl_FragColor.a = alpha;
            }
        `;
const vertex300 = `#version 300 es
            precision highp float;
            precision highp int;

            in vec2 uv;
            in vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            out vec2 vUv;

            void main() {
                vUv = uv;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fragment300 = `#version 300 es
            precision highp float;
            precision highp int;

            uniform sampler2D tMap;

            in vec2 vUv;

            out vec4 color;

            void main() {

                vec3 tex = texture(tMap, vUv).rgb;
                float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
                float d = fwidth(signedDist);
                float alpha = smoothstep(-d, d, signedDist);

                if (alpha < 0.01) discard;

                color.rgb = vec3(0.0);
                color.a = alpha;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 45});
camera.position.set(0, 0, 7);
const controls = new Orbit(camera);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const texture = new Texture(gl, {
  generateMipmaps: false
});
const img = new Image();
img.onload = () => texture.image = img;
img.src = "../../assets/fonts/FiraSans-Bold.png";
const program = new Program(gl, {
  vertex: renderer.isWebgl2 ? vertex300 : vertex100,
  fragment: renderer.isWebgl2 ? fragment300 : fragment100,
  uniforms: {
    tMap: {value: texture}
  },
  transparent: true,
  cullFace: null,
  depthWrite: false
});
loadText();
async function loadText() {
  const font = await (await fetch("../../assets/fonts/FiraSans-Bold.json")).json();
  const text = new Text({
    font,
    text: "don't panic",
    width: 4,
    align: "center",
    letterSpacing: -0.05,
    size: 1,
    lineHeight: 1.1
  });
  const geometry = new Geometry(gl, {
    position: {size: 3, data: text.buffers.position},
    uv: {size: 2, data: text.buffers.uv},
    id: {size: 1, data: text.buffers.id},
    index: {data: text.buffers.index}
  });
  const mesh = new Mesh(gl, {geometry, program});
  mesh.position.y = text.height * 0.5;
  mesh.setParent(scene);
}
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  controls.update();
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "MSDF Text Glyphs (Multichannel Signed Distance Fields)";
document.title = "OGL \u2022 MSDF Text Glyphs (Multichannel Signed Distance Fields)";
