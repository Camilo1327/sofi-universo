import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const phrases = [
    "Eres la mujer de mi vida 💘",
    "Sofi, eres mi sol ☀️",
    "Cada latido es para ti ❤️",
    "Contigo hasta el infinito ♾️",
    "Mi galaxia favorita eres tú 🌌",
    "Eres la luz de mi vida ✨",
    "Naciste para mí 💍",
    "Tú y yo, siempre 💞",
    "Mi amor eterno eres tú 💘",
    "Eres mi lugar favorito 🏡",
    "Mi paz y mi locura 🌙",
    "Gracias por existir 🌷",
    "Tú lo tienes todo 🎶",
    "Mi hogar eres tú 💫"
];

// La mayoría como estrellas doradas: al hacer clic abren un recuerdo 💘
const memories = [
    {
        image: "WhatsApp Image 2026-06-18 at 3.28.12 PM.jpeg",
        text: "Nuestro primer viaje juntos… fue de los mejores fines de semana de mi vida. 💘"
    },
    {
        image: "WhatsApp Image 2026-06-18 at 3.28.12 PM (1).jpeg",
        text: "Tu sonrisa es el amanecer que le da sentido a todos mis días."
    },
    {
        image: "WhatsApp Image 2026-06-18 at 3.28.12 PM (2).jpeg",
        text: "De todas las estrellas del cielo, a ti te elegiría mil veces, en mil universos. ✨"
    },
    {
        image: "WhatsApp Image 2026-06-18 at 3.28.14 PM.jpeg",
        text: "Cómo olvidar la primera vez que nos vimos… tú estabas tan bonita y yo tan nervioso. 💘"
    },
    {
        image: "WhatsApp Image 2026-06-18 at 3.30.10 PM.jpeg",
        text: "Contigo aprendí que el amor no se explica, se siente. Y yo lo siento todo por ti."
    },
    {
        image: "WhatsApp Image 2026-06-18 at 4.09.37 PM (1).jpeg",
        text: "Si volviera a nacer, te buscaría en cada vida solo para volver a encontrarte. 🌙"
    },
    {
        image: "WhatsApp Image 2026-06-18 at 4.09.38 PM (1).jpeg",
        text: "Eres lo más bonito que me ha pasado. Mi presente y mi para siempre. 💫"
    },
    {
        image: "WhatsApp Image 2026-06-18 at 4.09.38 PM (2).jpeg",
        text: "Te amo más de lo que las palabras y las estrellas alcanzan a decir, Sofi. 💘"
    }
];

// Pocas fotos como marcos flotantes (para no saturar afuera)
const photos = [
    { file: "WhatsApp Image 2026-06-18 at 3.28.11 PM.jpeg", caption: "nuestro comienzo" },
    { file: "WhatsApp Image 2026-06-18 at 3.28.13 PM.jpeg", caption: "mi favorita" },
    { file: "WhatsApp Image 2026-06-18 at 4.09.37 PM.jpeg", caption: "tú y yo" },
    { file: "WhatsApp Image 2026-06-18 at 4.09.38 PM.jpeg", caption: "felicidad" },
    { file: "WhatsApp Image 2026-06-18 at 4.09.39 PM.jpeg", caption: "por siempre" }
];

// ============================================================
// 0. Detección de dispositivo (rendimiento + responsive)
// ============================================================
const isMobile = window.matchMedia('(max-width: 768px)').matches ||
                 ('ontouchstart' in window && window.innerWidth < 900);
const QUALITY = isMobile ? 0.5 : 1; // factor para densidad de partículas

// FOV se ensancha en pantallas verticales para que todo quepa
function fovForViewport() {
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect < 0.7) return 92;
    if (aspect < 1) return 82;
    return 70;
}

// ============================================================
// 1. Setup
// ============================================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fovForViewport(), window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#universe-canvas'),
    antialias: true,
    alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('experience-container').appendChild(labelRenderer.domElement);

camera.position.set(0, 90, isMobile ? 320 : 260);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;
controls.minDistance = 40;
controls.maxDistance = 600;
controls.enablePan = false;

// ---- Animación de entrada (vuelo de cámara + corazón floreciendo) ----
const camIntroStart = new THREE.Vector3(0, 300, 780);
const camIntroEnd = new THREE.Vector3(0, 90, isMobile ? 320 : 260);
const INTRO_DUR = 3.6;
let introT = null;   // null = sin animar
let heartGrow = 1;   // 0→1 durante la entrada

function startIntroAnimation() {
    controls.autoRotate = false;
    camera.position.copy(camIntroStart);
    heartGrow = 0;
    introT = 0;
}

// ============================================================
// 2. Post-processing (Bloom = el brillo cinematográfico)
// ============================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45,  // strength (más suave)
    0.7,   // radius (difuso, no intenso)
    0.32   // threshold (solo brilla lo realmente luminoso)
);
composer.addPass(bloomPass);

// ============================================================
// 3. Nebulosa de fondo
// ============================================================
const texLoader = new THREE.TextureLoader();
texLoader.load('cosmic_nebula_background.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.SphereGeometry(1500, 60, 40);
    const skyMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        opacity: 0.55,
        transparent: true,
        depthWrite: false
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));
});

// Campo de estrellas lejanas
function createStarfield() {
    const count = Math.round(6000 * QUALITY);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = 400 + Math.random() * 900;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);
        c.setHSL(0.6 + Math.random() * 0.12, 0.3, 0.7 + Math.random() * 0.3);
        colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
        size: 1.3, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.65, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);
    return stars;
}
const starfield = createStarfield();

// ============================================================
// 4. Galaxia espiral
// ============================================================
function createGalaxy() {
    const p = {
        count: Math.round(55000 * QUALITY), size: 0.2, radius: 130, branches: 5,
        spin: 1.1, randomness: 0.35, randomnessPower: 3,
        insideColor: '#f0cfdc', outsideColor: '#5a6ab0'
    };
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(p.count * 3);
    const colors = new Float32Array(p.count * 3);
    const colorInside = new THREE.Color(p.insideColor);
    const colorOutside = new THREE.Color(p.outsideColor);

    for (let i = 0; i < p.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * p.radius;
        const spinAngle = radius * p.spin;
        const branchAngle = ((i % p.branches) / p.branches) * Math.PI * 2;
        const rand = () => Math.pow(Math.random(), p.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * p.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + rand();
        positions[i3 + 1] = rand() * 0.5;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rand();

        const mixed = colorInside.clone().lerp(colorOutside, radius / p.radius);
        colors[i3] = mixed.r; colors[i3 + 1] = mixed.g; colors[i3 + 2] = mixed.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: p.size, sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true,
        transparent: true, opacity: 0.6
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    return points;
}
const galaxy = createGalaxy();

// ---- Anillos orbitando la galaxia (estilo Saturno) ----
function createGalaxyRings() {
    const defs = [
        { radius: 150, thickness: 6, count: 2400, color: '#ffc8e0', opacity: 0.55 },
        { radius: 172, thickness: 5, count: 2800, color: '#9fb0ff', opacity: 0.5 },
        { radius: 196, thickness: 7, count: 3200, color: '#cdbcff', opacity: 0.45 }
    ];
    const group = new THREE.Group();
    defs.forEach((def) => {
        const count = Math.round(def.count * QUALITY);
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = def.radius + (Math.random() - 0.5) * def.thickness;
            positions[i * 3] = Math.cos(a) * r;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 2] = Math.sin(a) * r;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.5, color: new THREE.Color(def.color), sizeAttenuation: true,
            transparent: true, opacity: def.opacity, depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        group.add(new THREE.Points(geo, mat));
    });
    group.rotation.x = 0.12; // leve inclinación para que se aprecien
    scene.add(group);
    return group;
}
const galaxyRings = createGalaxyRings();

// ============================================================
// 5. Corazón de partículas pulsante en el centro
// ============================================================
function heartPoint(t) {
    // Curva clásica del corazón
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x, y };
}

function createHeart() {
    const count = Math.round(9000 * QUALITY);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cInner = new THREE.Color('#fff0f6');
    const cOuter = new THREE.Color('#ff3d7f');
    const scale = 1.4;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random() * Math.PI * 2;
        // Relleno: acercamos al centro con una raíz para densidad agradable
        const fill = Math.pow(Math.random(), 0.5);
        const base = heartPoint(t);
        const x = base.x * fill * scale;
        const y = base.y * fill * scale;
        const z = (Math.random() - 0.5) * 8 * (1 - fill * 0.6);

        positions[i3] = x;
        positions[i3 + 1] = y + 4;
        positions[i3 + 2] = z;

        const mixed = cOuter.clone().lerp(cInner, fill);
        colors[i3] = mixed.r; colors[i3 + 1] = mixed.g; colors[i3 + 2] = mixed.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
        size: 0.65, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.8, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const heart = new THREE.Points(geo, mat);
    scene.add(heart);

    // Resplandor suave detrás del corazón
    const glow = new THREE.PointLight(0xff4d94, 45, 220);
    heart.add(glow);
    return heart;
}
const heart = createHeart();

// ============================================================
// 6. Estrellas 3D con frases
// ============================================================
function getStarShape(outer, inner) {
    const shape = new THREE.Shape();
    const spikes = 5;
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes * 2; i++) {
        const radius = (i % 2 === 0) ? outer : inner;
        const x = Math.cos(i * step - Math.PI / 2) * radius;
        const y = Math.sin(i * step - Math.PI / 2) * radius;
        if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
}

const phraseStars = [];
function create3DStars() {
    const starGeometry = new THREE.ShapeGeometry(getStarShape(2.8, 1.1));
    const starMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffe9b3,
        emissiveIntensity: 1.4, side: THREE.DoubleSide
    });

    phrases.forEach((text, i) => {
        const radius = 45 + Math.random() * 130;
        const angle = (i / phrases.length) * Math.PI * 2;
        const group = new THREE.Group();

        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.rotation.x = Math.random() * Math.PI;
        group.add(starMesh);

        const div = document.createElement('div');
        div.className = 'floating-label';
        div.textContent = text;
        const label = new CSS2DObject(div);
        label.position.set(0, 5, 0);
        group.add(label);

        group.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 55, Math.sin(angle) * radius);
        group.userData.phase = Math.random() * Math.PI * 2;
        group.userData.labelEl = div;
        scene.add(group);
        phraseStars.push(group);
    });
}
create3DStars();

// ---- Estrellas doradas clicables ----
const clickableStars = [];
function createMemoryStars() {
    const geo = new THREE.ShapeGeometry(getStarShape(4.5, 1.8));
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffd700, emissive: 0xffcc33,
        emissiveIntensity: 2.2, side: THREE.DoubleSide
    });

    memories.forEach((memory, i) => {
        const radius = 60 + Math.random() * 110;
        const angle = ((i + 0.25) / memories.length) * Math.PI * 2;
        const group = new THREE.Group();

        const starMesh = new THREE.Mesh(geo, mat);
        group.add(starMesh);

        // Esfera invisible más grande para que sea fácil de clicar/tocar
        const hit = new THREE.Mesh(
            new THREE.SphereGeometry(isMobile ? 16 : 10, 12, 12),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.userData.memory = memory;
        group.add(hit);
        clickableStars.push(hit);

        const div = document.createElement('div');
        div.className = 'floating-label gold-label';
        div.textContent = "✦ un recuerdo ✦";
        const label = new CSS2DObject(div);
        label.position.set(0, 7, 0);
        group.add(label);

        group.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 60, Math.sin(angle) * radius);
        group.userData.phase = Math.random() * Math.PI * 2;
        group.userData.isMemory = true;
        group.userData.labelEl = div;
        scene.add(group);
        phraseStars.push(group);
    });
}
createMemoryStars();

// ============================================================
// 7. Marcos de fotos
// ============================================================
const photoLabels = [];
function createPhotoFrames() {
    photos.forEach((photo, i) => {
        // Anillos alternos (cerca/lejos) y alturas escalonadas para evitar amontonamiento
        const ring = i % 2;
        const radius = (ring === 0 ? 95 : 185) + Math.random() * 30;
        const angle = ((i + 0.5) / photos.length) * Math.PI * 2;
        const height = (ring === 0 ? 60 : -25) + (Math.random() - 0.5) * 45;

        const frameDiv = document.createElement('div');
        frameDiv.className = 'photo-frame';
        const img = document.createElement('img');
        img.src = photo.file;
        img.onerror = () => { img.style.display = 'none'; frameDiv.insertAdjacentHTML('afterbegin', '<div style="height:140px;display:flex;align-items:center;justify-content:center;color:#b03a6e;font-style:italic;">Añade ' + photo.file + '</div>'); };
        const cap = document.createElement('div');
        cap.className = 'caption';
        cap.textContent = photo.caption;
        frameDiv.appendChild(img);
        frameDiv.appendChild(cap);

        const photoLabel = new CSS2DObject(frameDiv);
        photoLabel.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        photoLabel.userData.el = frameDiv;
        scene.add(photoLabel);
        photoLabels.push(photoLabel);
    });
}
createPhotoFrames();

// ============================================================
// 8. Estrellas fugaces
// ============================================================
const shootingStars = [];
function spawnShootingStar() {
    const geo = new THREE.BufferGeometry();
    const start = new THREE.Vector3(
        (Math.random() - 0.5) * 600,
        120 + Math.random() * 150,
        (Math.random() - 0.5) * 600
    );
    const dir = new THREE.Vector3(-1, -0.4, -0.5).normalize();
    const len = 40;
    const positions = new Float32Array([
        start.x, start.y, start.z,
        start.x - dir.x * len, start.y - dir.y * len, start.z - dir.z * len
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
        color: 0xfff0f6, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(geo, mat);
    line.userData = { dir, speed: 220 + Math.random() * 180, life: 0, maxLife: 2.2 };
    scene.add(line);
    shootingStars.push(line);
}

// ============================================================
// 8b. Corazones flotantes (bokeh romántico)
// ============================================================
function makeHeartTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 28, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,235,245,1)');
    grad.addColorStop(1, 'rgba(255,120,170,0.85)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.bezierCurveTo(2, 34, 12, 8, 32, 24);
    ctx.bezierCurveTo(52, 8, 62, 34, 32, 56);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const floatHeartsCount = Math.round(22 * QUALITY);
let floatingHearts;
function createFloatingHearts() {
    const positions = new Float32Array(floatHeartsCount * 3);
    const speeds = new Float32Array(floatHeartsCount);
    for (let i = 0; i < floatHeartsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 320;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 320;
        speeds[i] = 4 + Math.random() * 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        size: 5, map: makeHeartTexture(), transparent: true,
        opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData.speeds = speeds;
    scene.add(pts);
    return pts;
}
floatingHearts = createFloatingHearts();

// ============================================================
// 9. Luz ambiente
// ============================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const nucleusLight = new THREE.PointLight(0xffccaa, 40, 250);
scene.add(nucleusLight);

// ============================================================
// 10. Parallax con el mouse
// ============================================================
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

// ---- Clic en estrellas doradas → pop-up ----
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = renderer.domElement;
const modal = document.getElementById('memory-modal');
const modalImg = document.getElementById('modal-img');
const modalText = document.getElementById('modal-text');

let downPos = null;

function setPointer(e) {
    const t = e.touches ? e.touches[0] : e;
    pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
}

function intersectMemory() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickableStars, false);
    return hits.length ? hits[0].object.userData.memory : null;
}

canvas.addEventListener('pointerdown', (e) => {
    downPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
    if (!downPos) return;
    const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (dist > 6) return; // fue un arrastre, no un clic
    setPointer(e);
    const memory = intersectMemory();
    if (memory) openMemory(memory);
});

// Cursor cuando se pasa sobre una estrella dorada
canvas.addEventListener('mousemove', (e) => {
    setPointer(e);
    canvas.classList.toggle('hoverable', !!intersectMemory());
});

function openMemory(memory) {
    modalImg.src = memory.image;
    modalText.textContent = memory.text;
    modal.classList.add('open');
    controls.autoRotate = false;
}

function closeMemory() {
    modal.classList.remove('open');
    controls.autoRotate = true;
}

document.getElementById('modal-close').addEventListener('click', closeMemory);
modal.querySelector('.modal-backdrop').addEventListener('click', closeMemory);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMemory(); });

// ============================================================
// 11. Resize
// ============================================================
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = fovForViewport();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

// ============================================================
// 12. Animación
// ============================================================
const clock = new THREE.Clock();
let shootTimer = 0;
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05); // delta primero (clamp por si hay lag)
    time += delta;

    // Animación de entrada: vuelo de cámara con easing
    if (introT !== null) {
        introT += delta;
        const k = Math.min(introT / INTRO_DUR, 1);
        const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        camera.position.lerpVectors(camIntroStart, camIntroEnd, e);
        heartGrow = e;
        if (k >= 1) { introT = null; heartGrow = 1; controls.autoRotate = true; }
    }

    galaxy.rotation.y = time * 0.04;
    starfield.rotation.y = time * 0.005;
    galaxyRings.rotation.y = -time * 0.025;
    galaxyRings.children.forEach((ring, i) => { ring.rotation.y = time * (0.02 + i * 0.012); });

    // Latido del corazón
    const beat = 1 + Math.sin(time * 2.2) * 0.06 + Math.sin(time * 4.4) * 0.02;
    heart.scale.setScalar(beat * heartGrow);
    // Siempre de frente a la cámara (billboard), con un leve balanceo
    heart.quaternion.copy(camera.quaternion);
    heart.rotateZ(Math.sin(time * 0.5) * 0.08);

    phraseStars.forEach((star, i) => {
        star.rotation.y = time * 0.5;
        star.position.y += Math.sin(time * 0.8 + star.userData.phase) * 0.04;
        // Titileo suave de cada estrella
        const tw = 0.88 + Math.sin(time * 3 + star.userData.phase) * 0.12;
        if (star.children[0]) star.children[0].scale.setScalar(tw);
    });

    // Corazones flotantes ascendiendo
    const fhPos = floatingHearts.geometry.attributes.position;
    const speeds = floatingHearts.userData.speeds;
    for (let i = 0; i < speeds.length; i++) {
        let y = fhPos.array[i * 3 + 1] + speeds[i] * delta;
        if (y > 110) {
            y = -110;
            fhPos.array[i * 3] = (Math.random() - 0.5) * 320;
            fhPos.array[i * 3 + 2] = (Math.random() - 0.5) * 320;
        }
        fhPos.array[i * 3 + 1] = y;
    }
    fhPos.needsUpdate = true;

    // Estrellas fugaces
    shootTimer -= delta;
    if (shootTimer <= 0) {
        spawnShootingStar();
        shootTimer = 4 + Math.random() * 5;
    }
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.userData.life += delta;
        const move = s.userData.dir.clone().multiplyScalar(s.userData.speed * delta);
        s.position.add(move);
        s.material.opacity = Math.max(0, 0.6 * (1 - s.userData.life / s.userData.maxLife));
        if (s.userData.life >= s.userData.maxLife) {
            scene.remove(s);
            s.geometry.dispose();
            s.material.dispose();
            shootingStars.splice(i, 1);
        }
    }

    // Parallax suave: el universo reacciona al mouse
    controls.target.x += (mouse.x * 12 - controls.target.x) * 0.02;
    controls.target.y += (-mouse.y * 8 - controls.target.y) * 0.02;

    controls.update();

    // Oclusión: ocultar etiquetas que queden detrás del corazón
    updateHeartOcclusion();

    composer.render();
    labelRenderer.render(scene, camera);
}

// ---- Oclusión por el corazón ----
const HEART_CENTER = new THREE.Vector3(0, 4, 0);
const HEART_RADIUS = 24;
const _v = new THREE.Vector3();
const _hcNdc = new THREE.Vector3();
const _edgeNdc = new THREE.Vector3();
const _right = new THREE.Vector3();

function applyOcclusion(el, worldPos) {
    if (!el) return;
    const lpDist = camera.position.distanceTo(worldPos);
    const hcDist = camera.position.distanceTo(HEART_CENTER);
    _v.copy(worldPos).project(camera);
    const dx = _v.x - _hcNdc.x;
    const dy = _v.y - _hcNdc.y;
    const screenDist = Math.hypot(dx, dy);
    const screenR = Math.hypot(_edgeNdc.x - _hcNdc.x, _edgeNdc.y - _hcNdc.y);
    const occluded = lpDist > hcDist && screenDist < screenR;
    el.style.opacity = occluded ? '0' : '1';
    el.style.pointerEvents = 'none';
}

function updateHeartOcclusion() {
    // Asegura matrices de cámara al día para proyectar
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

    // Centro y radio del corazón proyectados a pantalla
    _hcNdc.copy(HEART_CENTER).project(camera);
    _right.setFromMatrixColumn(camera.matrixWorld, 0); // eje "derecha" de la cámara
    _edgeNdc.copy(HEART_CENTER).add(_right.multiplyScalar(HEART_RADIUS)).project(camera);

    phraseStars.forEach((star) => applyOcclusion(star.userData.labelEl, star.position));
    photoLabels.forEach((p) => applyOcclusion(p.userData.el, p.position));
}

animate();

// ============================================================
// 13. Pantalla de entrada + música
// ============================================================
const intro = document.getElementById('intro-screen');
const enterBtn = document.getElementById('enter-btn');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

let entered = false;
enterBtn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    intro.classList.add('hidden');
    document.body.classList.add('entered'); // dispara el fade-in de la interfaz
    startIntroAnimation();                   // vuelo de cámara + corazón floreciendo
    music.volume = 0.55;
    music.play().then(() => {
        musicToggle.classList.add('playing');
    }).catch(() => { /* sin archivo de audio aún */ });
});

musicToggle.addEventListener('click', () => {
    if (music.paused) {
        music.play().then(() => musicToggle.classList.add('playing')).catch(() => {});
    } else {
        music.pause();
        musicToggle.classList.remove('playing');
    }
});
