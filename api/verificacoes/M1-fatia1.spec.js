const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { criarServidor } = require('../index.js');

let server;
let port;

before(async () => {
  process.env.MODO_TESTE = '1';
  process.env.DB_PATH = ':memory:';
  server = await criarServidor(0);
  port = server.address().port;
});

after(() => {
  server.close();
});

beforeEach(async () => {
  await fetch(`http://localhost:${port}/_teste/reset`, { method: 'POST' });
});

test('GET /salas sem X-Usuario -> 401', async () => {
  const res = await fetch(`http://localhost:${port}/salas`);
  assert.strictEqual(res.status, 401);
  const body = await res.json();
  assert.strictEqual(body.erro, 'USUARIO_DESCONHECIDO');
});

test('GET /salas com X-Usuario inválido -> 401', async () => {
  const res = await fetch(`http://localhost:${port}/salas`, {
    headers: { 'X-Usuario': 'nao-existe' }
  });
  assert.strictEqual(res.status, 401);
  const body = await res.json();
  assert.strictEqual(body.erro, 'USUARIO_DESCONHECIDO');
});

test('GET /salas com X-Usuario válido -> 200', async () => {
  const res = await fetch(`http://localhost:${port}/salas`, {
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.strictEqual(body.length, 4); // Deve retornar as 4 salas iniciais
});

test('GET /atividades/:id sem X-Usuario -> 401', async () => {
  const res = await fetch(`http://localhost:${port}/atividades/atv_inexistente`);
  assert.strictEqual(res.status, 401);
  const body = await res.json();
  assert.strictEqual(body.erro, 'USUARIO_DESCONHECIDO');
});

test('GET /atividades/:id com ID inexistente -> 404', async () => {
  const res = await fetch(`http://localhost:${port}/atividades/atv_inexistente`, {
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.erro, 'NAO_ENCONTRADO');
});
