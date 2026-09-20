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

test('POST /atividades com minicurso tendo 1 encontro e 6 encontros -> 422 QUANTIDADE_DE_ENCONTROS', async () => {
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Minicurso com 1 encontro',
      tipo: 'minicurso',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res1.status, 422);
  const body1 = await res1.json();
  assert.strictEqual(body1.erro, 'QUANTIDADE_DE_ENCONTROS');

  const res6 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Minicurso com 6 encontros',
      tipo: 'minicurso',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' },
        { inicio: '2026-10-20T09:00:00-03:00', fim: '2026-10-20T10:00:00-03:00' },
        { inicio: '2026-10-21T09:00:00-03:00', fim: '2026-10-21T10:00:00-03:00' },
        { inicio: '2026-10-22T09:00:00-03:00', fim: '2026-10-22T10:00:00-03:00' },
        { inicio: '2026-10-23T09:00:00-03:00', fim: '2026-10-23T10:00:00-03:00' },
        { inicio: '2026-10-23T11:00:00-03:00', fim: '2026-10-23T12:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res6.status, 422);
  const body6 = await res6.json();
  assert.strictEqual(body6.erro, 'QUANTIDADE_DE_ENCONTROS');
});

test('POST /atividades com salaId inexistente (critério 11) -> 422 DADOS_INVALIDOS (R12)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra Sala Inexistente',
      tipo: 'palestra',
      salaId: 'sala-fantasma',
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

test('R6: precedência de erros: 403 (perfil) tem prioridade sobre 404 (existência) e 422 (corpo)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades/atv_inexistente`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'p-carla', 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: '' })
  });
  assert.strictEqual(res.status, 403);
  const body = await res.json();
  assert.strictEqual(body.erro, 'SOMENTE_ORGANIZACAO');
});

test('R6: precedência de erros: 404 (existência) tem prioridade sobre 422 (corpo)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades/atv_inexistente`, {
    method: 'PATCH',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: '' })
  });
  assert.strictEqual(res.status, 404);
  const body = await res.json();
  assert.strictEqual(body.erro, 'NAO_ENCONTRADO');
});

test('POST /atividades com sucesso -> 201 Atividade (R18, R19)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra de Sucesso',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 201);
  const atv = await res.json();
  
  assert.ok(atv.id.startsWith('atv_'), 'id deve começar com atv_');
  assert.strictEqual(atv.titulo, 'Palestra de Sucesso');
  assert.strictEqual(atv.tipo, 'palestra');
  assert.strictEqual(atv.salaId, 'auditorio');
  assert.strictEqual(atv.vagas, 10);
  assert.strictEqual(atv.encontros.length, 1);
  assert.ok(atv.encontros[0].id.startsWith('enc_'), 'id do encontro deve começar com enc_');
  assert.strictEqual(atv.cargaHorariaMinutos, 60, 'carga horária deve ser 60 minutos');
  assert.strictEqual(atv.situacao, 'prevista');
});

test('POST /atividades enviando cargaHorariaMinutos no corpo confere que o valor é ignorado (R18)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra Carga Horaria Enviada',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      cargaHorariaMinutos: 9999,
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 201);
  const atv = await res.json();
  assert.strictEqual(atv.cargaHorariaMinutos, 60, 'carga horária calculada deve ser 60 minutos, ignorando o valor enviado');
});

test('R19: id do encontro bate com o formato enc_ + 8 hexadecimais minúsculos e unicidade', async () => {
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Formato ID 1',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{ inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }]
    })
  });
  assert.strictEqual(res1.status, 201);
  const atv1 = await res1.json();
  const id1 = atv1.encontros[0].id;

  assert.match(id1, /^enc_[0-9a-f]{8}$/);

  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Formato ID 2',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 10,
      encontros: [{ inicio: '2026-10-19T11:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }]
    })
  });
  assert.strictEqual(res2.status, 201);
  const atv2 = await res2.json();
  const id2 = atv2.encontros[0].id;

  assert.match(id2, /^enc_[0-9a-f]{8}$/);
  assert.notStrictEqual(id1, id2, 'IDs de encontros devem ser únicos globalmente');
});

test('POST /atividades com campo obrigatório ausente -> 422 DADOS_INVALIDOS (R5)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra Sem Tipo',
      // tipo ausente
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

test('POST /atividades com corpo não-JSON e campo com tipo errado -> 422 DADOS_INVALIDOS (R5)', async () => {
  const resText = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'text/plain'
    },
    body: 'isto nao e json'
  });
  assert.strictEqual(resText.status, 422);
  const bodyText = await resText.json();
  assert.strictEqual(bodyText.erro, 'DADOS_INVALIDOS');

  const resBadJson = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: '{ "titulo": "teste", malformado }'
  });
  assert.strictEqual(resBadJson.status, 422);
  const bodyBadJson = await resBadJson.json();
  assert.strictEqual(bodyBadJson.erro, 'DADOS_INVALIDOS');

  const resTipo = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra Tipo Errado',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 'dez',
      encontros: [{
        inicio: '2026-10-19T09:00:00-03:00',
        fim: '2026-10-19T10:00:00-03:00'
      }]
    })
  });
  assert.strictEqual(resTipo.status, 422);
  const bodyTipo = await resTipo.json();
  assert.strictEqual(bodyTipo.erro, 'DADOS_INVALIDOS');
});

test('POST /atividades com encontro atravessando a meia-noite (critério 22) -> 422 ENCONTRO_INVALIDO (R8)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Palestra da Meia-Noite',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [{
        inicio: '2026-10-19T23:00:00-03:00',
        fim: '2026-10-20T00:30:00-03:00'
      }]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'ENCONTRO_INVALIDO');
});

test('POST /atividades com vagas superior à capacidade da sala (critério 10) -> 422 VAGAS_ACIMA_DA_CAPACIDADE (R11)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Minicurso Lotação',
      tipo: 'minicurso',
      salaId: 'sala-101', // capacidade 40
      vagas: 50,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' },
        { inicio: '2026-10-20T09:00:00-03:00', fim: '2026-10-20T11:00:00-03:00' }
      ]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'VAGAS_ACIMA_DA_CAPACIDADE');
});

test('POST /atividades com dois encontros da mesma atividade sobrepostos no tempo (critério 8) -> 422 ENCONTRO_INVALIDO (R9)', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Minicurso Sobreposto',
      tipo: 'minicurso',
      salaId: 'sala-101',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' },
        { inicio: '2026-10-19T11:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
      ]
    })
  });
  
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'ENCONTRO_INVALIDO');
});

test('POST /atividades com conflito de sala (menos de 15 min de intervalo, ex: 10:14) (critério 20) -> 409 CONFLITO_DE_SALA (R10)', async () => {
  // Cria primeira atividade na Sala 101 das 08:00 às 10:00
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Atividade 1',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res1.status, 201);

  // Tenta criar segunda atividade na mesma sala começando às 10:14 (intervalo de 14 min) -> 409
  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Atividade 2',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-19T10:14:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res2.status, 409);
  const body2 = await res2.json();
  assert.strictEqual(body2.erro, 'CONFLITO_DE_SALA');

  // Tenta criar terceira atividade na mesma sala começando às 10:15 (intervalo exatamente 15 min) -> 201
  const res3 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 
      'X-Usuario': 'org-ana',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: 'Atividade 3',
      tipo: 'palestra',
      salaId: 'sala-101',
      vagas: 20,
      encontros: [
        { inicio: '2026-10-19T10:15:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res3.status, 201);
});

test('R10, critério 20: encontro na mesma sala começando 15 min depois do fim do anterior (10:15) é aceito com 201', async () => {
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade A',
      tipo: 'palestra',
      salaId: 'sala-102',
      vagas: 20,
      encontros: [{ inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }]
    })
  });
  assert.strictEqual(res1.status, 201);

  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade B',
      tipo: 'palestra',
      salaId: 'sala-102',
      vagas: 20,
      encontros: [{ inicio: '2026-10-19T10:15:00-03:00', fim: '2026-10-19T12:00:00-03:00' }]
    })
  });
  assert.strictEqual(res2.status, 201);
});

test('R10, critério 21: encontro de atividade cancelada não gera CONFLITO_DE_SALA', async () => {
  const res1 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade a Cancelar',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 50,
      encontros: [{ inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }]
    })
  });
  assert.strictEqual(res1.status, 201);
  const atv1 = await res1.json();

  const cancelRes = await fetch(`http://localhost:${port}/atividades/${atv1.id}/cancelamento`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana' }
  });
  assert.strictEqual(cancelRes.status, 200);

  const res2 = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atividade Nova no Horário',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 50,
      encontros: [{ inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }]
    })
  });
  assert.strictEqual(res2.status, 201);
});

test('R8: encontro com menos de 1 hora de duração -> 422 ENCONTRO_INVALIDO', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Palestra Curta',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T09:45:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'ENCONTRO_INVALIDO');
});

test('R8: encontro fora do período de 19 a 23/10/2026 -> 422 ENCONTRO_INVALIDO', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Palestra Fora de Data',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 10,
      encontros: [
        { inicio: '2026-10-24T09:00:00-03:00', fim: '2026-10-24T10:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'ENCONTRO_INVALIDO');
});

test('R11: vagas igual a 0 -> 422 DADOS_INVALIDOS', async () => {
  const res = await fetch(`http://localhost:${port}/atividades`, {
    method: 'POST',
    headers: { 'X-Usuario': 'org-ana', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Palestra Zero Vagas',
      tipo: 'palestra',
      salaId: 'auditorio',
      vagas: 0,
      encontros: [
        { inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }
      ]
    })
  });
  assert.strictEqual(res.status, 422);
  const body = await res.json();
  assert.strictEqual(body.erro, 'DADOS_INVALIDOS');
});



