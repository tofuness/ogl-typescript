import {R as Renderer, a as Camera, O as Orbit, V as Vec3, T as Transform, b as Texture, P as Program, M as Mesh} from "../../chunks/GLTFSkin.e3c4699d.js";
import {S as Sphere} from "../../chunks/Sphere.f04a3d27.js";
const VERTEX_SHADER = `
    attribute vec2 uv;
    attribute vec3 position;
    attribute vec3 normal;

    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;

    uniform vec3 u_lightWorldPosition;
    uniform vec3 cameraPosition;
    

    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec2 v_uv;

    void main() {
        // Pass UV information to Fragment Shader
        v_uv = uv;

        // Calculate World Space Normal
        v_normal = normalMatrix * normal;

        // Compute the world position of the surface
        vec3 surfaceWorldPosition = mat3(modelMatrix) * position;

        // Vector from the surface, to the light
        v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

        // Vector from the surface, to the camera
        v_surfaceToView = cameraPosition - surfaceWorldPosition;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const FRAGMENT_SHADER = `
    precision highp float;

    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec2 v_uv;


    uniform float u_dt;
    uniform float u_shininess;
    uniform sampler2D colMap;
    uniform sampler2D specMap;
    uniform sampler2D cloudMap;


    void main() {
        // Re-normalize interpolated varyings
        vec3 normal = normalize(v_normal);
        vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
        vec3 surfaceToViewDirection = normalize(v_surfaceToView);

        // Calculate Half-Vector, Vector that bisects the angle of reflection.
        // This vector indecates the "brightest point"; A "refrence vector" if you will.
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

        // Then we can get the brightness at any point by seeing "how similar" 
        // the surface normal is to the refrence vector. 
        float light = dot(normal, surfaceToLightDirection);
        
        // By raising the specular vector to a power we can control the intensity
        // of the light
        float specular = 0.0;
        if (light > 0.0) {
            specular = pow(dot(normal, halfVector), u_shininess * 100.0);
        }

        // Mapping textures
        vec3 colMap = texture2D(colMap, v_uv).rgb;
        vec3 spec = texture2D(specMap, v_uv).rgb;

        vec2 cloudUV = vec2(v_uv.x + u_dt, v_uv.y);
        vec3 cloud = texture2D(cloudMap, cloudUV).rgb;

        gl_FragColor.rgb = colMap + cloud;

        // Add Point Lighting
        gl_FragColor.rgb *= light;
        // Add Specular Highlights
        gl_FragColor.rgb += specular * spec;
    }
`;
{
  let resize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.perspective({
      aspect: gl.canvas.width / gl.canvas.height
    });
  }, update = function(dt) {
    requestAnimationFrame(update);
    mesh.rotation.y += 5e-3;
    program.uniforms.u_dt.value = -dt * 2e-5;
    controls.update();
    renderer.render({scene, camera});
  };
  const renderer = new Renderer();
  const gl = renderer.gl;
  document.body.appendChild(gl.canvas);
  gl.clearColor(0.05, 0.05, 0.05, 1);
  const camera = new Camera(gl);
  camera.position.set(0, 0, 2);
  const controls = new Orbit(camera, {
    target: new Vec3(0, 0, 0)
  });
  window.addEventListener("resize", resize, false);
  resize();
  const scene = new Transform();
  const geometry = new Sphere(gl, {widthSegments: 64});
  const light = new Vec3(20, 30, 60);
  const colMap = new Texture(gl);
  const img = new Image();
  img.onload = () => colMap.image = img;
  img.src = "../assets/earth.jpg";
  const specMap = new Texture(gl);
  const specMap_img = new Image();
  specMap_img.onload = () => specMap.image = specMap_img;
  specMap_img.src = "../assets/earth_specular.jpg";
  const cloudMap = new Texture(gl, {wrapS: gl.REPEAT, wrapT: gl.REPEAT});
  const cloudMap_img = new Image();
  cloudMap_img.onload = () => cloudMap.image = cloudMap_img;
  cloudMap_img.src = "../assets/earth_cloud.jpg";
  const program = new Program(gl, {
    vertex: VERTEX_SHADER,
    fragment: FRAGMENT_SHADER,
    uniforms: {
      u_dt: {value: 0},
      u_lightWorldPosition: {value: light},
      u_shininess: {value: 1.5},
      colMap: {value: colMap},
      specMap: {value: specMap},
      cloudMap: {value: cloudMap}
    }
  });
  const mesh = new Mesh(gl, {geometry, program});
  mesh.setParent(scene);
  document.addEventListener("mousemove", (e) => {
    const cords = {
      x: e.x - window.innerWidth / 2,
      y: e.y - window.innerHeight / 2
    };
    program.uniforms.u_lightWorldPosition.value = [cords.x, -cords.y, 40];
  });
  requestAnimationFrame(update);
}
