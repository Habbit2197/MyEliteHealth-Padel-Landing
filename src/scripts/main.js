// MyEliteHealth · animaciones en JavaScript sin librerías.
// Todo respeta «reducir movimiento» del sistema.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ── Barra de progreso, navegación y línea de tiempo ─────────────────
const progress = $('.progress');
const nav = $('.nav');
const timeline = $('.timeline');
let ticking = false;
function onScroll() {
  const h = document.documentElement;
  const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  if (progress) progress.style.transform = `scaleX(${p})`;
  if (nav) nav.classList.toggle('scrolled', h.scrollTop > 40);
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
    timeline.style.setProperty('--tl', t.toFixed(3));
  }
  if (!reduce) parallax();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

// Menú móvil
const toggle = $('.menu-toggle');
const links = $('.nav-links');
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// ── Revelado al entrar en pantalla ──────────────────────────────────
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    const delay = Number(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('in'), reduce ? 0 : delay);
    if (el.matches('[data-count]')) countUp(el);
    if (el.matches('.momentum-card')) drawMomentum(el);
    io.unobserve(el);
  }
}, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
$$('[data-reveal], [data-count], .momentum-card').forEach(el => io.observe(el));

// Contadores
function countUp(el) {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (reduce) { el.textContent = end + suffix; return; }
  const dur = 1400; const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const v = Math.round(end * (1 - Math.pow(1 - k, 3)));
    el.textContent = v + suffix;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Parallax suave de los teléfonos ─────────────────────────────────
const floaters = $$('[data-float]');
function parallax() {
  for (const el of floaters) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const speed = Number(el.dataset.float || 0.08);
    const center = r.top + r.height / 2 - innerHeight / 2;
    el.style.translate = `0 ${(-center * speed).toFixed(1)}px`;
  }
}

// Inclinación del escenario del hero con el ratón
const stage = $('.hero-stage');
if (stage && !reduce && matchMedia('(pointer: fine)').matches) {
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  });
  stage.addEventListener('mouseleave', () => { stage.style.transform = ''; });
  stage.style.transition = 'transform .4s ease-out';
  stage.style.transformStyle = 'preserve-3d';
}

// ── Marcador del reloj: un partido que se juega solo ────────────────
const watch = $('[data-watch]');
if (watch) {
  const pts = ['0', '15', '30', '40'];
  const me = $('[data-me]', watch), them = $('[data-them]', watch), games = $('[data-games]', watch);
  let a = 0, b = 0, ga = 4, gb = 3;
  const seq = [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1];
  let i = 0;
  const render = (who) => {
    me.textContent = pts[a];
    them.textContent = pts[b];
    games.textContent = `SET 2 · ${ga}-${gb}`;
    const el = who ? me : them;
    el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 260);
  };
  const point = () => {
    const mine = seq[i++ % seq.length] === 1;
    if (mine) a++; else b++;
    // Punto de oro: en 40-40 el siguiente punto gana el juego.
    if (a === 4 || b === 4) {
      if (a > b) ga++; else gb++;
      a = 0; b = 0;
      if (ga >= 6 || gb >= 6) { ga = 4; gb = 3; }
    }
    render(mine);
  };
  if (!reduce) setInterval(point, 1500);
}

// ── Pista interactiva: lado drive / revés ───────────────────────────
const court = $('[data-court]');
if (court) {
  const caption = $('[data-court-caption]');
  const player = $('.player', court);
  const texts = {
    reves: 'Juegas de <b>revés</b> (izquierda). La app guarda tus sets en ese lado y te enseña cómo te va jugando ahí frente a jugando de drive.',
    drive: 'Juegas de <b>drive</b> (derecha). Si cambiáis de lado entre sets, cada set guarda el suyo.',
  };
  const set = (side) => {
    $$('button', court).forEach(b => b.classList.toggle('active', b.dataset.side === side));
    player.style.left = side === 'reves' ? 'calc(25% - 15px)' : 'calc(75% - 15px)';
    caption.innerHTML = texts[side];
  };
  $$('button', court).forEach(b => b.addEventListener('click', () => set(b.dataset.side)));
  set('drive');
}

// ── Momentum del partido (datos de ejemplo, marcados como tales) ─────
// Secuencia determinista de 80 puntos: 1 = punto tuyo, 0 = del rival.
function demoPoints() {
  let s = 7; const out = [];
  for (let k = 0; k < 80; k++) {
    s = (s * 9301 + 49297) % 233280;
    const bias = k < 30 ? 0.47 : k < 55 ? 0.56 : 0.6;
    const win = s / 233280 < bias;
    const breakPoint = k % 9 === 4;
    out.push({ win, breakPoint, high: (s % 5) === 0, long: (s % 7) === 0 });
  }
  return out;
}
const POINTS = demoPoints();

function momentumPath(points, w, h) {
  let v = 0; const vals = [0];
  points.forEach(p => { v += p.win ? 1 : -1; vals.push(v); });
  const max = Math.max(6, ...vals.map(Math.abs));
  const x = (k) => (k / (vals.length - 1)) * w;
  const y = (val) => h / 2 - (val / max) * (h / 2 - 8);
  const d = vals.map((val, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(val).toFixed(1)}`).join(' ');
  return { d, vals, x, y };
}

function drawMomentum(card) {
  const svg = $('svg', card);
  const W = 600, H = 220;
  const { d, vals, x, y } = momentumPath(POINTS, W, H);
  $('.path', svg).setAttribute('d', d);
  $('.area', svg).setAttribute('d', `${d} L${W} ${H / 2} L0 ${H / 2} Z`);
  const dots = $('.dots', svg);
  dots.innerHTML = '';
  POINTS.forEach((p, k) => {
    if (!p.breakPoint) return;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x(k + 1)); c.setAttribute('cy', y(vals[k + 1])); c.setAttribute('r', 4.5);
    c.setAttribute('class', p.win ? 'dot-win' : 'dot-loss');
    dots.appendChild(c);
  });
  const path = $('.path', svg);
  const len = path.getTotalLength();
  path.style.strokeDasharray = len; path.style.strokeDashoffset = reduce ? 0 : len;
  path.getBoundingClientRect();
  path.style.transition = reduce ? 'none' : 'stroke-dashoffset 2.2s cubic-bezier(.4,.1,.2,1)';
  path.style.strokeDashoffset = 0;
  card.classList.add('in');
}

// Filtros de puntos (como en la app)
const filterBox = $('[data-filters]');
if (filterBox) {
  const counts = {
    todos: POINTS.length,
    ganados: POINTS.filter(p => p.win).length,
    perdidos: POINTS.filter(p => !p.win).length,
    break: POINTS.filter(p => p.breakPoint).length,
    altos: POINTS.filter(p => p.high).length,
    largos: POINTS.filter(p => p.long).length,
  };
  $$('[data-filter]', filterBox).forEach(chip => {
    $('.chip-count', chip).textContent = counts[chip.dataset.filter];
    chip.addEventListener('click', () => {
      $$('[data-filter]', filterBox).forEach(c => c.classList.toggle('on', c === chip));
      const sel = chip.dataset.filter;
      const match = (p) => sel === 'todos' || (sel === 'ganados' && p.win) || (sel === 'perdidos' && !p.win)
        || (sel === 'break' && p.breakPoint) || (sel === 'altos' && p.high) || (sel === 'largos' && p.long);
      const n = POINTS.filter(match).length;
      const won = POINTS.filter(p => match(p) && p.win).length;
      $('[data-filter-result]').textContent = `${n} puntos · ganaste ${won} (${Math.round(won / Math.max(1, n) * 100)} %)`;
    });
  });
  $('[data-filter="todos"]', filterBox).click();
}

// Primer pintado, cuando todo lo anterior ya está definido.
onScroll();
