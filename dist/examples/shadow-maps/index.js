import {a as Camera, P as Program, R as Renderer, O as Orbit, T as Transform, b as Texture, G as Geometry, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {P as Plane} from "../../chunks/Plane.7e1c7186.js";
import {R as RenderTarget} from "../../chunks/RenderTarget.e49cf8bd.js";
class Shadow {
  constructor(gl2, {light: light2 = new Camera(gl2), width = 1024, height = width}) {
    this.gl = gl2;
    this.light = light2;
    this.target = new RenderTarget(gl2, {width, height});
    this.depthProgram = new Program(gl2, {
      vertex: defaultVertex,
      fragment: defaultFragment,
      cullFace: null
    });
    this.castMeshes = [];
  }
  add({
    mesh,
    receive = true,
    cast = true,
    vertex = defaultVertex,
    fragment = defaultFragment,
    uniformProjection = "shadowProjectionMatrix",
    uniformView = "shadowViewMatrix",
    uniformTexture = "tShadow"
  }) {
    if (receive && !mesh.program.uniforms[uniformProjection]) {
      mesh.program.uniforms[uniformProjection] = {value: this.light.projectionMatrix};
      mesh.program.uniforms[uniformView] = {value: this.light.viewMatrix};
      mesh.program.uniforms[uniformTexture] = {value: this.target.texture};
    }
    if (!cast)
      return;
    this.castMeshes.push(mesh);
    mesh.colorProgram = mesh.program;
    if (mesh.depthProgram)
      return;
    if (vertex === defaultVertex && fragment === defaultFragment) {
      mesh.depthProgram = this.depthProgram;
      return;
    }
    mesh.depthProgram = new Program(this.gl, {
      vertex,
      fragment,
      cullFace: null
    });
  }
  render({scene: scene2}) {
    scene2.traverse((node) => {
      if (!node.draw)
        return;
      if (!!~this.castMeshes.indexOf(node)) {
        node.program = node.depthProgram;
      } else {
        node.isForceVisibility = node.visible;
        node.visible = false;
      }
    });
    this.gl.renderer.render({
      scene: scene2,
      camera: this.light,
      target: this.target
    });
    scene2.traverse((node) => {
      if (!node.draw)
        return;
      if (!!~this.castMeshes.indexOf(node)) {
        node.program = node.colorProgram;
      } else {
        node.visible = node.isForceVisibility;
      }
    });
  }
}
const defaultVertex = `
    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const defaultFragment = `
    precision highp float;

    vec4 packRGBA (float v) {
        vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
        pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
        return pack;
    }

    void main() {
        gl_FragColor = packRGBA(gl_FragCoord.z);
    }
`;
const vertexColor = `
            attribute vec3 position;
            attribute vec2 uv;

            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            uniform mat4 shadowViewMatrix;
            uniform mat4 shadowProjectionMatrix;

            varying vec2 vUv;
            varying vec4 vLightNDC;

            // Matrix to shift range from -1->1 to 0->1
            const mat4 depthScaleMatrix = mat4(
                0.5, 0, 0, 0, 
                0, 0.5, 0, 0, 
                0, 0, 0.5, 0, 
                0.5, 0.5, 0.5, 1
            );

            void main() {
                vUv = uv;
                
                // Calculate the NDC (normalized device coords) for the light to compare against shadowmap
                vLightNDC = depthScaleMatrix * shadowProjectionMatrix * shadowViewMatrix * modelMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fragmentColor = `
            precision highp float;

            uniform sampler2D tMap;
            uniform sampler2D tShadow;

            varying vec2 vUv;
            varying vec4 vLightNDC;

            float unpackRGBA (vec4 v) {
                return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
            }

            void main() {
                vec3 tex = texture2D(tMap, vUv).rgb;

                vec3 lightPos = vLightNDC.xyz / vLightNDC.w;

                float bias = 0.001;
                float depth = lightPos.z - bias;
                float occluder = unpackRGBA(texture2D(tShadow, lightPos.xy));

                // Compare actual depth from light to the occluded depth rendered in the depth map
                // If the occluded depth is smaller, we must be in shadow
                float shadow = mix(0.2, 1.0, step(depth, occluder));

                gl_FragColor.rgb = tex * shadow;
                gl_FragColor.a = 1.0;
            }
        `;
const renderer = new Renderer({dpr: 2});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);
const camera = new Camera(gl, {fov: 35});
camera.position.set(5, 4, 10);
const controls = new Orbit(camera);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
}
window.addEventListener("resize", resize, false);
resize();
const scene = new Transform();
const light = new Camera(gl, {
  left: -3,
  right: 3,
  bottom: -3,
  top: 3,
  near: 1,
  far: 20
});
light.position.set(3, 10, 3);
light.lookAt([0, 0, 0]);
const shadow = new Shadow(gl, {light});
addAirplane();
addGround();
let airplane;
async function addAirplane() {
  const texture = new Texture(gl);
  const img = new Image();
  img.onload = () => texture.image = img;
  img.src = "../assets/airplane.jpg";
  const program = new Program(gl, {
    vertex: vertexColor,
    fragment: fragmentColor,
    uniforms: {
      tMap: {value: texture}
    },
    cullFace: null
  });
  const data = await (await fetch(`../assets/airplane.json`)).json();
  const geometry = new Geometry(gl, {
    position: {size: 3, data: new Float32Array(data.position)},
    uv: {size: 2, data: new Float32Array(data.uv)},
    normal: {size: 3, data: new Float32Array(data.normal)}
  });
  const mesh = new Mesh(gl, {geometry, program});
  mesh.setParent(scene);
  shadow.add({mesh});
  airplane = mesh;
}
function addGround() {
  const texture = new Texture(gl);
  const img = new Image();
  img.onload = () => texture.image = img;
  img.src = "../assets/water.jpg";
  const program = new Program(gl, {
    vertex: vertexColor,
    fragment: fragmentColor,
    uniforms: {
      tMap: {value: texture}
    },
    cullFace: null
  });
  const geometry = new Plane(gl);
  const mesh = new Mesh(gl, {geometry, program});
  mesh.setParent(scene);
  shadow.add({mesh});
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.set(6);
  mesh.position.y = -3;
}
requestAnimationFrame(update);
function update(t) {
  requestAnimationFrame(update);
  controls.update();
  if (airplane) {
    airplane.position.z = Math.sin(t * 1e-3);
    airplane.rotation.x = Math.sin(t * 1e-3 + 2) * 0.1;
    airplane.rotation.y = Math.sin(t * 1e-3 - 4) * -0.1;
  }
  shadow.render({scene});
  renderer.render({scene, camera});
}
document.getElementsByClassName("Info")[0].innerHTML = "Shadow maps. Model by Google Poly";
document.title = "OGL \u2022 Shadow maps";
