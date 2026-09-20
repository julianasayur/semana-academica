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

test('GET /atividades com filtros ?dia=2026-10-19&tipo=minicurso retorna apenas minicursos do dia especificado (critério 18)', async () => {
  // Cria um minicurso no dia 19/10/2026
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Minicurso de Flutter',
      tipo: 'minicurso',
      salaId: 'lab-3',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-19T14:00:00-03:00', fim: '2026-10-19T16:00:00-03:00' },
        { inicio: '2026-10-20T14:00:00-03:00', fim: '2026-10-20T16:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res1.status, 201);

  // Cria uma palestra no dia 19/10/2026
  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Palestra de Abertura',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 100,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res2.status, 201);

  // Cria um minicurso no dia 21/10/2026
  const res3 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Minicurso Avançado',
      tipo: 'minicurso',
      salaId: 'lab-3',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-21T14:00:00-03:00', fim: '2026-10-21T16:00:00-03:00' },
        { inicio: '2026-10-22T14:00:00-03:00', fim: '2026-10-22T16:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res3.status, 201);

  // Consulta com filtros ?dia=2026-10-19&tipo=minicurso
  const listRes = await fetch(`http://localhost:${port}/atividades?dia=2026-10-19&tipo=minicurso`, {
    headers: { 'X-Usuario': 'p-carla' }
  });
  assert.strictEqual(listRes.status, 200);
  const atividades = await listRes.json();
  assert.strictEqual(atividades.length, 1);
  assert.strictEqual(atividades[0].titulo, 'Minicurso de Flutter');
  assert.strictEqual(atividades[0].tipo, 'minicurso');
});

test('GET /atividades?dia=2026-10-20 inclui encontro das 21:00 às 22:30 (critério 23)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Palestra Noturna',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 50,
      encontros: [
        { inicio: '2026-10-20T21:00:00-03:00', fim: '2026-10-20T22:30:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 201);

  const listRes = await fetch(`http://localhost:${port}/atividades?dia=2026-10-20`, {
    headers: { 'X-Usuario': 'p-carla' }
  });
  assert.strictEqual(listRes.status, 200);
  const atividades = await listRes.json();
  assert.strictEqual(atividades.length, 1);
  assert.strictEqual(atividades[0].titulo, 'Palestra Noturna');
});

test('Atividade cancelada aparece em GET /atividades com situação cancelada (critério 25)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade para Cancelar',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 50,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 201);
  const atv = await res.json();

  const cancelRes = await fetch(`http://localhost:${port}/atividades/${atv.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(cancelRes.status, 200);

  const listRes = await fetch(`http://localhost:${port}/atividades`, {
    headers: { 'X-Usuario': 'p-carla' }
  });
  assert.strictEqual(listRes.status, 200);
  const atividades = await listRes.json();
  const encontrada = atividades.find(a => a.id === atv.id);
  assert.ok(encontrada);
  assert.strictEqual(encontrada.situacao, 'cancelada');
});

test('Situação da atividade muda conforme o relógio de teste (prevista, em_andamento, encerrada) (critério 19, 26, R23)', async () => {
  // Cria atividade das 10:00 às 12:00 do dia 19/10/2026
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Relógio',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 50,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 201);
  const atv = await res.json();

  // Relógio antes do início: prevista
  await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: '2026-10-19T09:59:59-03:00' })
  });

  let getRes = await fetch(`http://localhost:${port}/atividades/${atv.id}`, { headers: { 'X-Usuario': 'p-carla' } });
  let body = await getRes.json();
  assert.strictEqual(body.situacao, 'prevista');

  // Relógio exatamente no início: em_andamento
  await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
  });
  getRes = await fetch(`http://localhost:${port}/atividades/${atv.id}`, { headers: { 'X-Usuario': 'p-carla' } });
  body = await getRes.json();
  assert.strictEqual(body.situacao, 'em_andamento');

  // Relógio exatamente no fim: encerrada (critério 26)
  await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: '2026-10-19T12:00:00-03:00' })
  });
  getRes = await fetch(`http://localhost:${port}/atividades/${atv.id}`, { headers: { 'X-Usuario': 'p-carla' } });
  body = await getRes.json();
  assert.strictEqual(body.situacao, 'encerrada');
});

test('GET /atividades ordena por início do 1º encontro e depois por título em ordem alfabética (R22)', async () => {
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Zebra',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{ inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }]
    })
  });
  assert.strictEqual(res1.status, 201);

  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Aardvark',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 10,
      encontros: [{ inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }]
    })
  });
  assert.strictEqual(res2.status, 201);

  const res3 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Primeira',
      tipo: 'palestra',
      salaId: 'sala-102',
      vagas: 10,
      encontros: [{ inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T09:00:00-03:00' }]
    })
  });
  assert.strictEqual(res3.status, 201);

  const res = await fetch(`http://localhost:${port}/atividades`, {
    headers: { 'X-Usuario': 'p-carla' }
  });
  assert.strictEqual(res.status, 200);
  const lista = await res.json();
  
  assert.strictEqual(lista[0].titulo, 'Primeira');
  assert.strictEqual(lista[1].titulo, 'Aardvark'); // Empate no horário (10:00), ordem alfabética
  assert.strictEqual(lista[2].titulo, 'Zebra');
});

