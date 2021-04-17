import {b as Texture, e as GLTFSkin, M as Mesh, G as Geometry, T as Transform, f as Mat4, g as GLTFAnimation, R as Renderer, a as Camera, O as Orbit, V as Vec3, P as Program} from "./GLTFSkin.e3c4699d.js";
import {T as TextureLoader} from "./TextureLoader.aa00ac28.js";
import {N as NormalProgram} from "./NormalProgram.5be142d7.js";
const TYPE_ARRAY = {
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
  "image/jpeg": Uint8Array,
  "image/png": Uint8Array
};
const TYPE_SIZE = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
const ATTRIBUTES = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv2",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
};
const TRANSFORMS = {
  translation: "position",
  rotation: "quaternion",
  scale: "scale"
};
class GLTFLoader {
  static async load(gl, src) {
    const dir = src.split("/").slice(0, -1).join("/") + "/";
    const desc = await this.parseDesc(src);
    return await this.parse(gl, desc, dir);
  }
  static async parse(gl, desc, dir) {
    if (desc.asset === void 0 || desc.asset.version[0] < 2)
      console.warn("Only GLTF >=2.0 supported. Attempting to parse.");
    const buffers = await this.loadBuffers(desc, dir);
    gl.renderer.bindVertexArray(null);
    const bufferViews = this.parseBufferViews(gl, desc, buffers);
    const images = this.parseImages(gl, desc, dir, bufferViews);
    const textures = this.parseTextures(gl, desc, images);
    const materials = this.parseMaterials(gl, desc, textures);
    const skins = this.parseSkins(gl, desc, bufferViews);
    const meshes = this.parseMeshes(gl, desc, bufferViews, materials, skins);
    const nodes = this.parseNodes(gl, desc, meshes, skins);
    this.populateSkins(skins, nodes);
    const animations = this.parseAnimations(gl, desc, nodes, bufferViews);
    const scenes = this.parseScenes(desc, nodes);
    const scene = scenes[desc.scene];
    for (let i = nodes.length; i >= 0; i--)
      if (!nodes[i])
        nodes.splice(i, 1);
    return {
      json: desc,
      buffers,
      bufferViews,
      images,
      textures,
      materials,
      meshes,
      nodes,
      animations,
      scenes,
      scene
    };
  }
  static async parseDesc(src) {
    if (!src.match(/\.glb$/)) {
      return await fetch(src).then((res) => res.json());
    } else {
      return await fetch(src).then((res) => res.arrayBuffer()).then((glb) => this.unpackGLB(glb));
    }
  }
  static unpackGLB(glb) {
    const header = new Uint32Array(glb, 0, 3);
    if (header[0] !== 1179937895) {
      throw new Error("Invalid glTF asset.");
    } else if (header[1] !== 2) {
      throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
    }
    const jsonChunkHeader = new Uint32Array(glb, 12, 2);
    const jsonByteOffset = 20;
    const jsonByteLength = jsonChunkHeader[0];
    if (jsonChunkHeader[1] !== 1313821514) {
      throw new Error("Unexpected GLB layout.");
    }
    const jsonText = new TextDecoder().decode(glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
    const json = JSON.parse(jsonText);
    if (jsonByteOffset + jsonByteLength === glb.byteLength)
      return json;
    const binaryChunkHeader = new Uint32Array(glb, jsonByteOffset + jsonByteLength, 2);
    if (binaryChunkHeader[1] !== 5130562) {
      throw new Error("Unexpected GLB layout.");
    }
    const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
    const binaryByteLength = binaryChunkHeader[0];
    const binary = glb.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);
    json.buffers[0].binary = binary;
    return json;
  }
  static resolveURI(uri, dir) {
    if (typeof uri !== "string" || uri === "")
      return "";
    if (/^https?:\/\//i.test(dir) && /^\//.test(uri)) {
      dir = dir.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
    }
    if (/^(https?:)?\/\//i.test(uri))
      return uri;
    if (/^data:.*,.*$/i.test(uri))
      return uri;
    if (/^blob:.*$/i.test(uri))
      return uri;
    return dir + uri;
  }
  static async loadBuffers(desc, dir) {
    if (!desc.buffers)
      return null;
    return await Promise.all(desc.buffers.map((buffer) => {
      if (buffer.binary)
        return buffer.binary;
      const uri = this.resolveURI(buffer.uri, dir);
      return fetch(uri).then((res) => res.arrayBuffer());
    }));
  }
  static parseBufferViews(gl, desc, buffers) {
    if (!desc.bufferViews)
      return null;
    const bufferViews = desc.bufferViews.map((o) => Object.assign({}, o));
    desc.meshes && desc.meshes.forEach(({primitives}) => {
      primitives.forEach(({attributes, indices}) => {
        for (let attr in attributes)
          bufferViews[desc.accessors[attributes[attr]].bufferView].isAttribute = true;
        if (indices === void 0)
          return;
        bufferViews[desc.accessors[indices].bufferView].isAttribute = true;
        bufferViews[desc.accessors[indices].bufferView].target = gl.ELEMENT_ARRAY_BUFFER;
      });
    });
    desc.accessors.forEach(({bufferView: i, componentType}) => {
      bufferViews[i].componentType = componentType;
    });
    desc.images && desc.images.forEach(({uri, bufferView: i, mimeType}) => {
      if (i === void 0)
        return;
      bufferViews[i].mimeType = mimeType;
    });
    bufferViews.forEach(({
      buffer: bufferIndex,
      byteOffset = 0,
      byteLength,
      byteStride,
      target = gl.ARRAY_BUFFER,
      name,
      extensions,
      extras,
      componentType,
      mimeType,
      isAttribute
    }, i) => {
      const TypeArray = TYPE_ARRAY[componentType || mimeType];
      const elementBytes = TypeArray.BYTES_PER_ELEMENT;
      const data = new TypeArray(buffers[bufferIndex], byteOffset, byteLength / elementBytes);
      bufferViews[i].data = data;
      bufferViews[i].originalBuffer = buffers[bufferIndex];
      if (!isAttribute)
        return;
      const buffer = gl.createBuffer();
      gl.bindBuffer(target, buffer);
      gl.renderer.state.boundBuffer = buffer;
      gl.bufferData(target, data, gl.STATIC_DRAW);
      bufferViews[i].buffer = buffer;
    });
    return bufferViews;
  }
  static parseImages(gl, desc, dir, bufferViews) {
    if (!desc.images)
      return null;
    return desc.images.map(({uri, bufferView: bufferViewIndex, mimeType, name}) => {
      const image = new Image();
      image.name = name;
      if (uri) {
        image.src = this.resolveURI(uri, dir);
      } else if (bufferViewIndex !== void 0) {
        const {data} = bufferViews[bufferViewIndex];
        const blob = new Blob([data], {type: mimeType});
        image.src = URL.createObjectURL(blob);
      }
      image.ready = new Promise((res) => {
        image.onload = () => res();
      });
      return image;
    });
  }
  static parseTextures(gl, desc, images) {
    if (!desc.textures)
      return null;
    return desc.textures.map(({sampler: samplerIndex, source: sourceIndex, name, extensions, extras}) => {
      const options = {
        flipY: false,
        wrapS: gl.REPEAT,
        wrapT: gl.REPEAT
      };
      const sampler = samplerIndex !== void 0 ? desc.samplers[samplerIndex] : null;
      if (sampler) {
        ["magFilter", "minFilter", "wrapS", "wrapT"].forEach((prop) => {
          if (sampler[prop])
            options[prop] = sampler[prop];
        });
      }
      const texture = new Texture(gl, options);
      texture.name = name;
      const image = images[sourceIndex];
      image.ready.then(() => texture.image = image);
      return texture;
    });
  }
  static parseMaterials(gl, desc, textures) {
    if (!desc.materials)
      return null;
    return desc.materials.map(({
      name,
      extensions,
      extras,
      pbrMetallicRoughness = {},
      normalTexture,
      occlusionTexture,
      emissiveTexture,
      emissiveFactor = [0, 0, 0],
      alphaMode = "OPAQUE",
      alphaCutoff = 0.5,
      doubleSided = false
    }) => {
      const {
        baseColorFactor = [1, 1, 1, 1],
        baseColorTexture,
        metallicFactor = 1,
        roughnessFactor = 1,
        metallicRoughnessTexture
      } = pbrMetallicRoughness;
      if (baseColorTexture) {
        baseColorTexture.texture = textures[baseColorTexture.index];
      }
      if (normalTexture) {
        normalTexture.texture = textures[normalTexture.index];
      }
      if (metallicRoughnessTexture) {
        metallicRoughnessTexture.texture = textures[metallicRoughnessTexture.index];
      }
      if (occlusionTexture) {
        occlusionTexture.texture = textures[occlusionTexture.index];
      }
      if (emissiveTexture) {
        emissiveTexture.texture = textures[emissiveTexture.index];
      }
      return {
        name,
        baseColorFactor,
        baseColorTexture,
        metallicFactor,
        roughnessFactor,
        metallicRoughnessTexture,
        normalTexture,
        occlusionTexture,
        emissiveTexture,
        emissiveFactor,
        alphaMode,
        alphaCutoff,
        doubleSided
      };
    });
  }
  static parseSkins(gl, desc, bufferViews) {
    if (!desc.skins)
      return null;
    return desc.skins.map(({
      inverseBindMatrices,
      skeleton,
      joints
    }) => {
      return {
        inverseBindMatrices: this.parseAccessor(inverseBindMatrices, desc, bufferViews),
        skeleton,
        joints
      };
    });
  }
  static parseMeshes(gl, desc, bufferViews, materials, skins) {
    if (!desc.meshes)
      return null;
    return desc.meshes.map(({
      primitives,
      weights,
      name,
      extensions,
      extras
    }, meshIndex) => {
      let numInstances = 0;
      let skinIndex = false;
      desc.nodes && desc.nodes.forEach(({mesh, skin}) => {
        if (mesh === meshIndex) {
          numInstances++;
          if (skin !== void 0)
            skinIndex = skin;
        }
      });
      primitives = this.parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances).map(({geometry, program, mode}) => {
        const mesh = typeof skinIndex === "number" ? new GLTFSkin(gl, {skeleton: skins[skinIndex], geometry, program, mode}) : new Mesh(gl, {geometry, program, mode});
        mesh.name = name;
        if (mesh.geometry.isInstanced) {
          mesh.numInstances = numInstances;
          mesh.frustumCulled = false;
        }
        return mesh;
      });
      return {
        primitives,
        weights,
        name
      };
    });
  }
  static parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances) {
    return primitives.map(({
      attributes,
      indices,
      material: materialIndex,
      mode = 4,
      targets,
      extensions,
      extras
    }) => {
      const geometry = new Geometry(gl);
      for (let attr in attributes) {
        geometry.addAttribute(ATTRIBUTES[attr], this.parseAccessor(attributes[attr], desc, bufferViews));
      }
      if (indices !== void 0) {
        geometry.addAttribute("index", this.parseAccessor(indices, desc, bufferViews));
      }
      if (numInstances > 1) {
        geometry.addAttribute("instanceMatrix", {
          instanced: 1,
          size: 16,
          data: new Float32Array(numInstances * 16)
        });
      }
      const program = NormalProgram(gl);
      if (materialIndex !== void 0) {
        program.gltfMaterial = materials[materialIndex];
      }
      return {
        geometry,
        program,
        mode
      };
    });
  }
  static parseAccessor(index, desc, bufferViews) {
    const {
      bufferView: bufferViewIndex,
      byteOffset = 0,
      componentType,
      normalized = false,
      count,
      type,
      min,
      max,
      sparse
    } = desc.accessors[index];
    const {
      data,
      originalBuffer,
      buffer,
      byteOffset: bufferByteOffset = 0,
      byteStride = 0,
      target
    } = bufferViews[bufferViewIndex];
    const size = TYPE_SIZE[type];
    const TypeArray = TYPE_ARRAY[componentType];
    const elementBytes = data.BYTES_PER_ELEMENT;
    const componentStride = byteStride / elementBytes;
    const isInterleaved = !!byteStride && componentStride !== size;
    const newData = isInterleaved ? data : new TypeArray(originalBuffer, byteOffset + bufferByteOffset, count * size);
    return {
      data: newData,
      size,
      type: componentType,
      normalized,
      buffer,
      stride: byteStride,
      offset: byteOffset,
      count,
      min,
      max
    };
  }
  static parseNodes(gl, desc, meshes, skins) {
    if (!desc.nodes)
      return null;
    const nodes = desc.nodes.map(({
      camera,
      children,
      skin: skinIndex,
      matrix,
      mesh: meshIndex,
      rotation,
      scale,
      translation,
      weights,
      name,
      extensions,
      extras
    }) => {
      const node = new Transform();
      if (name)
        node.name = name;
      if (matrix) {
        node.matrix.copy(matrix);
        node.decompose();
      } else {
        if (rotation)
          node.quaternion.copy(rotation);
        if (scale)
          node.scale.copy(scale);
        if (translation)
          node.position.copy(translation);
        node.updateMatrix();
      }
      let isInstanced = false;
      let isFirstInstance = true;
      if (meshIndex !== void 0) {
        meshes[meshIndex].primitives.forEach((mesh) => {
          if (mesh.geometry.isInstanced) {
            isInstanced = true;
            if (!mesh.instanceCount) {
              mesh.instanceCount = 0;
            } else {
              isFirstInstance = false;
            }
            node.matrix.toArray(mesh.geometry.attributes.instanceMatrix.data, mesh.instanceCount * 16);
            mesh.instanceCount++;
            if (mesh.instanceCount === mesh.numInstances) {
              delete mesh.numInstances;
              delete mesh.instanceCount;
              mesh.geometry.attributes.instanceMatrix.needsUpdate = true;
            }
          }
          if (isInstanced) {
            if (isFirstInstance)
              mesh.setParent(node);
          } else {
            mesh.setParent(node);
          }
        });
      }
      if (isInstanced) {
        if (!isFirstInstance)
          return null;
        node.matrix.identity();
        node.decompose();
      }
      return node;
    });
    desc.nodes.forEach(({children = []}, i) => {
      children.forEach((childIndex) => {
        if (!nodes[childIndex])
          return;
        nodes[childIndex].setParent(nodes[i]);
      });
    });
    return nodes;
  }
  static populateSkins(skins, nodes) {
    if (!skins)
      return;
    skins.forEach((skin) => {
      skin.joints = skin.joints.map((i, index) => {
        const joint = nodes[i];
        joint.bindInverse = new Mat4(...skin.inverseBindMatrices.data.slice(index * 16, (index + 1) * 16));
        return joint;
      });
      if (skin.skeleton)
        skin.skeleton = nodes[skin.skeleton];
    });
  }
  static parseAnimations(gl, desc, nodes, bufferViews) {
    if (!desc.animations)
      return null;
    return desc.animations.map(({
      channels,
      samplers,
      name
    }) => {
      const data = channels.map(({
        sampler: samplerIndex,
        target
      }) => {
        const {
          input: inputIndex,
          interpolation = "LINEAR",
          output: outputIndex
        } = samplers[samplerIndex];
        const {
          node: nodeIndex,
          path
        } = target;
        const node = nodes[nodeIndex];
        const transform = TRANSFORMS[path];
        const times = this.parseAccessor(inputIndex, desc, bufferViews).data;
        const values = this.parseAccessor(outputIndex, desc, bufferViews).data;
        return {
          node,
          transform,
          interpolation,
          times,
          values
        };
      });
      return {
        name,
        animation: new GLTFAnimation(data)
      };
    });
  }
  static parseScenes(desc, nodes) {
    if (!desc.scenes)
      return null;
    return desc.scenes.map(({
      nodes: nodesIndices = [],
      name,
      extensions,
      extras
    }) => {
      return nodesIndices.reduce((map, i) => {
        if (nodes[i])
          map.push(nodes[i]);
        return map;
      }, []);
    });
  }
}
const shader = {
  vertex: `
precision highp float;
precision highp int;
in vec3 position;
#ifdef UV
    in vec2 uv;
#else
    const vec2 uv = vec2(0);
#endif
#ifdef NORMAL
    in vec3 normal;
#else
    const vec3 normal = vec3(0);
#endif
#ifdef INSTANCED
    in mat4 instanceMatrix;
#endif
#ifdef SKINNING
    in vec4 skinIndex;
    in vec4 skinWeight;
#endif
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;
#ifdef SKINNING
    uniform sampler2D boneTexture;
    uniform int boneTextureSize;
#endif
out vec2 vUv;
out vec3 vNormal;
out vec3 vMPos;
out vec4 vMVPos;
#ifdef SKINNING
    mat4 getBoneMatrix(const in float i) ${`{`}
        float j = i * 4.0;
        float x = mod(j, float(boneTextureSize));
        float y = floor(j / float(boneTextureSize));
        float dx = 1.0 / float(boneTextureSize);
        float dy = 1.0 / float(boneTextureSize);
        y = dy * (y + 0.5);
        vec4 v1 = texture(boneTexture, vec2(dx * (x + 0.5), y));
        vec4 v2 = texture(boneTexture, vec2(dx * (x + 1.5), y));
        vec4 v3 = texture(boneTexture, vec2(dx * (x + 2.5), y));
        vec4 v4 = texture(boneTexture, vec2(dx * (x + 3.5), y));
        return mat4(v1, v2, v3, v4);
    }
    void skin(inout vec4 pos, inout vec3 nml) ${`{`}
        mat4 boneMatX = getBoneMatrix(skinIndex.x);
        mat4 boneMatY = getBoneMatrix(skinIndex.y);
        mat4 boneMatZ = getBoneMatrix(skinIndex.z);
        mat4 boneMatW = getBoneMatrix(skinIndex.w);
        // update normal
        mat4 skinMatrix = mat4(0.0);
        skinMatrix += skinWeight.x * boneMatX;
        skinMatrix += skinWeight.y * boneMatY;
        skinMatrix += skinWeight.z * boneMatZ;
        skinMatrix += skinWeight.w * boneMatW;
        nml = vec4(skinMatrix * vec4(nml, 0.0)).xyz;
        // Update position
        vec4 transformed = vec4(0.0);
        transformed += boneMatX * pos * skinWeight.x;
        transformed += boneMatY * pos * skinWeight.y;
        transformed += boneMatZ * pos * skinWeight.z;
        transformed += boneMatW * pos * skinWeight.w;
        pos = transformed;
    }
#endif
void main() ${`{`}
    vec4 pos = vec4(position, 1);
    vec3 nml = normal;
    #ifdef SKINNING
        skin(pos, nml);
    #endif
    #ifdef INSTANCED
        pos = instanceMatrix * pos;
        mat3 m = mat3(instanceMatrix);
        nml /= vec3(dot(m[0], m[0]), dot(m[1], m[1]), dot(m[2], m[2]));
        nml = m * nml;
    #endif
    vUv = uv;
    vNormal = normalize(nml);
    vec4 mPos = modelMatrix * pos;
    vMPos = mPos.xyz / mPos.w;
    vMVPos = modelViewMatrix * pos;
    gl_Position = projectionMatrix * vMVPos;
}
`,
  fragment: `
precision highp float;
precision highp int;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform vec4 uBaseColorFactor;
uniform sampler2D tBaseColor;
uniform sampler2D tRM;
uniform float uRoughness;
uniform float uMetallic;
uniform sampler2D tNormal;
uniform float uNormalScale;
uniform sampler2D tEmissive;
uniform vec3 uEmissive;
uniform sampler2D tOcclusion;
uniform sampler2D tLUT;
uniform sampler2D tEnvDiffuse;
uniform sampler2D tEnvSpecular;
uniform float uEnvDiffuse;
uniform float uEnvSpecular;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uAlpha;
uniform float uAlphaCutoff;
in vec2 vUv;
in vec3 vNormal;
in vec3 vMPos;
in vec4 vMVPos;
out vec4 FragColor;
const float PI = 3.14159265359;
const float RECIPROCAL_PI = 0.31830988618;
const float RECIPROCAL_PI2 = 0.15915494;
const float LN2 = 0.6931472;
const float ENV_LODS = 6.0;
vec4 SRGBtoLinear(vec4 srgb) ${`{`}
  vec3 linOut = pow(srgb.xyz, vec3(2.2));
  return vec4(linOut, srgb.w);;
}
vec4 RGBMToLinear(in vec4 value) ${`{`}
  float maxRange = 6.0;
  return vec4(value.xyz * value.w * maxRange, 1.0);
}
vec3 linearToSRGB(vec3 color) ${`{`}
  return pow(color, vec3(1.0 / 2.2));
}
vec3 getNormal() ${`{`}
  #ifdef NORMAL_MAP  
    vec3 pos_dx = dFdx(vMPos.xyz);
    vec3 pos_dy = dFdy(vMPos.xyz);
    vec2 tex_dx = dFdx(vUv);
    vec2 tex_dy = dFdy(vUv);
    // Tangent, Bitangent
    vec3 t = normalize(pos_dx * tex_dy.t - pos_dy * tex_dx.t);
    vec3 b = normalize(-pos_dx * tex_dy.s + pos_dy * tex_dx.s);
    mat3 tbn = mat3(t, b, normalize(vNormal));
    vec3 n = texture(tNormal, vUv).rgb * 2.0 - 1.0;
    n.xy *= uNormalScale;
    vec3 normal = normalize(tbn * n);
    // Get world normal from view normal (normalMatrix * normal)
    // return normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    return normalize(normal);
  #else
    return normalize(vNormal);
  #endif
}
vec3 specularReflection(vec3 specularEnvR0, vec3 specularEnvR90, float VdH) ${`{`}
  return specularEnvR0 + (specularEnvR90 - specularEnvR0) * pow(clamp(1.0 - VdH, 0.0, 1.0), 5.0);
}
float geometricOcclusion(float NdL, float NdV, float roughness) ${`{`}
  float r = roughness;
  float attenuationL = 2.0 * NdL / (NdL + sqrt(r * r + (1.0 - r * r) * (NdL * NdL)));
  float attenuationV = 2.0 * NdV / (NdV + sqrt(r * r + (1.0 - r * r) * (NdV * NdV)));
  return attenuationL * attenuationV;
}
float microfacetDistribution(float roughness, float NdH) ${`{`}
  float roughnessSq = roughness * roughness;
  float f = (NdH * roughnessSq - NdH) * NdH + 1.0;
  return roughnessSq / (PI * f * f);
}
vec2 cartesianToPolar(vec3 n) ${`{`}
  vec2 uv;
  uv.x = atan(n.z, n.x) * RECIPROCAL_PI2 + 0.5;
  uv.y = asin(n.y) * RECIPROCAL_PI + 0.5;
  return uv;
}
void getIBLContribution(inout vec3 diffuse, inout vec3 specular, float NdV, float roughness, vec3 n, vec3 reflection, vec3 diffuseColor, vec3 specularColor) ${`{`}
  vec3 brdf = SRGBtoLinear(texture(tLUT, vec2(NdV, roughness))).rgb;
  vec3 diffuseLight = RGBMToLinear(texture(tEnvDiffuse, cartesianToPolar(n))).rgb;
  diffuseLight = mix(vec3(1), diffuseLight, uEnvDiffuse);
  // Sample 2 levels and mix between to get smoother degradation
  float blend = roughness * ENV_LODS;
  float level0 = floor(blend);
  float level1 = min(ENV_LODS, level0 + 1.0);
  blend -= level0;
  
  // Sample the specular env map atlas depending on the roughness value
  vec2 uvSpec = cartesianToPolar(reflection);
  uvSpec.y /= 2.0;
  vec2 uv0 = uvSpec;
  vec2 uv1 = uvSpec;
  uv0 /= pow(2.0, level0);
  uv0.y += 1.0 - exp(-LN2 * level0);
  uv1 /= pow(2.0, level1);
  uv1.y += 1.0 - exp(-LN2 * level1);
  vec3 specular0 = RGBMToLinear(texture(tEnvSpecular, uv0)).rgb;
  vec3 specular1 = RGBMToLinear(texture(tEnvSpecular, uv1)).rgb;
  vec3 specularLight = mix(specular0, specular1, blend);
  diffuse = diffuseLight * diffuseColor;
  
  // Bit of extra reflection for smooth materials
  float reflectivity = pow((1.0 - roughness), 2.0) * 0.05;
  specular = specularLight * (specularColor * brdf.x + brdf.y + reflectivity);
  specular *= uEnvSpecular;
}
void main() ${`{`}
  vec4 baseColor = uBaseColorFactor;
  #ifdef COLOR_MAP
    baseColor *= SRGBtoLinear(texture(tBaseColor, vUv));
  #endif
  // Get base alpha
  float alpha = baseColor.a;
  #ifdef ALPHA_MASK
    if (alpha < uAlphaCutoff) discard;
  #endif
  // RM map packed as gb = [nothing, roughness, metallic, nothing]
  vec4 rmSample = vec4(1);
  #ifdef RM_MAP
    rmSample *= texture(tRM, vUv);
  #endif
  float roughness = clamp(rmSample.g * uRoughness, 0.04, 1.0);
  float metallic = clamp(rmSample.b * uMetallic, 0.04, 1.0);
  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);
  vec3 specularEnvR0 = specularColor;
  vec3 specularEnvR90 = vec3(clamp(max(max(specularColor.r, specularColor.g), specularColor.b) * 25.0, 0.0, 1.0));
  vec3 N = getNormal();
  vec3 V = normalize(cameraPosition - vMPos);
  vec3 L = normalize(uLightDirection);
  vec3 H = normalize(L + V);
  vec3 reflection = normalize(reflect(-V, N));
  float NdL = clamp(dot(N, L), 0.001, 1.0);
  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);
  float NdH = clamp(dot(N, H), 0.0, 1.0);
  float LdH = clamp(dot(L, H), 0.0, 1.0);
  float VdH = clamp(dot(V, H), 0.0, 1.0);
  vec3 F = specularReflection(specularEnvR0, specularEnvR90, VdH);
  float G = geometricOcclusion(NdL, NdV, roughness);
  float D = microfacetDistribution(roughness, NdH);
  vec3 diffuseContrib = (1.0 - F) * (diffuseColor / PI);
  vec3 specContrib = F * G * D / (4.0 * NdL * NdV);
  
  // Shading based off lights
  vec3 color = NdL * uLightColor * (diffuseContrib + specContrib);
  // Add lights spec to alpha for reflections on transparent surfaces (glass)
  alpha = max(alpha, max(max(specContrib.r, specContrib.g), specContrib.b));
  // Calculate IBL lighting
  vec3 diffuseIBL;
  vec3 specularIBL;
  getIBLContribution(diffuseIBL, specularIBL, NdV, roughness, N, reflection, diffuseColor, specularColor);
  // Add IBL on top of color
  color += diffuseIBL + specularIBL;
  // Add IBL spec to alpha for reflections on transparent surfaces (glass)
  alpha = max(alpha, max(max(specularIBL.r, specularIBL.g), specularIBL.b));
  #ifdef OCC_MAP  
    // TODO: figure out how to apply occlusion
    // color *= SRGBtoLinear(texture(tOcclusion, vUv)).rgb;
  #endif
  #ifdef EMISSIVE_MAP  
    vec3 emissive = SRGBtoLinear(texture(tEmissive, vUv)).rgb * uEmissive;
    color += emissive;
  #endif
  // Convert to sRGB to display
  FragColor.rgb = linearToSRGB(color);
  
  // Apply uAlpha uniform at the end to overwrite any specular additions on transparent surfaces
  FragColor.a = alpha * uAlpha;
}
                `
};
{
  let resize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
  }, handlers = function() {
    gl.canvas.addEventListener("dragover", over);
    gl.canvas.addEventListener("drop", drop);
  }, over = function(e) {
    e.preventDefault();
  }, drop = function(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    const isGLB = file.name.match(/\.glb$/);
    if (isGLB) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
    reader.onload = async function(e2) {
      let desc;
      if (isGLB) {
        desc = GLTFLoader.unpackGLB(e2.target.result);
      } else {
        desc = JSON.parse(e2.target.result);
      }
      const dir = "";
      gltf = await GLTFLoader.parse(gl, desc, dir);
      addGLTF(gltf);
    };
  }, addGLTF = function(gltf2) {
    scene.children.forEach((child) => child.setParent(null));
    console.log(gltf2);
    gltf2.scene.forEach((root) => {
      root.setParent(scene);
      root.traverse((node) => {
        if (node.program) {
          node.program = createProgram(node);
        }
      });
    });
    scene.updateMatrixWorld();
    const min = new Vec3(Infinity);
    const max = new Vec3(-Infinity);
    const center = new Vec3();
    const scale = new Vec3();
    const boundsMin = new Vec3();
    const boundsMax = new Vec3();
    const boundsCenter = new Vec3();
    const boundsScale = new Vec3();
    gltf2.meshes.forEach((group) => {
      group.primitives.forEach((mesh) => {
        if (!mesh.parent)
          return;
        if (!mesh.geometry.bounds)
          mesh.geometry.computeBoundingSphere();
        boundsCenter.copy(mesh.geometry.bounds.center).applyMatrix4(mesh.worldMatrix);
        mesh.worldMatrix.getScaling(boundsScale);
        const radiusScale = Math.max(Math.max(boundsScale[0], boundsScale[1]), boundsScale[2]);
        const radius = mesh.geometry.bounds.radius * radiusScale;
        boundsMin.set(-radius).add(boundsCenter);
        boundsMax.set(+radius).add(boundsCenter);
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], boundsMin[i]);
          max[i] = Math.max(max[i], boundsMax[i]);
        }
      });
    });
    scale.sub(max, min);
    const maxRadius = Math.max(Math.max(scale[0], scale[1]), scale[2]) * 0.5;
    center.add(min, max).divide(2);
    camera.position.set(1, 0.5, -1).normalize().multiply(maxRadius * 2.5).add(center);
    controls.target.copy(center);
    controls.forcePosition();
    const far = maxRadius * 5;
    const near = far * 1e-3;
    camera.perspective({near, far});
  }, createProgram = function(node) {
    const gltf2 = node.program.gltfMaterial || {};
    let {vertex, fragment} = shader;
    let defines = `#version 300 es
                        ${node.geometry.attributes.uv ? `#define UV` : ``}
                        ${node.geometry.attributes.normal ? `#define NORMAL` : ``}
                        ${node.geometry.isInstanced ? `#define INSTANCED` : ``}
                        ${node.boneTexture ? `#define SKINNING` : ``}
                        ${gltf2.alphaMode === "MASK" ? `#define ALPHA_MASK` : ``}
                        ${gltf2.baseColorTexture ? `#define COLOR_MAP` : ``}
                        ${gltf2.normalTexture ? `#define NORMAL_MAP` : ``}
                        ${gltf2.metallicRoughnessTexture ? `#define RM_MAP` : ``}
                        ${gltf2.occlusionTexture ? `#define OCC_MAP` : ``}
                        ${gltf2.emissiveTexture ? `#define EMISSIVE_MAP` : ``}
                    `;
    vertex = defines + vertex;
    fragment = defines + fragment;
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uBaseColorFactor: {value: gltf2.baseColorFactor || [1, 1, 1, 1]},
        tBaseColor: {value: gltf2.baseColorTexture ? gltf2.baseColorTexture.texture : null},
        tRM: {value: gltf2.metallicRoughnessTexture ? gltf2.metallicRoughnessTexture.texture : null},
        uRoughness: {value: gltf2.roughnessFactor !== void 0 ? gltf2.roughnessFactor : 1},
        uMetallic: {value: gltf2.metallicFactor !== void 0 ? gltf2.metallicFactor : 1},
        tNormal: {value: gltf2.normalTexture ? gltf2.normalTexture.texture : null},
        uNormalScale: {value: gltf2.normalTexture ? gltf2.normalTexture.scale || 1 : 1},
        tOcclusion: {value: gltf2.occlusionTexture ? gltf2.occlusionTexture.texture : null},
        tEmissive: {value: gltf2.emissiveTexture ? gltf2.emissiveTexture.texture : null},
        uEmissive: {value: gltf2.emissiveFactor || [0, 0, 0]},
        tLUT: {value: lutTexture},
        tEnvDiffuse: {value: envDiffuseTexture},
        tEnvSpecular: {value: envSpecularTexture},
        uEnvDiffuse: {value: 0.5},
        uEnvSpecular: {value: 0.5},
        uLightDirection: {value: new Vec3(0, 1, 1)},
        uLightColor: {value: new Vec3(2.5)},
        uAlpha: {value: 1},
        uAlphaCutoff: {value: gltf2.alphaCutoff}
      },
      transparent: gltf2.alphaMode === "BLEND",
      cullFace: gltf2.doubleSided ? null : gl.BACK
    });
    return program;
  }, update = function() {
    requestAnimationFrame(update);
    controls.update();
    if (gltf && gltf.animations && gltf.animations.length) {
      let {animation} = gltf.animations[0];
      animation.elapsed += 0.01;
      animation.update();
    }
    renderer.render({scene, camera, sort: false, frustumCull: false});
  };
  const renderer = new Renderer({dpr: 2});
  const gl = renderer.gl;
  document.body.appendChild(gl.canvas);
  gl.clearColor(0.1, 0.1, 0.1, 1);
  const camera = new Camera(gl, {near: 1, far: 1e3});
  camera.position.set(30, 15, -30);
  const controls = new Orbit(camera);
  window.addEventListener("resize", resize, false);
  resize();
  const scene = new Transform();
  let gltf;
  const lutTexture = TextureLoader.load(gl, {
    src: "../../assets/pbr/lut.png"
  });
  const envDiffuseTexture = TextureLoader.load(gl, {
    src: "../../assets/sunset-diffuse-RGBM.png"
  });
  const envSpecularTexture = TextureLoader.load(gl, {
    src: "../../assets/sunset-specular-RGBM.png"
  });
  {
    loadInitial();
    handlers();
  }
  async function loadInitial() {
    gltf = await GLTFLoader.load(gl, `../../assets/gltf/hershel.glb`);
    addGLTF(gltf);
  }
  requestAnimationFrame(update);
}
