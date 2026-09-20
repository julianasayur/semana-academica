const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { criarServidor } = require('../index.js');
const { DatabaseSync } = require('node:sqlite');

let server;
let port;
let dbPath;

before(async () => {
  process.env.MODO_TESTE = '1';
  dbPath = './test_banco.db';
  process.env.DB_PATH = dbPath;
  server = await criarServidor(0);
  port = server.address().port;
});

after(() => {
  server.close();
  try {
    require('node:fs').unlinkSync(dbPath);
  } catch (e) {}
});

beforeEach(async () => {
  await fetch(`http://localhost:${port}/_teste/reset`, { method: 'POST' });
});

test('PATCH /atividades/:id alterando salaId, tipo ou encontros retorna 422 CAMPO_NAO_EDITAVEL (critério 13, R14)', async () => {
  const createRes = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Original',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes.status, 201);
  const atv = await createRes.json();

  const patchSala = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ salaId: 'sala-102' })
  });
  assert.strictEqual(patchSala.status, 422);
  const errSala = await patchSala.json();
  assert.strictEqual(errSala.erro, 'CAMPO_NAO_EDITAVEL');

  const patchTipo = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'minicurso' })
  });
  assert.strictEqual(patchTipo.status, 422);
  const errTipo = await patchTipo.json();
  assert.strictEqual(errTipo.erro, 'CAMPO_NAO_EDITAVEL');

  const patchEncontros = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encontros: [{ inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T13:00:00-03:00' }]
    })
  });
  assert.strictEqual(patchEncontros.status, 422);
  const errEnc = await patchEncontros.json();
  assert.strictEqual(errEnc.erro, 'CAMPO_NAO_EDITAVEL');
});

test('PATCH /atividades/:id em atividade já cancelada retorna 422 ATIVIDADE_CANCELADA (critério 15, R16)', async () => {
  const createRes = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Para Cancelar',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes.status, 201);
  const atv = await createRes.json();

  const cancelRes = await fetch(`http://localhost:${port}/atividades/${atv.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(cancelRes.status, 200);

  const patchRes = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: 'Novo Título' })
  });
  assert.strictEqual(patchRes.status, 422);
  const err = await patchRes.json();
  assert.strictEqual(err.erro, 'ATIVIDADE_CANCELADA');
});

test('POST /atividades/:id/cancelamento com relógio após ou exatamente no início do 1º encontro retorna 422 ATIVIDADE_JA_INICIADA (critérios 14, 24, R15)', async () => {
  const createRes = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Com Encontro',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes.status, 201);
  const atv = await createRes.json();

  await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
  });

  const cancelRes1 = await fetch(`http://localhost:${port}/atividades/${atv.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(cancelRes1.status, 422);
  const err1 = await cancelRes1.json();
  assert.strictEqual(err1.erro, 'ATIVIDADE_JA_INICIADA');

  const createRes2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade 2',
      tipo: 'palestra',
      salaId: 'sala-102',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T14:00:00-03:00', fim: '2026-10-19T15:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes2.status, 201);
  const atv2 = await createRes2.json();

  await fetch(`http://localhost:${port}/_teste/relogio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agora: '2026-10-19T14:00:01-03:00' })
  });

  const cancelRes2 = await fetch(`http://localhost:${port}/atividades/${atv2.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(cancelRes2.status, 422);
  const err2 = await cancelRes2.json();
  assert.strictEqual(err2.erro, 'ATIVIDADE_JA_INICIADA');
});

test('PATCH /atividades/:id reduzindo vagas abaixo do número de ocupantes atuais retorna 409 VAGAS_ABAIXO_DOS_INSCRITOS (critério 16, R17)', async () => {
  const createRes = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Com Inscritos',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes.status, 201);
  const atv = await createRes.json();

  const db = new DatabaseSync(dbPath);
  db.prepare(`
    INSERT INTO inscricoes (id, atividadeId, participanteId, status)
    VALUES ('ins_1', ?, 'p-carla', 'confirmada'),
           ('ins_2', ?, 'p-diego', 'convocada')
  `).run(atv.id, atv.id);

  const patchRes = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ vagas: 1 })
  });
  assert.strictEqual(patchRes.status, 409);
  const err = await patchRes.json();
  assert.strictEqual(err.erro, 'VAGAS_ABAIXO_DOS_INSCRITOS');

  const patchResOk = await fetch(`http://localhost:${port}/atividades/${atv.id}`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ vagas: 2 })
  });
  assert.strictEqual(patchResOk.status, 200);
  const updated = await patchResOk.json();
  assert.strictEqual(updated.vagas, 2);
  assert.strictEqual(updated.ocupadas, 2);
});

test('POST /atividades/:id/cancelamento ignora corpo de requisição enviado (R20)', async () => {
  const createRes = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Para Cancelar Com Corpo',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 30,
      encontros: [
        { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(createRes.status, 201);
  const atv = await createRes.json();

  const cancelRes = await fetch(`http://localhost:${port}/atividades/${atv.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo: 'Qualquer' })
  });
  assert.strictEqual(cancelRes.status, 200);
  const body = await cancelRes.json();
  assert.strictEqual(body.situacao, 'cancelada');
});
