// Hero map — Iraq with governorate borders, Najaf as the origin.
// Intro: borders draw in, Najaf ignites, connections spread out to every governorate centre.
// Then an ambient loop: pulses travel the network, Najaf keeps rippling, job cards pop up.
// Without GSAP or with reduced motion it renders the finished, static map.
import { VIEWBOX, GOVERNORATES, CITIES, DOTS } from '../data/iraq-map.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const [VW, VH] = VIEWBOX;

// Secondary links between neighbouring cities, so the network reads as interconnected
const LINKS = [
  ['baghdad', 'baqubah'], ['baghdad', 'ramadi'], ['baghdad', 'tikrit'], ['baghdad', 'kut'],
  ['tikrit', 'kirkuk'], ['kirkuk', 'erbil'], ['kirkuk', 'sulaymaniyah'], ['erbil', 'mosul'],
  ['mosul', 'duhok'], ['erbil', 'sulaymaniyah'], ['kut', 'amarah'], ['amarah', 'basra'],
  ['nasiriyah', 'basra'], ['samawah', 'nasiriyah'], ['diwaniyah', 'kut'], ['hillah', 'baghdad'],
];

// Illustrative listings for the floating cards
const CARDS = [
  { city: 'baghdad', title: 'محاسب', tag: 'دوام كامل' },
  { city: 'basra', title: 'مهندس صيانة', tag: 'دوام كامل' },
  { city: 'erbil', title: 'موظف استقبال', tag: 'دوام جزئي' },
  { city: 'mosul', title: 'معلم رياضيات', tag: 'دوام كامل' },
  { city: 'karbala', title: 'مندوب مبيعات', tag: 'دوام كامل' },
  { city: 'nasiriyah', title: 'مساعد صيدلي', tag: 'دوام جزئي' },
  { city: 'sulaymaniyah', title: 'مصمم جرافيك', tag: 'عن بعد' },
];

const el = (name, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

// Quadratic curve from a to b, bowed to one side in proportion to its length
function arcPath(a, b, bend = 0.18) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M${a.x},${a.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x},${b.y}`;
}

export class HeroMap {
  constructor(root, { startAfter = null, skipIntro = false, drawTime = 0 } = {}) {
    this.root = root;
    if (!root) return;

    this.gsap = window.gsap;
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animate = Boolean(this.gsap) && !this.reduce;
    this.drawTime = drawTime;

    // Resolves once the intro has finished, so scroll effects can capture the settled state
    this.ready = new Promise(resolve => { this.resolveReady = resolve; });

    this.cities = Object.fromEntries(CITIES.map(c => [c.id, c]));
    this.hq = this.cities.najaf;

    this.build();
    this.prepareDots();
    this.resizeCanvas();

    new ResizeObserver(() => { this.resizeCanvas(); this.drawDots(); }).observe(this.stage);

    if (this.animate && skipIntro) {
      // Returning mid-page: show the finished map straight away and keep it alive
      this.reveal = Infinity;
      this.drawDots();
      this.startRipples();
      this.ambient();
      this.setupTilt();
      this.resolveReady();
    } else if (this.animate) {
      // Wait for the brand reveal; the map is hidden under it meanwhile
      Promise.resolve(startAfter).then(() => this.intro());
      this.setupTilt();
    } else {
      this.reveal = Infinity;
      this.drawDots();
      this.resolveReady();
    }
  }

  build() {
    this.root.innerHTML = '';
    this.stage = document.createElement('div');
    this.stage.className = 'map-stage';
    this.root.appendChild(this.stage);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'map-dots';
    this.ctx = this.canvas.getContext('2d');
    this.stage.appendChild(this.canvas);

    const svg = el('svg', { viewBox: `0 0 ${VW} ${VH}`, class: 'map-svg', role: 'img', 'aria-label': 'خريطة العراق — النجف نقطة الانطلاق' });
    this.svg = svg;

    const defs = el('defs');
    defs.innerHTML = `
      <linearGradient id="arcGrad" gradientUnits="userSpaceOnUse" x1="0" y1="${VH}" x2="${VW}" y2="0">
        <stop offset="0" stop-color="#0087C6"/>
        <stop offset="1" stop-color="#00B6E7"/>
      </linearGradient>
      <radialGradient id="hqGlow">
        <stop offset="0" stop-color="#00B6E7" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#0087C6" stop-opacity="0"/>
      </radialGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    svg.appendChild(defs);

    // Governorates: outline glow underneath, then the shapes with their borders
    const glow = el('g', { class: 'map-outline' });
    const govs = el('g', { class: 'map-govs' });
    this.govPaths = GOVERNORATES.map(g => {
      glow.appendChild(el('path', { d: g.d }));
      const p = el('path', { d: g.d, class: g.id === 'An-Najaf' ? 'gov gov--hq' : 'gov' });
      const title = el('title');
      title.textContent = g.ar;
      p.appendChild(title);
      govs.appendChild(p);
      return p;
    });
    svg.append(glow, govs);

    // HQ halo
    this.halo = el('circle', { cx: this.hq.x, cy: this.hq.y, r: 150, fill: 'url(#hqGlow)', class: 'hq-halo' });
    svg.appendChild(this.halo);

    // Secondary links
    const links = el('g', { class: 'map-links' });
    this.links = LINKS.map(([a, b]) => {
      const p = el('path', { d: arcPath(this.cities[a], this.cities[b], 0.12) });
      links.appendChild(p);
      return p;
    });
    svg.appendChild(links);

    // Main arcs from Najaf, nearest first
    const arcs = el('g', { class: 'map-arcs' });
    const others = CITIES.filter(c => c.id !== 'najaf')
      .map(c => ({ ...c, dist: Math.hypot(c.x - this.hq.x, c.y - this.hq.y) }))
      .sort((a, b) => a.dist - b.dist);
    this.maxDist = Math.max(...others.map(c => c.dist));
    this.arcs = others.map(c => {
      // Bow east-lying arcs one way and west-lying ones the other, so the fan stays readable
      const bend = 0.34 * ((c.x - this.hq.x) / c.dist) + (Math.abs(c.x - this.hq.x) < 40 ? 0.08 : 0);
      const path = el('path', { d: arcPath(this.hq, c, bend), class: 'arc', 'data-city': c.id });
      arcs.appendChild(path);
      return { city: c, path, length: 0 };
    });
    svg.appendChild(arcs);
    this.arcs.forEach(a => { a.length = a.path.getTotalLength(); });

    // Travelling pulses
    this.pulseLayer = el('g', { class: 'map-pulses' });
    svg.appendChild(this.pulseLayer);

    // City nodes + labels
    const nodes = el('g', { class: 'map-nodes' });
    this.nodes = {};
    CITIES.filter(c => c.id !== 'najaf').forEach(c => {
      const g = el('g', { class: `node${c.label ? ' node--labelled' : ''}`, transform: `translate(${c.x} ${c.y})` });
      g.appendChild(el('circle', { r: 9, class: 'node-ring' }));
      g.appendChild(el('circle', { r: 4.5, class: 'node-core' }));
      if (c.label) {
        const t = el('text', { y: -16, 'text-anchor': 'middle', class: 'node-label' });
        t.textContent = c.ar;
        g.appendChild(t);
      }
      nodes.appendChild(g);
      this.nodes[c.id] = g;
    });
    svg.appendChild(nodes);

    // Najaf: ripples + core
    const hq = el('g', { class: 'map-hq', transform: `translate(${this.hq.x} ${this.hq.y})` });
    this.ripples = [0, 1, 2].map(() => {
      const r = el('circle', { r: 10, class: 'hq-ripple' });
      hq.appendChild(r);
      return r;
    });
    this.hqCore = el('g', { class: 'hq-core' });
    this.hqCore.appendChild(el('circle', { r: 16, class: 'hq-core-ring' }));
    this.hqCore.appendChild(el('circle', { r: 8, class: 'hq-core-dot', filter: 'url(#softGlow)' }));
    hq.appendChild(this.hqCore);
    svg.appendChild(hq);

    this.stage.appendChild(svg);

    // Najaf label (HTML so the Arabic type stays crisp)
    this.hqLabel = document.createElement('div');
    this.hqLabel.className = 'hq-label';
    this.hqLabel.style.left = `${(this.hq.x / VW) * 100}%`;
    this.hqLabel.style.top = `${(this.hq.y / VH) * 100}%`;
    this.hqLabel.innerHTML = `
      <span class="hq-label-line" aria-hidden="true"></span>
      <span class="hq-label-card">
        <span class="hq-label-eyebrow">نقطة الانطلاق</span>
        <strong>النجف</strong>
        <small>المقر الرئيسي لوظّفني</small>
      </span>`;
    this.stage.appendChild(this.hqLabel);

    // Floating job card
    this.card = document.createElement('div');
    this.card.className = 'map-card';
    this.card.setAttribute('aria-hidden', 'true');
    this.cardBody = document.createElement('div');
    this.cardBody.className = 'map-card-body';
    this.card.appendChild(this.cardBody);
    this.stage.appendChild(this.card);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `
      <span><i class="lg-hq"></i>النجف — المقر ونقطة الانطلاق</span>
      <span><i class="lg-node"></i>مراكز المحافظات</span>`;
    this.root.appendChild(legend);
  }

  // ----- Dot texture (canvas) -----
  prepareDots() {
    this.dots = [];
    for (let i = 0; i < DOTS.length; i += 2) {
      const x = DOTS[i];
      const y = DOTS[i + 1];
      this.dots.push({ x, y, d: Math.hypot(x - this.hq.x, y - this.hq.y) });
    }
    this.dotMax = Math.max(...this.dots.map(d => d.d));
    this.reveal = 0;
    this.wave = -1;
  }

  resizeCanvas() {
    const rect = this.stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.scale = (rect.width * dpr) / VW;
  }

  drawDots() {
    const { ctx, scale } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const r = Math.max(0.8, 1.5 * scale);
    for (const dot of this.dots) {
      if (dot.d > this.reveal) continue;
      let alpha = 0.16;
      let blue = 0;
      // Fresh dots at the reveal front glow briefly
      const front = this.reveal - dot.d;
      if (front < 60) blue = Math.max(blue, 1 - front / 60);
      // Periodic wave rippling outward from Najaf
      if (this.wave >= 0) {
        const off = Math.abs(dot.d - this.wave);
        if (off < 40) blue = Math.max(blue, (1 - off / 40) * 0.8);
      }
      alpha += blue * 0.5;
      ctx.fillStyle = blue > 0.05
        ? `rgba(${Math.round(154 - 154 * blue)}, ${Math.round(160 + 22 * blue)}, ${Math.round(171 + 60 * blue)}, ${alpha})`
        : `rgba(154, 160, 171, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dot.x * scale, dot.y * scale, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ----- Intro timeline -----
  intro() {
    const { gsap } = this;
    const tl = gsap.timeline({ delay: this.drawTime ? 0 : 0.2, onComplete: () => { this.ambient(); this.resolveReady(); } });

    // Borders draw in
    this.govPaths.forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    gsap.set('.map-govs .gov', { fillOpacity: 0 });
    gsap.set(this.root.querySelector('.map-outline'), { opacity: 0 });
    gsap.set(this.arcs.map(a => a.path), { strokeDasharray: (i) => this.arcs[i].length, strokeDashoffset: (i) => this.arcs[i].length });
    gsap.set(this.links, { opacity: 0 });
    gsap.set(Object.values(this.nodes), { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });
    gsap.set(this.hqCore, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });
    gsap.set(this.halo, { opacity: 0 });
    this.hqCard = this.hqLabel.querySelector('.hq-label-card');
    gsap.set(this.hqLabel, { opacity: 0 });
    gsap.set(this.hqCard, { x: 12 });

    tl.to(this.govPaths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: { each: 0.035, from: 'random' } }, 0)
      .to(this.root.querySelector('.map-outline'), { opacity: 1, duration: 0.8 }, 0.9)
      .to('.map-govs .gov', { fillOpacity: 1, duration: 0.8 }, 1.1)
      .add(() => this.govPaths.forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }), 1.7);

    // Dots spread outward from Najaf
    const dots = { r: 0 };
    tl.to(dots, {
      r: this.dotMax + 80, duration: 2.2, ease: 'power2.out',
      onUpdate: () => { this.reveal = dots.r; this.drawDots(); },
    }, 0.5);

    // Najaf ignites
    tl.to(this.hqCore, { scale: 1, duration: 0.7, ease: 'back.out(2.2)' }, 0.7)
      .to(this.halo, { opacity: 1, duration: 1 }, 0.7)
      .add(() => this.startRipples(), 0.8)
      .to(this.hqLabel, { opacity: 1, duration: 0.6 }, 1.0)
      .to(this.hqCard, { x: 0, duration: 0.6, ease: 'power3.out' }, 1.0);

    // Connections spread out, nearer cities first
    this.arcs.forEach(a => {
      const at = 1.3 + (a.city.dist / this.maxDist) * 1.3;
      tl.to(a.path, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, at)
        .to(this.nodes[a.city.id], { scale: 1, duration: 0.45, ease: 'back.out(3)' }, at + 0.45);
    });
    tl.to(this.links, { opacity: 1, duration: 0.8, stagger: 0.04 }, 2.9);

    // Squeeze the whole draw-in into a set time when asked (the phone boot)
    if (this.drawTime) tl.timeScale(tl.duration() / this.drawTime);
  }

  startRipples() {
    const { gsap } = this;
    this.ripples.forEach((r, i) => {
      gsap.fromTo(r, { attr: { r: 10 }, opacity: 0.7 }, {
        attr: { r: 70 }, opacity: 0, duration: 2.4, ease: 'power1.out', repeat: -1, delay: i * 0.8,
      });
    });
    gsap.to(this.halo, { attr: { r: 175 }, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // ----- Ambient loop -----
  ambient() {
    const { gsap } = this;
    this.paused = false;

    // Skip canvas redraws while the hero is off-screen
    new IntersectionObserver(([entry]) => { this.paused = !entry.isIntersecting; }).observe(this.root);

    // Pulses: each arc sends one every few seconds, alternating direction
    this.arcs.forEach((a, i) => this.loopPulse(a, i * 0.35));

    // Dot wave every 6s
    const wave = { r: -1 };
    gsap.timeline({ repeat: -1, repeatDelay: 4 })
      .fromTo(wave, { r: 0 }, {
        r: this.dotMax + 40, duration: 2.6, ease: 'none',
        onUpdate: () => { this.wave = wave.r; if (!this.paused) this.drawDots(); },
        onComplete: () => { this.wave = -1; if (!this.paused) this.drawDots(); },
      });

    // Floating job cards
    this.cardIndex = 0;
    this.showCard();
  }

  loopPulse(arc, delay) {
    const { gsap } = this;
    const dot = el('circle', { r: 4, class: 'pulse' });
    this.pulseLayer.appendChild(dot);
    let outward = true;
    const state = { t: 0 };
    const run = () => {
      gsap.fromTo(state, { t: 0 }, {
        t: 1,
        duration: 0.9 + arc.length / 450,
        ease: 'power1.inOut',
        delay: gsap.utils.random(0.4, 3.5),
        onStart: () => gsap.set(dot, { opacity: 1 }),
        onUpdate: () => {
          const p = arc.path.getPointAtLength((outward ? state.t : 1 - state.t) * arc.length);
          dot.setAttribute('cx', p.x);
          dot.setAttribute('cy', p.y);
        },
        onComplete: () => {
          gsap.to(dot, { opacity: 0, duration: 0.2 });
          if (outward) this.flashNode(arc.city.id);
          outward = !outward;
          run();
        },
      });
    };
    gsap.delayedCall(delay, run);
  }

  flashNode(id) {
    const ring = this.nodes[id]?.querySelector('.node-ring');
    if (!ring) return;
    this.gsap.fromTo(ring, { attr: { r: 9 }, opacity: 1 }, { attr: { r: 22 }, opacity: 0, duration: 0.8, ease: 'power2.out', clearProps: 'opacity' });
  }

  showCard() {
    const { gsap } = this;
    const item = CARDS[this.cardIndex % CARDS.length];
    this.cardIndex += 1;
    const city = this.cities[item.city];
    this.cardBody.innerHTML = `
      <span class="map-card-icon"><svg class="icon"><use href="#i-briefcase"/></svg></span>
      <span><strong>${item.title}</strong><small>${city.ar} · ${item.tag}</small></span>`;
    this.card.style.left = `${(city.x / VW) * 100}%`;
    this.card.style.top = `${(city.y / VH) * 100}%`;
    this.card.classList.toggle('map-card--flip', city.x < VW * 0.45);

    this.flashNode(item.city);
    gsap.timeline({ onComplete: () => gsap.delayedCall(0.6, () => this.showCard()) })
      .fromTo(this.cardBody, { opacity: 0, y: 8, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' })
      .to(this.cardBody, { opacity: 0, y: -6, duration: 0.35, ease: 'power2.in' }, '+=2.4');
  }

  // ----- Cursor tilt -----
  setupTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const { gsap } = this;
    const hero = this.root.closest('.hero') || this.root;
    const rx = gsap.quickTo(this.stage, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(this.stage, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    gsap.set(this.stage, { transformPerspective: 1200 });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * 10);
      rx(-ny * 8);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}
