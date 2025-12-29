const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("scene"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// نور
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

// کنترل چرخش
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// بارگذاری مدل بدن
const loader = new THREE.GLTFLoader();
loader.load("model/human.glb", gltf => {
  scene.add(gltf.scene);
});

// رندر
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

