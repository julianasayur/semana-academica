const { test, before, after } = require('node:test');
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

test('POST /_teste/reset deve resetar o sistema', async () => {
  const res = await fetch(`http://localhost:${port}/_teste/reset`, { method: 'POST' });
  assert.strictEqual(res.status, 204);
});

test('GET /_teste/relogio deve retornar o relógio', async () => {
  const res = await fetch(`http://localhost:${port}/_teste/relogio`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.ok(body.agora);
});

test('PUT /_teste/relogio deve atualizar o relógio', async () => {
  const novoRelogio = '2026-10-14T09:00:00-03:00';
  const res = await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: novoRelogio })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.agora, novoRelogio);
});
