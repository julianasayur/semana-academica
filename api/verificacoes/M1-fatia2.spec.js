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

test('POST /atividades por usuário com papel participante -> 403 SOMENTE_ORGANIZACAO', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'p-carla',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra de Teste',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 403, JSON.stringify(await res.json()));
});

test('POST /atividades com encontro durando 5 horas -> 422 ENCONTRO_INVALIDO', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra de Teste',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T14:00:00-03:00' // 5 hours
      }]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'ENCONTRO_INVALIDO');
});

test('POST /atividades com palestra tendo 2 encontros -> 422 QUANTIDADE_DE_ENCONTROS', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra com 2 encontros',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' },
        { inicio: '2026-10-20T09:00:00-03:00', fim: '2026-10-20T10:00:00-03:00' }
      ]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'QUANTIDADE_DE_ENCONTROS');
});

test('POST /atividades com titulo vazio -> 422 DADOS_INVALIDOS', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: '',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'DADOS_INVALIDOS');
});

test('POST /atividades com usuário inexistente -> 401 USUARIO_DESCONHECIDO', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'nao-existe',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra de Teste',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 401);
  const body = await res.json();
  assert.strictEqual(body.erro, 'USUARIO_DESCONHECIDO');
});
