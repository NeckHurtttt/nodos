import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../js/structures.js';

test('pila: LIFO, llena y vacía', () => {
  const st = S.stackNew(3);
  for (const v of [1, 2, 3, 4]) S.stackPush(st, v);
  assert.deepEqual(st.items.map((i) => i.v), [1, 2, 3]);
  assert.equal(S.stackPeek(st).out, 3);
  assert.equal(S.stackPop(st).out, 3);
  assert.equal(S.stackPop(st).out, 2);
  assert.equal(S.stackPop(st).out, 1);
  const r = S.stackPop(st);
  assert.equal(r.out, null);
  assert.ok(r.steps.at(-1).err);
});

test('cola circular: FIFO y vuelta del índice', () => {
  const q = S.queueNew(4);
  for (const v of [1, 2, 3]) S.queueEnqueue(q, v);
  assert.equal(S.queueDequeue(q).out, 1);
  assert.equal(S.queueDequeue(q).out, 2);
  for (const v of [4, 5, 6]) S.queueEnqueue(q, v); // fin da la vuelta
  assert.deepEqual(S.queueToArray(q), [3, 4, 5, 6]);
  assert.equal(q.rear, 1);
  assert.ok(S.queueEnqueue(q, 7).steps.at(-1).err); // llena
  for (const v of [3, 4, 5, 6]) assert.equal(S.queueDequeue(q).out, v);
  assert.equal(S.queueDequeue(q).out, null);
});

test('lista: insertar, buscar, eliminar e invertir', () => {
  const l = S.listNew();
  S.listPushBack(l, 2); S.listPushBack(l, 3); S.listPushFront(l, 1);
  assert.deepEqual(S.listToArray(l), [1, 2, 3]);
  assert.equal(S.listSearch(l, 3).out, true);
  assert.equal(S.listSearch(l, 9).out, false);
  S.listRemove(l, 2); assert.deepEqual(S.listToArray(l), [1, 3]);
  S.listRemove(l, 1); assert.deepEqual(S.listToArray(l), [3]);
  S.listRemove(l, 9); assert.deepEqual(S.listToArray(l), [3]);
  S.listPushBack(l, 4); S.listPushBack(l, 5); S.listReverse(l);
  assert.deepEqual(S.listToArray(l), [5, 4, 3]);
});

test('ABB: inorden ordenado, sin repetidos, buscar', () => {
  const t = S.bstNew();
  for (const v of [50, 30, 70, 20, 40, 60, 80, 40]) S.bstInsert(t, v);
  assert.deepEqual(S.bstInorder(t), [20, 30, 40, 50, 60, 70, 80]);
  assert.equal(S.bstSearch(t, 60).out, true);
  assert.equal(S.bstSearch(t, 65).out, false);
  assert.equal(S.bstHeight(t.root), 3);
});

test('ABB: eliminar hoja, nodo con 1 hijo y con 2 hijos (y la raíz)', () => {
  const t = S.bstNew();
  for (const v of [50, 30, 70, 20, 40, 60, 80, 35]) S.bstInsert(t, v);
  S.bstRemove(t, 20); assert.deepEqual(S.bstInorder(t), [30, 35, 40, 50, 60, 70, 80]);
  S.bstRemove(t, 40); assert.deepEqual(S.bstInorder(t), [30, 35, 50, 60, 70, 80]);
  S.bstRemove(t, 50); assert.deepEqual(S.bstInorder(t), [30, 35, 60, 70, 80]);
  assert.equal(t.root.v, 60);
  S.bstRemove(t, 99); assert.equal(S.bstInorder(t).length, 5);
});

test('recorridos', () => {
  const t = S.bstNew();
  for (const v of [50, 30, 70, 20, 40]) S.bstInsert(t, v);
  assert.deepEqual(S.bstTraverse(t, 'inorder').out, [20, 30, 40, 50, 70]);
  assert.deepEqual(S.bstTraverse(t, 'preorder').out, [50, 30, 20, 40, 70]);
  assert.deepEqual(S.bstTraverse(t, 'postorder').out, [20, 40, 30, 70, 50]);
});

test('cada paso apunta a una línea de código que existe', () => {
  const st = S.stackNew(); const t = S.bstNew();
  const runs = [
    [S.STACK_CODE.push, S.stackPush(st, 1).steps], [S.STACK_CODE.pop, S.stackPop(st).steps],
    [S.BST_CODE.insert, S.bstInsert(t, 5).steps], [S.BST_CODE.insert, S.bstInsert(t, 3).steps],
  ];
  for (const [code, steps] of runs) for (const s of steps) assert.ok(s.line >= 0 && s.line < code.length);
});
