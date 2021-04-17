import { defineConfig } from 'vite';
const { resolve } = require('path');
const fs = require('fs');

export default ({ command, mode }) => {
    if (command === 'build') {
        return {
            // https://github.com/vitejs/vite/issues/3025
            base: 'http://github.nshen.net/ogl-typescript/dist/',
            build: {
                minify: false,
                emptyOutDir: true,
                assetsDir: 'chunks',
                rollupOptions: {
                    input: getInput([
                        // Geometry
                        'triangle-screen-shader',
                        'draw-modes',
                        'indexed-vs-non-indexed',
                        'load-json',
                        'wireframe',
                        'base-primitives',
                        'particles',
                        'instancing',
                        'instancing-gpu-picking',
                        'polylines',
                        'curves',
                        'torus',
                        'load-gltf',
                        'compute-vertex-normal',

                        // Scenes
                        'scene-graph',
                        'sort-transparency',
                        'frustum-culling',

                        // Interaction
                        'orbit-controls',
                        'raycasting',
                        'mouse-flowmap',

                        //Shading
                        'fog',
                        'textures',
                        'anisotropic',
                        'skydome',
                        'cube-map',
                        'normal-maps',
                        'flat-shading-matcap',
                        'wireframe-shader',
                        'msdf-text',
                        'point-lighting',
                        'pbr',
                        'compressed-textures',

                        // Frame Buffer
                        'render-to-texture',
                        'post-fxaa',
                        'mrt',
                        'shadow-maps',
                        'post-fluid-distortion',
                        'gpgpu-particles',

                        // Animation
                        'skinning',

                        // Performance
                        'high-mesh-count',
                    ]),

                    output: {
                        // https://github.com/vitejs/vite/issues/378#issuecomment-716717258
                        // entryFileNames: `examples/[name]/index.js`, // works
                        // chunkFileNames: `chunks/[name].js`,
                        // assetFileNames: `assets/[name].[ext]`
                    },
                },
            },
            plugins: [copyIndexPlugin()],
        };
    } else {
        return {
            // dev specific config
        };
    }
};

function copyIndexPlugin() {
    return {
        name: 'copyIndexPlugin',
        async closeBundle() {
            fs.copyFileSync('./index.html', './dist/index.html');
        },
    };
}

function getInput(arr) {
    let input = {};
    arr.forEach((example) => {
        input[example] = resolve(__dirname, `examples/${example}/index.html`);
    });
    return input;
}
