// Lógica pura de las estructuras. Cada operación devuelve una lista de PASOS:
// { s: foto del estado, hl: [ids resaltados], cur: id actual, line: línea del código C++, msg: texto }
// Así la interfaz puede animar paso a paso y las pruebas pueden revisar el resultado final.

let nextId = 1;
export const newId = () => nextId++;
const snap = (x) => structuredClone(x);

// ============ PILA (arreglo de capacidad fija) ============
export const STACK_CODE = {
  push: ['void push(int x) {', '  if (tope == MAX - 1) { cout << "Pila llena"; return; }', '  tope++;', '  datos[tope] = x;', '}'],
  pop: ['int pop() {', '  if (tope == -1) { cout << "Pila vacía"; return -1; }', '  int x = datos[tope];', '  tope--;', '  return x;', '}'],
  peek: ['int cima() {', '  if (tope == -1) return -1;', '  return datos[tope];', '}'],
};
export function stackNew(cap = 8) { return { items: [], cap }; }
export function stackPush(st, v) {
  const steps = [{ s: snap(st), line: 0, msg: `push(${v})` }];
  if (st.items.length >= st.cap) { steps.push({ s: snap(st), line: 1, msg: 'Pila llena: no entra', err: true }); return { st, steps }; }
  steps.push({ s: snap(st), line: 2, msg: `tope pasa a ${st.items.length}` });
  const id = newId(); st.items.push({ id, v });
  steps.push({ s: snap(st), line: 3, hl: [id], msg: `datos[${st.items.length - 1}] = ${v}`, ok: true });
  return { st, steps };
}
export function stackPop(st) {
  const steps = [{ s: snap(st), line: 0, msg: 'pop()' }];
  if (!st.items.length) { steps.push({ s: snap(st), line: 1, msg: 'Pila vacía', err: true }); return { st, steps, out: null }; }
  const top = st.items[st.items.length - 1];
  steps.push({ s: snap(st), line: 2, hl: [top.id], msg: `x = ${top.v}` });
  st.items.pop();
  steps.push({ s: snap(st), line: 3, msg: `tope baja a ${st.items.length - 1}` });
  steps.push({ s: snap(st), line: 4, msg: `devuelve ${top.v}`, ok: true });
  return { st, steps, out: top.v };
}
export function stackPeek(st) {
  const steps = [{ s: snap(st), line: 0, msg: 'cima()' }];
  if (!st.items.length) { steps.push({ s: snap(st), line: 1, msg: 'Pila vacía', err: true }); return { st, steps, out: null }; }
  const top = st.items[st.items.length - 1];
  steps.push({ s: snap(st), line: 2, hl: [top.id], msg: `la cima es ${top.v}`, ok: true });
  return { st, steps, out: top.v };
}

// ============ COLA CIRCULAR ============
export const QUEUE_CODE = {
  enqueue: ['void encolar(int x) {', '  if (cant == MAX) { cout << "Cola llena"; return; }', '  fin = (fin + 1) % MAX;', '  datos[fin] = x;', '  cant++;', '}'],
  dequeue: ['int desencolar() {', '  if (cant == 0) { cout << "Cola vacía"; return -1; }', '  int x = datos[frente];', '  frente = (frente + 1) % MAX;', '  cant--;', '  return x;', '}'],
};
export function queueNew(cap = 8) { return { buf: Array(cap).fill(null), front: 0, rear: cap - 1, count: 0, cap }; }
export function queueEnqueue(q, v) {
  const steps = [{ s: snap(q), line: 0, msg: `encolar(${v})` }];
  if (q.count === q.cap) { steps.push({ s: snap(q), line: 1, msg: 'Cola llena', err: true }); return { st: q, steps }; }
  q.rear = (q.rear + 1) % q.cap;
  steps.push({ s: snap(q), line: 2, msg: `fin = ${q.rear}${q.rear === 0 && q.count ? ' (da la vuelta)' : ''}` });
  const id = newId(); q.buf[q.rear] = { id, v };
  steps.push({ s: snap(q), line: 3, hl: [id], msg: `datos[${q.rear}] = ${v}` });
  q.count++;
  steps.push({ s: snap(q), line: 4, hl: [id], msg: `cant = ${q.count}`, ok: true });
  return { st: q, steps };
}
export function queueDequeue(q) {
  const steps = [{ s: snap(q), line: 0, msg: 'desencolar()' }];
  if (!q.count) { steps.push({ s: snap(q), line: 1, msg: 'Cola vacía', err: true }); return { st: q, steps, out: null }; }
  const it = q.buf[q.front];
  steps.push({ s: snap(q), line: 2, hl: [it.id], msg: `x = ${it.v}` });
  q.buf[q.front] = null; q.front = (q.front + 1) % q.cap;
  steps.push({ s: snap(q), line: 3, msg: `frente = ${q.front}` });
  q.count--;
  steps.push({ s: snap(q), line: 4, msg: `cant = ${q.count}` });
  steps.push({ s: snap(q), line: 5, msg: `devuelve ${it.v}`, ok: true });
  return { st: q, steps, out: it.v };
}
export const queueToArray = (q) => Array.from({ length: q.count }, (_, i) => q.buf[(q.front + i) % q.cap].v);

// ============ LISTA ENLAZADA SIMPLE ============
export const LIST_CODE = {
  pushFront: ['void insertarInicio(int x) {', '  Nodo* n = new Nodo{x, nullptr};', '  n->sig = cabeza;', '  cabeza = n;', '}'],
  pushBack: ['void insertarFinal(int x) {', '  Nodo* n = new Nodo{x, nullptr};', '  if (!cabeza) { cabeza = n; return; }', '  Nodo* p = cabeza;', '  while (p->sig) p = p->sig;', '  p->sig = n;', '}'],
  remove: ['void eliminar(int x) {', '  Nodo* p = cabeza; Nodo* ant = nullptr;', '  while (p && p->dato != x) { ant = p; p = p->sig; }', '  if (!p) { cout << "No está"; return; }', '  if (!ant) cabeza = p->sig;', '  else ant->sig = p->sig;', '  delete p;', '}'],
  search: ['bool buscar(int x) {', '  Nodo* p = cabeza;', '  while (p) {', '    if (p->dato == x) return true;', '    p = p->sig;', '  }', '  return false;', '}'],
  reverse: ['void invertir() {', '  Nodo *ant = nullptr, *p = cabeza;', '  while (p) {', '    Nodo* sig = p->sig;', '    p->sig = ant; ant = p; p = sig;', '  }', '  cabeza = ant;', '}'],
};
export function listNew() { return { nodes: [] }; }
export function listPushFront(l, v) {
  const steps = [{ s: snap(l), line: 0, msg: `insertarInicio(${v})` }];
  const id = newId();
  steps.push({ s: snap(l), line: 1, msg: `nuevo nodo ${v}`, ghost: { id, v } });
  l.nodes.unshift({ id, v });
  steps.push({ s: snap(l), line: 2, hl: [id], msg: 'n->sig apunta a la cabeza' });
  steps.push({ s: snap(l), line: 3, hl: [id], msg: `cabeza = ${v}`, ok: true });
  return { st: l, steps };
}
export function listPushBack(l, v) {
  const steps = [{ s: snap(l), line: 0, msg: `insertarFinal(${v})` }];
  const id = newId();
  steps.push({ s: snap(l), line: 1, msg: `nuevo nodo ${v}`, ghost: { id, v } });
  if (!l.nodes.length) { l.nodes.push({ id, v }); steps.push({ s: snap(l), line: 2, hl: [id], msg: 'lista vacía: cabeza = n', ok: true }); return { st: l, steps }; }
  steps.push({ s: snap(l), line: 3, cur: l.nodes[0].id, msg: 'p = cabeza', ghost: { id, v } });
  for (let i = 1; i < l.nodes.length; i++) steps.push({ s: snap(l), line: 4, cur: l.nodes[i].id, msg: `p avanza a ${l.nodes[i].v}`, ghost: { id, v } });
  l.nodes.push({ id, v });
  steps.push({ s: snap(l), line: 5, hl: [id], msg: `el último apunta a ${v}`, ok: true });
  return { st: l, steps };
}
export function listSearch(l, v) {
  const steps = [{ s: snap(l), line: 0, msg: `buscar(${v})` }, { s: snap(l), line: 1, cur: l.nodes[0]?.id, msg: 'p = cabeza' }];
  for (const n of l.nodes) {
    steps.push({ s: snap(l), line: 3, cur: n.id, msg: `¿${n.v} == ${v}?` });
    if (n.v === v) { steps.push({ s: snap(l), line: 3, hl: [n.id], msg: `¡Encontrado ${v}!`, ok: true }); return { st: l, steps, out: true }; }
    steps.push({ s: snap(l), line: 4, cur: n.id, msg: 'p = p->sig' });
  }
  steps.push({ s: snap(l), line: 6, msg: `${v} no está`, err: true });
  return { st: l, steps, out: false };
}
export function listRemove(l, v) {
  const steps = [{ s: snap(l), line: 0, msg: `eliminar(${v})` }, { s: snap(l), line: 1, cur: l.nodes[0]?.id, msg: 'p = cabeza, ant = nulo' }];
  const i = l.nodes.findIndex((n) => n.v === v);
  const upto = i === -1 ? l.nodes.length : i;
  for (let k = 0; k < upto; k++) steps.push({ s: snap(l), line: 2, cur: l.nodes[k].id, msg: `${l.nodes[k].v} ≠ ${v}: avanzar` });
  if (i === -1) { steps.push({ s: snap(l), line: 3, msg: `${v} no está`, err: true }); return { st: l, steps }; }
  const target = l.nodes[i];
  steps.push({ s: snap(l), line: i === 0 ? 4 : 5, hl: [target.id], msg: i === 0 ? 'era la cabeza: cabeza = p->sig' : `${l.nodes[i - 1].v} salta a ${l.nodes[i + 1]?.v ?? 'nulo'}` });
  l.nodes.splice(i, 1);
  steps.push({ s: snap(l), line: 6, msg: `delete ${v}`, ok: true });
  return { st: l, steps };
}
export function listReverse(l) {
  const steps = [{ s: snap(l), line: 0, msg: 'invertir()' }, { s: snap(l), line: 1, cur: l.nodes[0]?.id, msg: 'ant = nulo, p = cabeza' }];
  const n = l.nodes.length;
  for (let k = 0; k < n; k++) {
    // los primeros k ya están invertidos: mostramos el progreso reordenando
    steps.push({ s: snap(l), line: 4, cur: l.nodes[k].id, msg: `${l.nodes[k].v} ahora apunta a ${k ? l.nodes[k - 1].v : 'nulo'}` });
  }
  l.nodes.reverse();
  steps.push({ s: snap(l), line: 6, msg: 'cabeza = ant: lista invertida', ok: true });
  return { st: l, steps };
}
export const listToArray = (l) => l.nodes.map((n) => n.v);

// ============ ÁRBOL BINARIO DE BÚSQUEDA ============
export const BST_CODE = {
  insert: ['Nodo* insertar(Nodo* r, int x) {', '  if (!r) return new Nodo{x};', '  if (x < r->dato) r->izq = insertar(r->izq, x);', '  else if (x > r->dato) r->der = insertar(r->der, x);', '  return r;   // repetido: no se inserta', '}'],
  search: ['bool buscar(Nodo* r, int x) {', '  if (!r) return false;', '  if (x == r->dato) return true;', '  if (x < r->dato) return buscar(r->izq, x);', '  return buscar(r->der, x);', '}'],
  remove: ['Nodo* eliminar(Nodo* r, int x) {', '  if (!r) return r;', '  if (x < r->dato) r->izq = eliminar(r->izq, x);', '  else if (x > r->dato) r->der = eliminar(r->der, x);', '  else {', '    if (!r->izq) return r->der;   // 0 o 1 hijo', '    if (!r->der) return r->izq;', '    Nodo* s = minimo(r->der);      // 2 hijos: sucesor', '    r->dato = s->dato;', '    r->der = eliminar(r->der, s->dato);', '  }', '  return r;', '}'],
  inorder: ['void inorden(Nodo* r) {', '  if (!r) return;', '  inorden(r->izq);', '  cout << r->dato << " ";', '  inorden(r->der);', '}'],
  preorder: ['void preorden(Nodo* r) {', '  if (!r) return;', '  cout << r->dato << " ";', '  preorden(r->izq);', '  preorden(r->der);', '}'],
  postorder: ['void postorden(Nodo* r) {', '  if (!r) return;', '  postorden(r->izq);', '  postorden(r->der);', '  cout << r->dato << " ";', '}'],
};
export function bstNew() { return { root: null }; }
export function bstInsert(t, v) {
  const steps = [{ s: snap(t), line: 0, msg: `insertar(${v})` }];
  if (!t.root) { t.root = { id: newId(), v, left: null, right: null }; steps.push({ s: snap(t), line: 1, hl: [t.root.id], msg: `árbol vacío: ${v} es la raíz`, ok: true }); return { st: t, steps }; }
  let p = t.root;
  for (;;) {
    if (v === p.v) { steps.push({ s: snap(t), line: 4, cur: p.id, msg: `${v} ya está: no se repite`, err: true }); return { st: t, steps }; }
    const side = v < p.v ? 'left' : 'right';
    steps.push({ s: snap(t), line: v < p.v ? 2 : 3, cur: p.id, msg: `${v} ${v < p.v ? '<' : '>'} ${p.v}: ir a la ${v < p.v ? 'izquierda' : 'derecha'}` });
    if (!p[side]) { p[side] = { id: newId(), v, left: null, right: null }; steps.push({ s: snap(t), line: 1, hl: [p[side].id], msg: `lugar libre: ${v} entra aquí`, ok: true }); return { st: t, steps }; }
    p = p[side];
  }
}
export function bstSearch(t, v) {
  const steps = [{ s: snap(t), line: 0, msg: `buscar(${v})` }];
  let p = t.root;
  while (p) {
    if (v === p.v) { steps.push({ s: snap(t), line: 2, hl: [p.id], msg: `¡Encontrado ${v}!`, ok: true }); return { st: t, steps, out: true }; }
    steps.push({ s: snap(t), line: v < p.v ? 3 : 4, cur: p.id, msg: `${v} ${v < p.v ? '<' : '>'} ${p.v}` });
    p = v < p.v ? p.left : p.right;
  }
  steps.push({ s: snap(t), line: 1, msg: `${v} no está`, err: true });
  return { st: t, steps, out: false };
}
export function bstRemove(t, v) {
  const steps = [{ s: snap(t), line: 0, msg: `eliminar(${v})` }];
  let parent = null, p = t.root;
  while (p && p.v !== v) { steps.push({ s: snap(t), line: v < p.v ? 2 : 3, cur: p.id, msg: `${v} ${v < p.v ? '<' : '>'} ${p.v}` }); parent = p; p = v < p.v ? p.left : p.right; }
  if (!p) { steps.push({ s: snap(t), line: 1, msg: `${v} no está`, err: true }); return { st: t, steps }; }
  const replace = (node, child) => { if (!parent) t.root = child; else if (parent.left === node) parent.left = child; else parent.right = child; };
  if (!p.left || !p.right) {
    steps.push({ s: snap(t), line: p.left ? 6 : 5, hl: [p.id], msg: p.left || p.right ? `${v} tiene 1 hijo: el hijo sube` : `${v} es hoja: se borra` });
    replace(p, p.left || p.right);
    steps.push({ s: snap(t), line: 11, msg: `${v} eliminado`, ok: true });
    return { st: t, steps };
  }
  let sp = p, s = p.right;
  steps.push({ s: snap(t), line: 7, hl: [p.id], cur: s.id, msg: `${v} tiene 2 hijos: busco el menor de la derecha` });
  while (s.left) { sp = s; s = s.left; steps.push({ s: snap(t), line: 7, hl: [p.id], cur: s.id, msg: `bajo a ${s.v}` }); }
  steps.push({ s: snap(t), line: 8, hl: [p.id, s.id], msg: `${v} se reemplaza por ${s.v}` });
  p.v = s.v;
  if (sp === p) sp.right = s.right; else sp.left = s.right;
  steps.push({ s: snap(t), line: 9, hl: [p.id], msg: `se borra el ${s.v} repetido`, ok: true });
  return { st: t, steps };
}
export function bstTraverse(t, kind) {
  const code = { inorder: [2, 3, 4], preorder: [3, 2, 4], postorder: [2, 3, 4] }[kind];
  const steps = [{ s: snap(t), line: 0, msg: `${kind}()` }];
  const out = [];
  const visitLine = kind === 'preorder' ? 2 : kind === 'inorder' ? 3 : 4;
  const go = (n) => {
    if (!n) return;
    if (kind === 'preorder') { out.push(n.v); steps.push({ s: snap(t), line: visitLine, hl: [n.id], msg: `visito ${n.v}`, out: [...out] }); }
    go(n.left);
    if (kind === 'inorder') { out.push(n.v); steps.push({ s: snap(t), line: visitLine, hl: [n.id], msg: `visito ${n.v}`, out: [...out] }); }
    go(n.right);
    if (kind === 'postorder') { out.push(n.v); steps.push({ s: snap(t), line: visitLine, hl: [n.id], msg: `visito ${n.v}`, out: [...out] }); }
  };
  void code;
  go(t.root);
  steps.push({ s: snap(t), line: 5, msg: out.join(' ') || 'árbol vacío', ok: true, out });
  return { st: t, steps, out };
}
export function bstHeight(n) { return n ? 1 + Math.max(bstHeight(n.left), bstHeight(n.right)) : 0; }
export function bstInorder(t) { const o = []; const go = (n) => { if (!n) return; go(n.left); o.push(n.v); go(n.right); }; go(t.root); return o; }

// Posiciones para dibujar el árbol (x por orden inorden, y por nivel)
export function bstLayout(root) {
  const pos = new Map(); let i = 0;
  const go = (n, d) => { if (!n) return; go(n.left, d + 1); pos.set(n.id, { x: i++, y: d, n }); go(n.right, d + 1); };
  go(root, 0);
  return { pos, count: i, depth: bstHeight(root) };
}
