/* 3D background: a morphing "tech core" orbited by tech-stack labels, inside a particle starfield. */
import * as THREE from "three";

const canvas = document.getElementById("bg3d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  canvas.style.background = "radial-gradient(circle at 70% 40%, #1a1240, #05060a 60%)";
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.035);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 0, 9);

const root = new THREE.Group();
scene.add(root);

/* ---------- Morphing core (custom shader with simplex noise) ---------- */
const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const coreUniforms = {
  uTime: { value: 0 },
  uAmp: { value: 0.28 },
  uColorA: { value: new THREE.Color("#22d3ee") },
  uColorB: { value: new THREE.Color("#a855f7") },
  uColorC: { value: new THREE.Color("#f472b6") },
};

const coreMat = new THREE.ShaderMaterial({
  uniforms: coreUniforms,
  wireframe: false,
  transparent: true,
  vertexShader: /* glsl */ `
    uniform float uTime; uniform float uAmp;
    varying float vNoise; varying vec3 vNormal; varying vec3 vView;
    ${noiseGLSL}
    void main(){
      float n = snoise(normal * 1.4 + uTime * 0.35);
      vNoise = n;
      vec3 pos = position + normal * n * uAmp;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
    varying float vNoise; varying vec3 vNormal; varying vec3 vView;
    void main(){
      float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
      vec3 col = mix(uColorA, uColorB, smoothstep(-0.6, 0.6, vNoise));
      col = mix(col, uColorC, fres * 0.6);
      float alpha = 0.18 + fres * 0.9;
      gl_FragColor = vec4(col * (0.35 + fres * 1.4), alpha);
    }`,
});
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 64), coreMat);
root.add(core);

// Wireframe shell
const shell = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.25, 2)),
  new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.18 })
);
root.add(shell);

// Glowing vertex nodes on the shell
const nodeGeo = new THREE.IcosahedronGeometry(2.25, 1);
const nodeMat = new THREE.PointsMaterial({ color: 0xa855f7, size: 0.08, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
const nodes = new THREE.Points(nodeGeo, nodeMat);
root.add(nodes);

/* ---------- Orbit rings ---------- */
const rings = [];
[[3.1, 0x22d3ee, 0.35, [1.2, 0.2, 0]], [3.6, 0xa855f7, 0.25, [-0.5, 0.6, 0.3]], [4.1, 0xf472b6, 0.18, [0.3, -0.8, 0.4]]].forEach(([r, color, op, rot]) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.006, 8, 200),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op })
  );
  ring.rotation.set(...rot);
  root.add(ring);
  rings.push(ring);
});

/* ---------- Tech-stack labels orbiting the core ---------- */
function makeLabel(text, color) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = "600 44px JetBrains Mono, monospace";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 56;
  c.width = w; c.height = 84;
  ctx.font = font;
  ctx.fillStyle = "rgba(8,10,18,0.75)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const r = 40;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, 80, r);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 28, 44);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set((w / 84) * 0.42, 0.42, 1);
  return sprite;
}
const stack = [
  ["React", "#61dafb"], ["TypeScript", "#3178c6"], ["JavaScript", "#f7df1e"], ["HTML5", "#e34f26"],
  ["CSS3", "#38bdf8"], ["Node.js", "#68a063"], ["Git", "#f05032"], ["Three.js", "#ffffff"],
];
const labels = stack.map(([t, col], i) => {
  const s = makeLabel(t, col);
  s.userData = {
    radius: 3.2 + (i % 3) * 0.45,
    speed: 0.18 + (i % 4) * 0.04,
    phase: (i / stack.length) * Math.PI * 2,
    tilt: ((i % 3) - 1) * 0.55,
  };
  root.add(s);
  return s;
});
// Re-render labels once web fonts are ready so they use JetBrains Mono
document.fonts?.ready.then(() => {
  labels.forEach((s, i) => {
    const fresh = makeLabel(...stack[i]);
    s.material.map.dispose();
    s.material.map = fresh.material.map;
    s.scale.copy(fresh.scale);
  });
});

/* ---------- Starfield / data particles ---------- */
const STAR_COUNT = innerWidth < 700 ? 1200 : 2600;
const starPos = new Float32Array(STAR_COUNT * 3);
const starCol = new Float32Array(STAR_COUNT * 3);
const palette = [new THREE.Color("#22d3ee"), new THREE.Color("#a855f7"), new THREE.Color("#e6e9f2"), new THREE.Color("#f472b6")];
for (let i = 0; i < STAR_COUNT; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 60;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
  const c = palette[Math.floor(Math.random() * palette.length)];
  starCol.set([c.r, c.g, c.b], i * 3);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  size: 0.06, vertexColors: true, transparent: true, opacity: 0.85,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
}));
scene.add(stars);

/* ---------- Grid floor ---------- */
const grid = new THREE.GridHelper(80, 60, 0x22d3ee, 0x1b2140);
grid.position.y = -6;
grid.material.transparent = true;
grid.material.opacity = 0.25;
scene.add(grid);

/* ---------- Interaction state ---------- */
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
addEventListener("pointermove", (e) => {
  target.x = (e.clientX / innerWidth) * 2 - 1;
  target.y = -(e.clientY / innerHeight) * 2 + 1;
});

let scrollProgress = 0;
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollProgress = max > 0 ? scrollY / max : 0;
};
addEventListener("scroll", onScroll, { passive: true });

let warp = 0; // 0..1, boosted during page transitions
addEventListener("portfolio:warp", () => { warp = 1; });

let intro = 0; // 0..1 entrance animation after loader
let introStarted = false;
addEventListener("portfolio:ready", () => { introStarted = true; });
setTimeout(() => { introStarted = true; }, 4000); // safety

function layout() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  // desktop: core sits to the right of the hero text; mobile: centered behind it
  root.userData.baseX = w > 860 ? 3.2 : 0;
  root.userData.baseScale = w > 860 ? 1 : 0.72;
}
layout();
addEventListener("resize", layout);

/* ---------- Render loop ---------- */
const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const speed = reduceMotion ? 0.15 : 1;

  if (introStarted) intro = Math.min(1, intro + dt * 0.7);
  const ease = 1 - Math.pow(1 - intro, 3);
  warp *= 0.96;

  mouse.lerp(target, 0.05);
  coreUniforms.uTime.value = t * speed;
  coreUniforms.uAmp.value = 0.22 + warp * 0.6 + Math.sin(t * 0.8) * 0.04;

  // Root transform: entrance scale, scroll drift, mouse parallax
  const s = root.userData.baseScale * (0.4 + ease * 0.6);
  root.scale.setScalar(s);
  root.position.x = root.userData.baseX * (1 - scrollProgress * 1.6) + mouse.x * 0.3;
  root.position.y = mouse.y * 0.3 - scrollProgress * 1.5;
  root.rotation.y += dt * 0.12 * speed + warp * 0.08;
  root.rotation.x = mouse.y * 0.25 + scrollProgress * Math.PI * 0.6;

  shell.rotation.y -= dt * 0.25 * speed;
  shell.rotation.z += dt * 0.08 * speed;
  nodes.rotation.copy(shell.rotation);
  rings.forEach((r, i) => { r.rotation.z += dt * (0.1 + i * 0.07) * speed * (i % 2 ? -1 : 1); });

  labels.forEach((l) => {
    const { radius, speed: sp, phase, tilt } = l.userData;
    const a = t * sp * speed + phase;
    l.position.set(Math.cos(a) * radius, Math.sin(a * 1.3) * 0.6 + tilt * Math.sin(a), Math.sin(a) * radius);
    l.material.opacity = (0.35 + 0.65 * ((l.position.z / radius + 1) / 2)) * ease;
  });

  // Stars drift toward the camera; warp makes them streak
  const pos = starGeo.attributes.position.array;
  const fly = (0.6 + warp * 60) * dt * speed;
  for (let i = 2; i < pos.length; i += 3) {
    pos[i] += fly;
    if (pos[i] > 10) pos[i] -= 90;
  }
  starGeo.attributes.position.needsUpdate = true;
  stars.material.size = 0.06 + warp * 0.12;

  grid.position.z = (t * 1.2 * speed) % (80 / 60);

  camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
  camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.04;
  camera.fov = 55 + warp * 25;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Pause rendering cost when tab is hidden
document.addEventListener("visibilitychange", () => { if (!document.hidden) clock.getDelta(); });
