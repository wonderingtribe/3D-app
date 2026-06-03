export const SANDBOX_DEFAULTS: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Spatial Playground</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      margin: 0;
      overflow: hidden;
    }
  </style>
  <!-- Import ThreeJS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="overlay">
    <h1>3D Spatial Node</h1>
    <span>Status: ACTIVE // Fluid FPS // Drag mouse to rotate</span>
  </div>
  <div id="canvas-container"></div>
  <script src="app.js"></script>
</body>
</html>`,

  'styles.css': `body {
  margin: 0;
  background-color: #06070a;
  overflow: hidden;
  color: #fff;
  font-family: 'Inter', -apple-system, sans-serif;
}

#canvas-container {
  width: 100vw;
  height: 100vh;
}

#overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(10, 11, 16, 0.75);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

h1 {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #00d4ff;
  font-weight: 950;
}

span {
  opacity: 0.6;
  font-size: 9px;
  font-family: monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}`,

  'app.js': `// Spatial 3D Interactive Crystalline Sandbox
// You can edit this live! Saving the file will render changes instantly.

const container = document.getElementById('canvas-container');

// Create Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070a, 0.035);

// Create Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 12;

// Create WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0x0a1128, 1.5);
scene.add(ambientLight);

// Add Dynamic Point Lights
const colors = [0x00d4ff, 0x8b5cf6, 0x10b981];
const lights = [];

colors.forEach((color, idx) => {
    const light = new THREE.PointLight(color, 4, 30);
    scene.add(light);
    lights.push({
        light: light,
        angle: (idx / colors.length) * Math.PI * 2,
        speed: 0.8 + idx * 0.4
    });
});

// Create Core Crystalline Mesh (Try TorusKnotGeometry or IcosahedronGeometry)
const geometry = new THREE.IcosahedronGeometry(3.5, 1);
const material = new THREE.MeshPhysicalMaterial({
    color: 0x00d4ff,
    roughness: 0.15,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    flatShading: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Create Wireframe overlay
const wireGeometry = new THREE.IcosahedronGeometry(3.55, 1);
const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.35
});
const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
scene.add(wireframe);

// Create Orbiting Particles Starfield
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 350;
const positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 4 + Math.random() * 8;

    positions[i] = r * Math.sin(phi) * Math.cos(theta);
    positions[i+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i+2] = r * Math.cos(phi);
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMaterial = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
});
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Track Mouse Movement for camera drag rotation
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

// Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotate core mesh
    mesh.rotation.x = time * 0.15;
    mesh.rotation.y = time * 0.2;
    wireframe.rotation.x = time * 0.15;
    wireframe.rotation.y = time * 0.2;

    // Pulse core scale slightly
    const scale = 1 + Math.sin(time * 2) * 0.05;
    mesh.scale.set(scale, scale, scale);
    wireframe.scale.set(scale, scale, scale);

    // Dynamic light paths
    lights.forEach((item, idx) => {
        const radius = 6 + Math.sin(time * 1.5 + idx) * 2;
        item.light.position.x = Math.cos(time * 0.5 * item.speed + item.angle) * radius;
        item.light.position.y = Math.sin(time * 0.5 * item.speed + item.angle) * radius;
        item.light.position.z = Math.cos(time * 0.3 * item.speed) * radius;
    });

    // Orbit Starfield slowly
    starField.rotation.y = time * 0.03;
    starField.rotation.x = time * 0.015;

    // Smooth camera drift based on mouse
    targetRotationX += (mouseX - targetRotationX) * 0.05;
    targetRotationY += (mouseY - targetRotationY) * 0.05;
    camera.position.x = Math.sin(targetRotationX) * 12;
    camera.position.z = Math.cos(targetRotationX) * 12;
    camera.position.y = targetRotationY * 6;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// Handle Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});`,

  'readme.md': `# 3D SPATIAL SANDBOX

Welcome to the **Spatial Live Sandbox**! This is a complete, real-time live-coding compiler workspace.

You can write actual HTML, CSS, or JavaScript (using web libraries like **Three.js**) in the files on the left. Any changes you save will render **instantly** in the live viewer on the right!

### Live Coding Features
- **Real-Time Hot Reload**: Saving files instantly triggers hot module swapping in the rendering viewport.
- **Embedded Web Console**: View console output streams, info logs, and syntax exceptions immediately.
- **Persistent Memory**: Your sandbox changes are safely saved in local memory across window sessions automatically.

### Code Experiments to Try
1. **Change Colors**: Modify the colors values inside \`app.js\` colors array.
2. **Increase Speed**: Change the speed parameters of the point lights or core mesh.
3. **Change Geometry**: Swap \`THREE.IcosahedronGeometry(3.5, 1)\` with \`THREE.TorusKnotGeometry(2, 0.6, 100, 16)\`.`
};
