import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Procedural barbershop scene: a spinning barber pole, scissors, a straight
 * razor, a comb and warm dust, all built from primitives (no downloaded
 * models). The page drives it with setProgress(0..1) as the user scrolls; the
 * render loop eases toward the target so motion stays smooth.
 */

const COLORS = {
  night: 0x0c0a08,
  brass: 0xc9a227,
  chrome: 0xd9dde2,
  wood: 0x3a2416,
  red: 0xa3261d,
  blue: 0x1f4e8c,
  cream: 0xf3ebdd,
};

/** One keyframe per landing section. x values shrink on narrow screens. */
const KEYFRAMES = [
  {
    cam: [0, 0.2, 7.2],
    look: [0.6, 0, 0],
    pole: [2.1, -0.1, 0],
    poleTilt: 0.12,
    scissors: [3.6, 2.4, -2],
    open: 0.15,
    razor: [-4.5, -2.6, -3],
    comb: [5, -3, -4],
  },
  {
    cam: [0, 0.3, 6.4],
    look: [-0.6, 0, 0],
    pole: [-2.3, 0, -0.6],
    poleTilt: -0.18,
    scissors: [1.9, 0.5, 0.6],
    open: 0.55,
    razor: [3.6, -2.2, -2.5],
    comb: [-4.4, 2.6, -3.5],
  },
  {
    cam: [0.4, -0.2, 5.6],
    look: [0.5, -0.2, 0],
    pole: [2.4, 0.2, -0.8],
    poleTilt: 0.22,
    scissors: [-3.4, 1.8, -1.6],
    open: 0.05,
    razor: [-1.4, -0.6, 1.1],
    comb: [3.2, 2.4, -2.4],
  },
  {
    cam: [-0.3, 0.4, 6.8],
    look: [-0.4, 0.2, 0],
    pole: [-2.6, -0.3, -1],
    poleTilt: -0.1,
    scissors: [2.9, -1.6, -0.8],
    open: 0.7,
    razor: [-3.8, 2.4, -2.2],
    comb: [1.7, 0.9, 0.9],
  },
  {
    cam: [0, 0.1, 8.6],
    look: [0, 0, 0],
    pole: [0, -0.1, -0.4],
    poleTilt: 0,
    scissors: [-2.6, 1.3, 0.2],
    open: 0.35,
    razor: [2.7, -1.4, 0.3],
    comb: [2.4, 1.6, -0.6],
  },
];

function stripeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3ebdd';
  ctx.fillRect(0, 0, 512, 512);
  const bands = [
    { color: '#a3261d', offset: 0 },
    { color: '#1f4e8c', offset: 256 },
  ];
  ctx.lineWidth = 0;
  bands.forEach(({ color, offset }) => {
    ctx.fillStyle = color;
    for (let k = -2; k < 3; k += 1) {
      const y = offset + k * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + 512);
      ctx.lineTo(512, y + 512 + 110);
      ctx.lineTo(0, y + 110);
      ctx.closePath();
      ctx.fill();
    }
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2.2);
  texture.anisotropy = 8;
  return texture;
}

function buildPole(materials) {
  const group = new THREE.Group();
  const stripes = stripeTexture();
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 3, 64, 1, true),
    new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.35, metalness: 0.05 }),
  );
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.56, 3.05, 64, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.18,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
  );
  const ring = new THREE.CylinderGeometry(0.66, 0.66, 0.16, 64);
  const capTop = new THREE.Mesh(ring, materials.brass);
  capTop.position.y = 1.6;
  const capBottom = capTop.clone();
  capBottom.position.y = -1.6;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.brass,
  );
  dome.position.y = 1.68;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16), materials.brass);
  knob.position.y = 2.22;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, 0.5, 64), materials.brass);
  base.position.y = -1.92;
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.1), materials.brass);
  bracket.position.set(0, 0, -0.9);
  group.add(inner, glass, capTop, capBottom, dome, knob, base, bracket);
  return { group, stripes };
}

function bladeShape(length, width) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -width / 2);
  shape.lineTo(length * 0.85, -width * 0.18);
  shape.quadraticCurveTo(length, 0, length * 0.85, width * 0.05);
  shape.lineTo(0, width / 2);
  shape.closePath();
  return shape;
}

function buildScissors(materials) {
  const group = new THREE.Group();
  const halves = [1, -1].map((side) => {
    const half = new THREE.Group();
    const blade = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bladeShape(1.9, 0.26), {
        depth: 0.04,
        bevelEnabled: true,
        bevelSize: 0.01,
        bevelThickness: 0.01,
        bevelSegments: 2,
      }),
      materials.chrome,
    );
    blade.position.z = side * 0.025;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.09, 0.05), materials.chrome);
    arm.position.set(-0.38, side * -0.06, side * 0.025);
    arm.rotation.z = side * 0.25;
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 16, 48), materials.brass);
    loop.position.set(-0.86, side * -0.2, side * 0.025);
    half.add(blade, arm, loop);
    group.add(half);
    return { half, side };
  });
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24), materials.brass);
  screw.rotation.x = Math.PI / 2;
  group.add(screw);
  group.scale.setScalar(0.9);
  return {
    group,
    setOpen(amount) {
      halves.forEach(({ half, side }) => {
        half.rotation.z = side * amount * 0.45;
      });
    },
  };
}

function buildRazor(materials) {
  const group = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape(1.6, 0.42), {
      depth: 0.03,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 2,
    }),
    materials.chrome,
  );
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 1.5, 8, 24), materials.wood);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-0.9, -0.12, 0.02);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 20), materials.brass);
  pin.rotation.x = Math.PI / 2;
  pin.position.set(-0.05, -0.08, 0.02);
  group.add(blade, handle, pin);
  group.scale.setScalar(0.85);
  return group;
}

function buildComb(materials) {
  const group = new THREE.Group();
  const spine = new THREE.Mesh(new THREE.BoxGeometry(2, 0.22, 0.06), materials.wood);
  group.add(spine);
  const teethCount = 26;
  const tooth = new THREE.BoxGeometry(0.035, 0.42, 0.05);
  const teeth = new THREE.InstancedMesh(tooth, materials.wood, teethCount);
  const m = new THREE.Matrix4();
  for (let i = 0; i < teethCount; i += 1) {
    m.makeTranslation(-0.95 + (i * 1.9) / (teethCount - 1), -0.3, 0);
    teeth.setMatrixAt(i, m);
  }
  group.add(teeth);
  group.scale.setScalar(0.7);
  return group;
}

function buildDust(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xe9c77a,
    size: 0.03,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

export class BarberScene {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.target = 0;
    this.progress = 0;
    this.pointer = { x: 0, y: 0 };
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.night);
    this.scene.fog = new THREE.Fog(COLORS.night, 7, 17);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    this.lookAt = new THREE.Vector3();

    const key = new THREE.SpotLight(0xffd59a, 60, 30, Math.PI / 5, 0.5, 1.4);
    key.position.set(3, 6, 6);
    const rim = new THREE.PointLight(0x5a86d6, 14, 14);
    rim.position.set(-5, 1, -2);
    const warm = new THREE.PointLight(0xc0392b, 8, 12);
    warm.position.set(4, -2, 2);
    this.scene.add(key, rim, warm, new THREE.AmbientLight(0x3a2c20, 0.6));

    const materials = {
      brass: new THREE.MeshStandardMaterial({ color: COLORS.brass, metalness: 1, roughness: 0.28 }),
      chrome: new THREE.MeshStandardMaterial({
        color: COLORS.chrome,
        metalness: 1,
        roughness: 0.12,
      }),
      wood: new THREE.MeshStandardMaterial({ color: COLORS.wood, metalness: 0.1, roughness: 0.55 }),
    };
    this.materials = materials;

    const pole = buildPole(materials);
    this.pole = pole.group;
    this.stripes = pole.stripes;
    this.scissors = buildScissors(materials);
    this.razor = buildRazor(materials);
    this.comb = buildComb(materials);
    this.dust = buildDust(window.innerWidth < 768 ? 220 : 600);
    this.scene.add(this.pole, this.scissors.group, this.razor, this.comb, this.dust);

    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.onPointer = this.onPointer.bind(this);
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    this.resize();
    this.apply(0, 0);
    this.frame = requestAnimationFrame(this.tick);
  }

  setProgress(value) {
    this.target = Math.min(1, Math.max(0, value));
    if (this.reducedMotion) this.progress = this.target;
  }

  onPointer(event) {
    this.pointer.x = event.clientX / window.innerWidth - 0.5;
    this.pointer.y = event.clientY / window.innerHeight - 0.5;
  }

  resize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.narrow = w < 768;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = this.narrow ? 50 : 38;
    this.camera.updateProjectionMatrix();
  }

  /** Places every object for a scroll progress p (0..1). */
  apply(p, time) {
    const span = KEYFRAMES.length - 1;
    const index = Math.min(span - 1, Math.floor(p * span));
    const t = smooth(p * span - index);
    const a = KEYFRAMES[index];
    const b = KEYFRAMES[index + 1];
    const xs = this.narrow ? 0.38 : 1;
    const mix = (key, i) => lerp(a[key][i], b[key][i], t) * (i === 0 ? xs : 1);

    this.camera.position.set(
      mix('cam', 0) + this.pointer.x * 0.4,
      mix('cam', 1) - this.pointer.y * 0.3,
      mix('cam', 2) + (this.narrow ? 1.6 : 0),
    );
    this.lookAt.set(mix('look', 0), mix('look', 1), mix('look', 2));
    this.camera.lookAt(this.lookAt);

    this.pole.position.set(mix('pole', 0), mix('pole', 1), mix('pole', 2));
    this.pole.rotation.z = lerp(a.poleTilt, b.poleTilt, t);
    this.pole.rotation.y = p * Math.PI * 1.5;

    this.scissors.group.position.set(mix('scissors', 0), mix('scissors', 1), mix('scissors', 2));
    this.scissors.group.rotation.set(0.4 + p * 2.2, p * 3.4 + time * 0.1, -0.6 + p * 1.4);
    this.scissors.setOpen(lerp(a.open, b.open, t) + Math.sin(time * 1.4) * 0.05);

    this.razor.position.set(mix('razor', 0), mix('razor', 1), mix('razor', 2));
    this.razor.rotation.set(0.6 - p * 1.2, -0.8 + p * 4, 0.3 + Math.sin(time * 0.6) * 0.08);

    this.comb.position.set(mix('comb', 0), mix('comb', 1), mix('comb', 2));
    this.comb.rotation.set(0.9 + p * 1.6, 0.4 + p * 2.6, -0.5 + Math.cos(time * 0.5) * 0.08);
  }

  tick() {
    const time = this.clock.getElapsedTime();
    if (!this.reducedMotion) {
      this.progress += (this.target - this.progress) * 0.075;
      this.stripes.offset.y = -time * 0.18;
      this.dust.rotation.y = time * 0.015;
      this.dust.position.y = Math.sin(time * 0.2) * 0.15;
    }
    this.apply(this.progress, this.reducedMotion ? 0 : time);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      const { material } = object;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.stripes.dispose();
    this.envMap.dispose();
    this.renderer.dispose();
  }
}
