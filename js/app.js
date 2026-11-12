import * as S from './structures.js';

const $ = (s) => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';

const TABS = {
  stack: {
    title: 'PILA', make: () => S.stackNew(8), code: S.STACK_CODE,
    ops: [
      { id: 'push', label: 'PUSH', k: '--green', run: (st, v) => S.stackPush(st, v), o: 'O(1)' },
      { id: 'pop', label: 'POP', k: '--pink', run: (st) => S.stackPop(st), o: 'O(1)' },
      { id: 'peek', label: 'CIMA', k: '--yellow', run: (st) => S.stackPeek(st), o: 'O(1)' },
    ],
    fill: (st) => { for (let i = 0; i < 5; i++) S.stackPush(st, rnd()); },
    info: (st) => `tamaño ${st.items.length}/${st.cap} · LIFO: el último que entra es el primero que sale`,
  },
  queue: {
    title: 'COLA CIRCULAR', make: () => S.queueNew(8), code: S.QUEUE_CODE,
    ops: [
      { id: 'enqueue', label: 'ENCOLAR', k: '--green', run: (st, v) => S.queueEnqueue(st, v), o: 'O(1)' },
      { id: 'dequeue', label: 'DESENCOLAR', k: '--pink', run: (st) => S.queueDequeue(st), o: 'O(1)' },
    ],
    fill: (st) => { for (let i = 0; i < 5; i++) S.queueEnqueue(st, rnd()); },
    info: (st) => `${st.count}/${st.cap} · FIFO · frente ${st.front} · fin ${st.rear}`,
  },
  list: {
    title: 'LISTA ENLAZADA', make: () => S.listNew(), code: S.LIST_CODE,
    ops: [
      { id: 'pushFront', label: '+ INICIO', k: '--green', run: (st, v) => S.listPushFront(st, v), o: 'O(1)' },
      { id: 'pushBack', label: '+ FINAL', k: '--green', run: (st, v) => S.listPushBack(st, v), o: 'O(n)' },
      { id: 'search', label: 'BUSCAR', k: '--yellow', run: (st, v) => S.listSearch(st, v), o: 'O(n)' },
      { id: 'remove', label: 'ELIMINAR', k: '--pink', run: (st, v) => S.listRemove(st, v), o: 'O(n)' },
      { id: 'reverse', label: 'INVERTIR', k: '--purple', run: (st) => S.listReverse(st), o: 'O(n)' },
    ],
    fill: (st) => { for (let i = 0; i < 5; i++) S.listPushBack(st, rnd()); },
    info: (st) => `${st.nodes.length} nodos · cada nodo guarda un dato y un puntero al siguiente`,
  },
  bst: {
    title: 'ÁRBOL BINARIO DE BÚSQUEDA', make: () => S.bstNew(), code: S.BST_CODE,
    ops: [
      { id: 'insert', label: 'INSERTAR', k: '--green', run: (st, v) => S.bstInsert(st, v), o: 'O(h)' },
      { id: 'search', label: 'BUSCAR', k: '--yellow', run: (st, v) => S.bstSearch(st, v), o: 'O(h)' },
      { id: 'remove', label: 'ELIMINAR', k: '--pink', run: (st, v) => S.bstRemove(st, v), o: 'O(h)' },
      { id: 'inorder', label: 'INORDEN', k: '--cyan', run: (st) => S.bstTraverse(st, 'inorder'), o: 'O(n)' },
      { id: 'preorder', label: 'PREORDEN', k: '--cyan', run: (st) => S.bstTraverse(st, 'preorder'), o: 'O(n)' },
      { id: 'postorder', label: 'POSTORDEN', k: '--cyan', run: (st) => S.bstTraverse(st, 'postorder'), o: 'O(n)' },
    ],
    fill: (st) => { for (const v of [50, 30, 70, 20, 40, 60, 80, 35, 65]) S.bstInsert(st, v); },
    info: (st) => { const n = S.bstInorder(st).length; return `${n} nodos · altura ${S.bstHeight(st.root)} · izquierda < nodo < derecha`; },
  },
};

const state = { tab: 'stack', data: {}, steps: [], i: 0, playing: false, timer: null, opId: null };
const rnd = () => Math.floor(Math.random() * 90) + 10;
for (const k of Object.keys(TABS)) state.data[k] = TABS[k].make();

// ---------------- código C++ con colores ----------------
function highlight(line) {
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // separa el comentario (fuera de comillas) y colorea solo el código
  let code = line, comment = '';
  const m = line.match(/^((?:[^"/]|"[^"]*"|\/(?!\/))*)(\/\/.*)$/);
  if (m) { code = m[1]; comment = m[2]; }
  const parts = code.split(/("[^"]*")/g).map((seg, i) => {
    if (i % 2) return `<span class="str">${esc(seg)}</span>`;
    return esc(seg)
      .replace(/\b(if|else|while|return|new|delete|void|int|bool|true|false|nullptr)\b/g, '<span class="kw">$1</span>')
      .replace(/\b(Nodo|cout)\b/g, '<span class="ty">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  });
  return parts.join('') + (comment ? `<span class="cm">${esc(comment)}</span>` : '');
}
function renderCode(line = -1) {
  const tab = TABS[state.tab];
  const opId = state.opId || tab.ops[0].id;
  const lines = tab.code[opId] || tab.code[Object.keys(tab.code)[0]];
  $('#code').innerHTML = lines.map((l, i) => `<span class="ln ${i === line ? 'on' : ''}">${highlight(l)}</span>`).join('');
  const op = tab.ops.find((o) => o.id === opId);
  $('#cplx').textContent = op ? op.o : '';
}

// ---------------- dibujo ----------------
function svgEl(w, h, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="${NS}"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#05d9e8"/></marker></defs>${inner}</svg>`;
}
const cls = (id, step) => (step?.hl?.includes(id) ? 'hl' : step?.cur === id ? 'cur' : '');

function drawStack(st, step) {
  const W = 360, bh = 46, H = st.cap * (bh + 6) + 70;
  let o = '';
  for (let i = 0; i < st.cap; i++) {
    const y = H - 40 - (i + 1) * (bh + 6);
    const it = st.items[i];
    o += `<rect class="box ${it ? cls(it.id, step) : 'empty'}" x="110" y="${y}" width="140" height="${bh}" rx="4"/>`;
    o += `<text class="idx" x="90" y="${y + bh / 2 + 4}">[${i}]</text>`;
    if (it) o += `<text class="val" x="180" y="${y + bh / 2}">${it.v}</text>`;
    if (i === st.items.length - 1) o += `<text class="lbl yellow" x="262" y="${y + bh / 2 + 4}">← tope</text>`;
  }
  if (!st.items.length) o += `<text class="lbl pink" x="262" y="${H - 40 + 4}">tope = -1</text>`;
  o += `<path class="edge" d="M100 ${H - 34}H260"/><text class="idx" x="180" y="${H - 12}">datos[MAX = ${st.cap}]</text>`;
  return svgEl(W, H, o);
}

function drawQueue(q, step) {
  const W = 620, H = 470, cx = 210, cy = 210, R = 150;
  let o = `<circle class="ring" cx="${cx}" cy="${cy}" r="${R}"/>`;
  for (let i = 0; i < q.cap; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / q.cap;
    const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const it = q.buf[i];
    o += `<rect class="box ${it ? cls(it.id, step) : 'empty'}" x="${x - 28}" y="${y - 22}" width="56" height="44" rx="6"/>`;
    if (it) o += `<text class="val" x="${x}" y="${y}">${it.v}</text>`;
    const lx = cx + (R + 46) * Math.cos(a), ly = cy + (R + 46) * Math.sin(a);
    o += `<text class="idx" x="${lx}" y="${ly + 4}">[${i}]</text>`;
    const tags = [];
    if (i === q.front) tags.push(['frente', 'lbl']);
    if (i === q.rear && q.count) tags.push(['fin', 'lbl pink']);
    tags.forEach(([t, c], k) => {
      const ix = cx + (R - 58 - k * 16) * Math.cos(a), iy = cy + (R - 58 - k * 16) * Math.sin(a);
      o += `<text class="${c}" x="${ix}" y="${iy + 4}" text-anchor="middle">${t}</text>`;
    });
  }
  o += `<text class="val" x="${cx}" y="${cy - 8}" style="font-size:28px">${q.count}</text><text class="idx" x="${cx}" y="${cy + 18}">en la cola</text>`;
  // vista lineal
  const arr = S.queueToArray(q);
  o += `<text class="lbl" x="420" y="60">ORDEN DE SALIDA</text>`;
  arr.forEach((v, k) => {
    o += `<rect class="box" x="430" y="${78 + k * 46}" width="80" height="38" rx="4"/><text class="val" x="470" y="${97 + k * 46}">${v}</text>`;
    if (k === 0) o += `<text class="lbl" x="520" y="${101}">← sale</text>`;
  });
  if (!arr.length) o += `<text class="idx" x="470" y="100">(vacía)</text>`;
  else o += `<text class="lbl pink" x="520" y="${101 + (arr.length - 1) * 46}">${arr.length > 1 ? '← último' : ''}</text>`;
  return svgEl(W, H, o);
}

function drawList(l, step) {
  const nodes = [...l.nodes];
  const ghost = step?.ghost;
  const bw = 92, gap = 46, W = Math.max(640, 60 + (nodes.length + 1) * (bw + gap)), H = ghost ? 260 : 200, y = 80;
  let o = `<text class="lbl yellow" x="20" y="${y + 26}">cabeza</text>`;
  if (nodes.length) o += `<path class="arrow" d="M78 ${y + 22}H${100 - 4}"/>`;
  nodes.forEach((n, i) => {
    const x = 100 + i * (bw + gap);
    o += `<rect class="box ${cls(n.id, step)}" x="${x}" y="${y}" width="${bw}" height="44" rx="5"/><path class="edge" d="M${x + 60} ${y}V${y + 44}"/>`;
    o += `<text class="val" x="${x + 30}" y="${y + 22}">${n.v}</text><circle cx="${x + 76}" cy="${y + 22}" r="4" fill="#05d9e8"/>`;
    if (i < nodes.length - 1) o += `<path class="arrow" d="M${x + 80} ${y + 22}H${x + bw + gap - 3}"/>`;
    else o += `<path class="arrow" d="M${x + 80} ${y + 22}H${x + bw + 26}"/><text class="lbl pink" x="${x + bw + 30}" y="${y + 27}">nullptr</text>`;
    if (step?.cur === n.id) o += `<text class="lbl yellow" x="${x + bw / 2}" y="${y + 70}" text-anchor="middle">▲ p</text>`;
  });
  if (!nodes.length) o += `<text class="lbl pink" x="100" y="${y + 27}">→ nullptr (lista vacía)</text>`;
  if (ghost) o += `<g class="ghostnode"><rect class="box hl" x="100" y="${y + 100}" width="${bw}" height="44" rx="5"/><text class="val" x="130" y="${y + 122}">${ghost.v}</text><text class="lbl" x="${100 + bw + 12}" y="${y + 127}">n (nuevo)</text></g>`;
  return svgEl(W, H, o);
}

function drawBst(t, step) {
  const { pos, count, depth } = S.bstLayout(t.root);
  const dx = 64, dy = 82, W = Math.max(620, (count + 1) * dx), H = Math.max(260, depth * dy + 60);
  const X = (p) => (W - count * dx) / 2 + p.x * dx + dx / 2, Y = (p) => 40 + p.y * dy;
  let o = '';
  for (const p of pos.values()) for (const c of [p.n.left, p.n.right]) if (c) { const q = pos.get(c.id); o += `<path class="edge" d="M${X(p)} ${Y(p)}L${X(q)} ${Y(q)}"/>`; }
  for (const p of pos.values()) {
    o += `<circle class="box ${cls(p.n.id, step)}" cx="${X(p)}" cy="${Y(p)}" r="24"/><text class="val" x="${X(p)}" y="${Y(p)}" style="font-size:16px">${p.n.v}</text>`;
    if (p.n === t.root) o += `<text class="lbl yellow" x="${X(p) + 30}" y="${Y(p) - 18}">raíz</text>`;
  }
  if (!t.root) o += `<text class="lbl pink" x="${W / 2}" y="120" text-anchor="middle">árbol vacío (raíz = nullptr)</text>`;
  return svgEl(W, H, o);
}

const DRAW = { stack: drawStack, queue: drawQueue, list: drawList, bst: drawBst };

function render() {
  const tab = TABS[state.tab];
  const step = state.steps[state.i];
  const st = step ? step.s : state.data[state.tab];
  $('#canvas').innerHTML = DRAW[state.tab](st, step);
  $('#title').textContent = tab.title;
  $('#info').textContent = tab.info(st);
  const m = $('#msg');
  m.className = 'msg' + (step?.ok ? ' ok' : step?.err ? ' err' : '');
  m.textContent = step ? '▶ ' + step.msg : '▶ Elige una operación';
  const out = step?.out;
  $('#out').hidden = !out; if (out) $('#out').textContent = 'salida: ' + out.join(' ');
  $('#stepn').textContent = state.steps.length ? `paso ${state.i + 1}/${state.steps.length}` : '';
  renderCode(step ? step.line : -1);
}

function renderOps() {
  const tab = TABS[state.tab];
  $('#ops').innerHTML = tab.ops.map((o) => `<button data-op="${o.id}" style="--k:var(${o.k})">${o.label}</button>`).join('');
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === state.tab));
}

// ---------------- reproductor ----------------
const delay = () => 1300 - +$('#speed').value * 115;
function stop() { state.playing = false; clearTimeout(state.timer); }
function play() {
  stop(); state.playing = true;
  const tick = () => {
    if (!state.playing) return;
    if (state.i < state.steps.length - 1) { state.i++; render(); state.timer = setTimeout(tick, delay()); }
    else state.playing = false;
  };
  state.timer = setTimeout(tick, delay());
}
function runOp(id) {
  stop();
  const tab = TABS[state.tab]; const op = tab.ops.find((o) => o.id === id);
  const v = parseInt($('#val').value, 10);
  if (Number.isNaN(v)) return;
  state.opId = id;
  const res = op.run(state.data[state.tab], v);
  state.steps = res.steps; state.i = 0;
  render(); play();
  if (['push', 'enqueue', 'pushFront', 'pushBack', 'insert'].includes(id)) $('#val').value = rnd();
}
function switchTab(t) { stop(); state.tab = t; state.steps = []; state.i = 0; state.opId = null; renderOps(); render(); }

// ---------------- eventos ----------------
$('.tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) switchTab(b.dataset.tab); });
$('#ops').addEventListener('click', (e) => { const b = e.target.closest('[data-op]'); if (b) runOp(b.dataset.op); });
$('#rand').addEventListener('click', () => { $('#val').value = rnd(); });
$('#fill').addEventListener('click', () => { stop(); state.data[state.tab] = TABS[state.tab].make(); TABS[state.tab].fill(state.data[state.tab]); state.steps = []; render(); });
$('#clear').addEventListener('click', () => { stop(); state.data[state.tab] = TABS[state.tab].make(); state.steps = []; render(); });
$('#prev').addEventListener('click', () => { stop(); if (state.i > 0) { state.i--; render(); } });
$('#next').addEventListener('click', () => { stop(); if (state.i < state.steps.length - 1) { state.i++; render(); } });
$('#play').addEventListener('click', () => { if (state.playing) stop(); else { if (state.i >= state.steps.length - 1) state.i = 0; render(); play(); } });
$('#val').addEventListener('keydown', (e) => { if (e.key === 'Enter') runOp(TABS[state.tab].ops[0].id); });
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight') $('#next').click();
  if (e.key === 'ArrowLeft') $('#prev').click();
  if (e.key === ' ') { e.preventDefault(); $('#play').click(); }
});

// inicio: cada estructura arranca con algunos datos
for (const k of Object.keys(TABS)) TABS[k].fill(state.data[k]);
const h = location.hash.slice(1); if (TABS[h]) state.tab = h;
renderOps(); render();
window.nodos = { state, runOp, switchTab };
