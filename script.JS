

// --- SMOOTH SCROLL LERP SETUP ---
const content = document.getElementById('smooth-content');
let currentY = 0, targetY = 0;
const ease = 0.08;

function setBodyHeight() {
  if (content) {
    document.body.style.height = `${content.getBoundingClientRect().height}px`;
  }
}
window.addEventListener('load', setBodyHeight);
window.addEventListener('resize', setBodyHeight);

function rafSmooth() {
  if (content) {
    targetY = window.scrollY || window.pageYOffset;
    currentY += (targetY - currentY) * ease;
    if (Math.abs(targetY - currentY) < 0.01) currentY = targetY;

    content.style.transform = `translate3d(0, ${-currentY}px, 0)`;

    applySectionTransforms(currentY);
  }
  requestAnimationFrame(rafSmooth);
}
requestAnimationFrame(rafSmooth);

// --- PER-SECTION 3D EFFECTS ---
function applySectionTransforms(scrollY) {
  if (!content) return;
  const panels = Array.from(document.querySelectorAll('.panel'));
  const winH = window.innerHeight;
  panels.forEach(panel => {
    const rect = panel.getBoundingClientRect();
    const panelMiddle = rect.top + rect.height / 2;
    const progress = (panelMiddle - winH / 2) / (winH / 2);
    const clamped = Math.max(-1, Math.min(1, progress));

    const tilt = clamped * 8; 
    const z = Math.abs(clamped) * -80;

    const inner = panel.querySelector('.panel-inner');
    if (inner) {
      inner.style.transform = `translateZ(${z}px) rotateX(${tilt}deg)`;
      const opacity = 1 - Math.min(0.6, Math.abs(clamped) * 0.8);
      inner.style.opacity = String(opacity);
    }
  });
}

// --- Smooth anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ----------------------------
  THREE.JS STARFIELD BACKGROUND
-----------------------------*/
const canvas = document.querySelector('#bg');
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // --- star texture ---
  function createStarTexture(size = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const cx = size / 2, cy = size / 2, r = size * 0.45;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(200,240,255,0.9)');
    g.addColorStop(1, 'rgba(200,240,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(c);
  }
  const starTex = createStarTexture(128);

  // --- star geometry ---
  const starCount = 3000;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (Math.random() - 0.5) * 80;
    pos[i + 1] = (Math.random() - 0.5) * 60;
    pos[i + 2] = (Math.random() - 0.5) * 200;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({
    map: starTex, transparent: true, size: 0.25, sizeAttenuation: true, color: 0xffffff, alphaTest: 0.01
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  scene.add(starPoints);

  // --- mouse interaction ---
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animateThree() {
    requestAnimationFrame(animateThree);
    starPoints.rotation.y += 0.0005;
    starPoints.rotation.x = mouseY * 0.05;
    starPoints.rotation.y += mouseX * 0.001;
    starMat.size = 0.22 + Math.sin(Date.now() * 0.002) * 0.03;
    renderer.render(scene, camera);
  }
  animateThree();

  // --- resize ---
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    setBodyHeight();
  });
}
