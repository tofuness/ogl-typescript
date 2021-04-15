import { defineConfig } from 'vite';
const path = require('path');
const fs = require('fs');

function copyIndexPlugin() {
    return {
        name: 'copyIndexPlugin',
        async closeBundle() {
            fs.copyFileSync('./index.html', './dist/index.html');
        },
    };
}

export default ({ command, mode }) => {
    if (command === 'build') {
        function getInput(arr) {
            let input = {};
            arr.forEach((example) => {
                input[example] = path.resolve(__dirname, `examples/${example}/index.html`);
            });
            return input;
        }
        return {
            build: {
                minify: true,
                emptyOutDir: true,
                outDir: path.join(__dirname, 'dist'),
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
                },
                // input: glob.sync(path.resolve(__dirname, 'examples', '*', 'index.html')),
                // https://github.com/vitejs/vite/issues/378#issuecomment-716717258
                output: {
                    entryFileNames: `examples/[name]/index.js`, // works
                    manualChunks: undefined, // not work, why?
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
