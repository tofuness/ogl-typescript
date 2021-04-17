import {b as Texture} from "./GLTFSkin.e3c4699d.js";
class KTXTexture extends Texture {
  constructor(gl, {buffer, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, anisotropy = 0, minFilter, magFilter} = {}) {
    super(gl, {
      generateMipmaps: false,
      wrapS,
      wrapT,
      anisotropy,
      minFilter,
      magFilter
    });
    if (buffer)
      this.parseBuffer(buffer);
  }
  parseBuffer(buffer) {
    const ktx = new KhronosTextureContainer(buffer);
    ktx.mipmaps.isCompressedTexture = true;
    this.image = ktx.mipmaps;
    this.internalFormat = ktx.glInternalFormat;
    if (ktx.numberOfMipmapLevels > 1) {
      if (this.minFilter === this.gl.LINEAR)
        this.minFilter = this.gl.NEAREST_MIPMAP_LINEAR;
    } else {
      if (this.minFilter === this.gl.NEAREST_MIPMAP_LINEAR)
        this.minFilter = this.gl.LINEAR;
    }
  }
}
class KhronosTextureContainer {
  constructor(buffer) {
    const idCheck = [171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10];
    const id = new Uint8Array(buffer, 0, 12);
    for (let i = 0; i < id.length; i++)
      if (id[i] !== idCheck[i]) {
        console.error("File missing KTX identifier");
        return;
      }
    const size = Uint32Array.BYTES_PER_ELEMENT;
    const head = new DataView(buffer, 12, 13 * size);
    const littleEndian = head.getUint32(0, true) === 67305985;
    const glType = head.getUint32(1 * size, littleEndian);
    if (glType !== 0) {
      console.warn("only compressed formats currently supported");
      return;
    }
    this.glInternalFormat = head.getUint32(4 * size, littleEndian);
    let width = head.getUint32(6 * size, littleEndian);
    let height = head.getUint32(7 * size, littleEndian);
    this.numberOfFaces = head.getUint32(10 * size, littleEndian);
    this.numberOfMipmapLevels = Math.max(1, head.getUint32(11 * size, littleEndian));
    const bytesOfKeyValueData = head.getUint32(12 * size, littleEndian);
    this.mipmaps = [];
    let offset = 12 + 13 * 4 + bytesOfKeyValueData;
    for (let level = 0; level < this.numberOfMipmapLevels; level++) {
      const levelSize = new Int32Array(buffer, offset, 1)[0];
      offset += 4;
      for (let face = 0; face < this.numberOfFaces; face++) {
        const data = new Uint8Array(buffer, offset, levelSize);
        this.mipmaps.push({data, width, height});
        offset += levelSize;
        offset += 3 - (levelSize + 3) % 4;
      }
      width = width >> 1;
      height = height >> 1;
    }
  }
}
let cache = {};
const supportedExtensions = [];
class TextureLoader {
  static load(gl, {
    src,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    anisotropy = 0,
    format = gl.RGBA,
    internalFormat = format,
    generateMipmaps = true,
    minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
    magFilter = gl.LINEAR,
    premultiplyAlpha = false,
    unpackAlignment = 4,
    flipY = true
  } = {}) {
    const support = TextureLoader.getSupportedExtensions(gl);
    let ext = "none";
    if (typeof src === "string") {
      ext = src.split(".").pop().split("?")[0].toLowerCase();
    }
    if (typeof src === "object") {
      for (const prop in src) {
        if (support.includes(prop.toLowerCase())) {
          ext = prop.toLowerCase();
          src = src[prop];
          break;
        }
      }
    }
    const cacheID = String(src) + wrapS + wrapT + anisotropy + format + internalFormat + generateMipmaps + minFilter + magFilter + premultiplyAlpha + unpackAlignment + flipY + gl.renderer.id;
    if (cache[cacheID])
      return cache[cacheID];
    let texture;
    switch (ext) {
      case "ktx":
      case "pvrtc":
      case "s3tc":
      case "etc":
      case "etc1":
      case "astc":
        texture = new KTXTexture(gl, {
          src,
          wrapS,
          wrapT,
          anisotropy,
          minFilter,
          magFilter
        });
        texture.loaded = this.loadKTX(src, texture);
        break;
      case "webp":
      case "jpg":
      case "jpeg":
      case "png":
        texture = new Texture(gl, {
          wrapS,
          wrapT,
          anisotropy,
          format,
          internalFormat,
          generateMipmaps,
          minFilter,
          magFilter,
          premultiplyAlpha,
          unpackAlignment,
          flipY
        });
        texture.loaded = this.loadImage(gl, src, texture);
        break;
      default:
        console.warn("No supported format supplied");
        texture = new Texture(gl);
    }
    texture.ext = ext;
    cache[cacheID] = texture;
    return texture;
  }
  static getSupportedExtensions(gl) {
    if (supportedExtensions.length)
      return supportedExtensions;
    const extensions = {
      pvrtc: gl.renderer.getExtension("WEBGL_compressed_texture_pvrtc") || gl.renderer.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
      s3tc: gl.renderer.getExtension("WEBGL_compressed_texture_s3tc") || gl.renderer.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || gl.renderer.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"),
      etc: gl.renderer.getExtension("WEBGL_compressed_texture_etc"),
      etc1: gl.renderer.getExtension("WEBGL_compressed_texture_etc1"),
      astc: gl.renderer.getExtension("WEBGL_compressed_texture_astc")
    };
    for (const ext in extensions)
      if (extensions[ext])
        supportedExtensions.push(ext);
    if (detectWebP)
      supportedExtensions.push("webp");
    supportedExtensions.push("png", "jpg");
    return supportedExtensions;
  }
  static loadKTX(src, texture) {
    return fetch(src).then((res) => res.arrayBuffer()).then((buffer) => texture.parseBuffer(buffer));
  }
  static loadImage(gl, src, texture) {
    return decodeImage(src).then((imgBmp) => {
      if (!powerOfTwo(imgBmp.width) || !powerOfTwo(imgBmp.height)) {
        if (texture.generateMipmaps)
          texture.generateMipmaps = false;
        if (texture.minFilter === gl.NEAREST_MIPMAP_LINEAR)
          texture.minFilter = gl.LINEAR;
        if (texture.wrapS === gl.REPEAT)
          texture.wrapS = texture.wrapT = gl.CLAMP_TO_EDGE;
      }
      texture.image = imgBmp;
      texture.onUpdate = () => {
        if (imgBmp.close)
          imgBmp.close();
        texture.onUpdate = null;
      };
      return imgBmp;
    });
  }
  static clearCache() {
    cache = {};
  }
}
function detectWebP() {
  return document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") == 0;
}
function powerOfTwo(value) {
  return Math.log2(value) % 1 === 0;
}
function decodeImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "";
    img.src = src;
    img.onload = () => resolve(img);
  });
}
export {TextureLoader as T};
