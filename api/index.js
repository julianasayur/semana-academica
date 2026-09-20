const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const dbPath = process.env.DB_PATH || './banco.db';
let db = new DatabaseSync(dbPath);

function getBrasiliaDateStr(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  } catch (e) {
    return null;
  }
}

function resetarDados() {
  db.exec(`
    DROP TABLE IF EXISTS inscricoes;
    DROP TABLE IF EXISTS encontros;
    DROP TABLE IF EXISTS atividades;
    DROP TABLE IF EXISTS salas;
    DROP TABLE IF EXISTS usuarios;
    
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT,
      papel TEXT
    );
    CREATE TABLE IF NOT EXISTS salas (
      id TEXT PRIMARY KEY,
      nome TEXT,
      capacidade INTEGER
    );
    CREATE TABLE IF NOT EXISTS atividades (
      id TEXT PRIMARY KEY,
      titulo TEXT,
      tipo TEXT,
      salaId TEXT,
      vagas INTEGER,
      situacao TEXT DEFAULT 'prevista'
    );
    CREATE TABLE IF NOT EXISTS encontros (
      id TEXT PRIMARY KEY,
      atividadeId TEXT,
      inicio TEXT,
      fim TEXT,
      FOREIGN KEY(atividadeId) REFERENCES atividades(id)
    );
    CREATE TABLE IF NOT EXISTS inscricoes (
      id TEXT PRIMARY KEY,
      atividadeId TEXT,
      participanteId TEXT,
      status TEXT,
      posicaoNaEspera INTEGER,
      convocadaAte TEXT,
      criadaEm TEXT,
      FOREIGN KEY(atividadeId) REFERENCES atividades(id)
    );

    INSERT OR REPLACE INTO usuarios (id, nome, papel) VALUES 
      ('org-ana', 'Ana Beatriz Lima', 'organizacao'),
      ('org-bruno', 'Bruno Tavares', 'organizacao'),
      ('p-carla', 'Carla Mendes Souza', 'participante'),
      ('p-diego', 'Diego Alves', 'participante'),
      ('p-elisa', 'Elisa Fernandes da Rocha', 'participante'),
      ('p-fabio', 'Fábio Nogueira', 'participante'),
      ('p-gabriela', 'Gabriela Moura Castro', 'participante'),
      ('p-heitor', 'Heitor Campos', 'participante'),
      ('p-isadora', 'Isadora Ribeiro dos Santos', 'participante'),
      ('p-joao', 'João Pedro Martins', 'participante');

    INSERT OR REPLACE INTO salas (id, nome, capacidade) VALUES
      ('auditorio', 'Auditório Central', 200),
      ('sala-101', 'Sala 101', 40),
      ('sala-102', 'Sala 102', 40),
      ('lab-3', 'Laboratório 3', 20);
  `);
}

// Inicializa na primeira vez
resetarDados();

function criarServidor(port) {
  const currentDbPath = process.env.DB_PATH || './banco.db';
  db = new DatabaseSync(currentDbPath);
  resetarDados();

  const app = express();
  app.use(express.json());

  // Estado do relógio em memória (apenas para MODO_TESTE)
  let relogio = '2026-10-13T09:00:00-03:00';

  if (process.env.MODO_TESTE === '1') {
    app.post('/_teste/reset', (req, res) => {
      resetarDados();
      relogio = '2026-10-13T09:00:00-03:00';
      res.status(204).send();
    });
    // ...

    app.get('/_teste/relogio', (req, res) => {
      res.status(200).json({ agora: relogio });
    });

    app.put('/_teste/relogio', (req, res) => {
      relogio = req.body.agora;
      res.status(200).json({ agora: relogio });
    });
  }

    // Middleware para verificação de usuário (R1)
  app.use((req, res, next) => {
    // Exclui rotas de teste
    if (req.path.startsWith('/_teste/')) return next();

    const usuarioId = req.headers['x-usuario'];
    if (!usuarioId) {
      return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'X-Usuario obrigatório' });
    }

    const stmt = db.prepare('SELECT id, papel FROM usuarios WHERE id = ?');
    const usuario = stmt.get(usuarioId);

    if (!usuario) {
      return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário inexistente' });
    }
    
    req.usuario = usuario;
    next();
  });

  function formatarAtividade(atividade, encontros) {
    encontros.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    
    let cargaHorariaMinutos = 0;
    for (const enc of encontros) {
      const inicio = new Date(enc.inicio);
      const fim = new Date(enc.fim);
      cargaHorariaMinutos += Math.round((fim - inicio) / 1000 / 60);
    }

    let situacao = atividade.situacao;
    if (situacao !== 'cancelada') {
      if (encontros.length > 0) {
        const primeiroInicio = new Date(encontros[0].inicio).getTime();
        const ultimoFim = new Date(encontros[encontros.length - 1].fim).getTime();
        const agoraTime = new Date(relogio).getTime();
        if (agoraTime < primeiroInicio) {
          situacao = 'prevista';
        } else if (agoraTime >= primeiroInicio && agoraTime < ultimoFim) {
          situacao = 'em_andamento';
        } else {
          situacao = 'encerrada';
        }
      } else {
        situacao = 'prevista';
      }
    }

    const ocupadasStmt = db.prepare(`
      SELECT COUNT(*) as cnt FROM inscricoes 
      WHERE atividadeId = ? AND status IN ('confirmada', 'convocada')
    `);
    const ocupadasRes = ocupadasStmt.get(atividade.id);
    const ocupadas = ocupadasRes ? ocupadasRes.cnt : 0;

    const emEsperaStmt = db.prepare(`
      SELECT COUNT(*) as cnt FROM inscricoes 
      WHERE atividadeId = ? AND status = 'em_espera'
    `);
    const emEsperaRes = emEsperaStmt.get(atividade.id);
    const emEspera = emEsperaRes ? emEsperaRes.cnt : 0;

    const vagasRestantes = atividade.vagas - ocupadas;

    return {
      id: atividade.id,
      titulo: atividade.titulo,
      tipo: atividade.tipo,
      salaId: atividade.salaId,
      vagas: atividade.vagas,
      encontros: encontros.map(e => ({ id: e.id, inicio: e.inicio, fim: e.fim })),
      cargaHorariaMinutos,
      situacao,
      ocupadas,
      vagasRestantes,
      emEspera
    };
  }

  app.get('/salas', (req, res) => {
    const stmt = db.prepare('SELECT * FROM salas');
    const salas = stmt.all();
    res.status(200).json(salas);
  });

  app.get('/atividades', (req, res) => {
    const { dia, tipo } = req.query;
    const atvStmt = db.prepare('SELECT * FROM atividades');
    const atividadesRows = atvStmt.all();

    const resultado = [];
    for (const atv of atividadesRows) {
      const encStmt = db.prepare('SELECT id, inicio, fim FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC');
      const encontros = encStmt.all(atv.id);

      if (tipo && atv.tipo !== tipo) {
        continue;
      }

      if (dia) {
        const temEncontroNoDia = encontros.some(enc => getBrasiliaDateStr(enc.inicio) === dia);
        if (!temEncontroNoDia) {
          continue;
        }
      }

      const formatted = formatarAtividade(atv, encontros);
      resultado.push(formatted);
    }

    resultado.sort((a, b) => {
      const startA = a.encontros.length > 0 ? new Date(a.encontros[0].inicio).getTime() : 0;
      const startB = b.encontros.length > 0 ? new Date(b.encontros[0].inicio).getTime() : 0;
      if (startA !== startB) {
        return startA - startB;
      }
      return a.titulo.localeCompare(b.titulo);
    });

    res.status(200).json(resultado);
  });

  app.get('/atividades/:id', (req, res) => {
    const { id } = req.params;
    const atvStmt = db.prepare('SELECT * FROM atividades WHERE id = ?');
    const atividade = atvStmt.get(id);
    if (!atividade) {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
    }

    const encStmt = db.prepare('SELECT id, inicio, fim FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC');
    const encontros = encStmt.all(id);

    const formatted = formatarAtividade(atividade, encontros);
    res.status(200).json(formatted);
  });

  app.post('/atividades', (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não autenticado' });
    }
    if (req.usuario.papel !== 'organizacao') {
      return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização pode criar atividades' });
    }

    const { titulo, tipo, salaId, vagas, encontros } = req.body;
    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '' ||
        !tipo || !['palestra', 'minicurso'].includes(tipo) ||
        !salaId || typeof salaId !== 'string' ||
        vagas === undefined || typeof vagas !== 'number' || !Number.isInteger(vagas) ||
        !Array.isArray(encontros)) {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Dados obrigatórios ausentes ou inválidos' });
    }

    // R5: check if each meeting is well-formed
    for (const enc of encontros) {
      if (!enc || typeof enc !== 'object' || typeof enc.inicio !== 'string' || typeof enc.fim !== 'string') {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Formato do encontro inválido' });
      }
    }

    if (tipo === 'palestra' && encontros.length !== 1) {
        return res.status(422).json({ erro: 'QUANTIDADE_DE_ENCONTROS', mensagem: 'Palestra deve ter exatamente 1 encontro' });
    }

    // R12: Sala inexistente no POST -> 422 DADOS_INVALIDOS
    const salaStmt = db.prepare('SELECT id, capacidade FROM salas WHERE id = ?');
    const sala = salaStmt.get(salaId);
    if (!sala) {
      return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Sala inexistente' });
    }

    // R11: Vagas
    if (vagas < 1) {
      return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Vagas deve ser no mínimo 1' });
    }
    if (vagas > sala.capacidade) {
      return res.status(422).json({ erro: 'VAGAS_ACIMA_DA_CAPACIDADE', mensagem: 'Vagas acima da capacidade da sala' });
    }

    if (encontros.length > 0) {
      // R9: Check overlap within the same activity
      for (let i = 0; i < encontros.length; i++) {
        for (let j = i + 1; j < encontros.length; j++) {
          const start1 = new Date(encontros[i].inicio).getTime();
          const end1 = new Date(encontros[i].fim).getTime();
          const start2 = new Date(encontros[j].inicio).getTime();
          const end2 = new Date(encontros[j].fim).getTime();
          if (start1 < end2 && start2 < end1) {
            return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontros da mesma atividade não podem se sobrepor' });
          }
        }
      }

      // R10: Check room conflict (15 minutes interval minimum)
      const conflitoStmt = db.prepare(`
        SELECT e.inicio, e.fim 
        FROM encontros e 
        JOIN atividades a ON e.atividadeId = a.id 
        WHERE a.salaId = ? AND a.situacao != 'cancelada'
      `);
      const encontrosExistentes = conflitoStmt.all(salaId);
      const INTERVALO_MS = 15 * 60 * 1000;

      for (const enc of encontros) {
        const novoStart = new Date(enc.inicio).getTime();
        const novoEnd = new Date(enc.fim).getTime();
        
        for (const ex of encontrosExistentes) {
          const exStart = new Date(ex.inicio).getTime();
          const exEnd = new Date(ex.fim).getTime();
          
          if (novoStart < (exEnd + INTERVALO_MS) && exStart < (novoEnd + INTERVALO_MS)) {
            return res.status(409).json({ erro: 'CONFLITO_DE_SALA', mensagem: 'Conflito de horários na sala' });
          }
        }
      }

      const VALID_DATES = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'];
      for (const enc of encontros) {
        const inicioDate = new Date(enc.inicio);
        const fimDate = new Date(enc.fim);
        if (isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime())) {
          return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Data inválida' });
        }
        
        const duracaoMinutos = (fimDate - inicioDate) / 1000 / 60;
        if (duracaoMinutos < 60 || duracaoMinutos > 240) {
            return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontro deve ter entre 1 e 4 horas' });
        }

        const diaInicio = getBrasiliaDateStr(enc.inicio);
        const diaFim = getBrasiliaDateStr(enc.fim);
        
        if (!diaInicio || !diaFim || diaInicio !== diaFim) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontro deve começar e terminar no mesmo dia (horário de Brasília)' });
        }

        if (!VALID_DATES.includes(diaInicio)) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontro deve situar-se entre os dias 19 e 23/10/2026 (horário de Brasília)' });
        }
      }
    }

    const atvId = `atv_${crypto.randomBytes(4).toString('hex')}`;
    const stmtAtv = db.prepare('INSERT INTO atividades (id, titulo, tipo, salaId, vagas, situacao) VALUES (?, ?, ?, ?, ?, ?)');
    stmtAtv.run(atvId, titulo, tipo, salaId, vagas, 'prevista');

    let cargaHorariaMinutos = 0;
    const encontrosComId = [];
    if (encontros) {
      const stmtEnc = db.prepare('INSERT INTO encontros (id, atividadeId, inicio, fim) VALUES (?, ?, ?, ?)');
      for (const enc of encontros) {
        const encId = `enc_${crypto.randomBytes(4).toString('hex')}`;
        stmtEnc.run(encId, atvId, enc.inicio, enc.fim);
        const inicio = new Date(enc.inicio);
        const fim = new Date(enc.fim);
        cargaHorariaMinutos += Math.round((fim - inicio) / 1000 / 60);
        encontrosComId.push({ id: encId, ...enc });
      }
    }

    res.status(201).json({
      id: atvId,
      titulo,
      tipo,
      salaId,
      vagas,
      encontros: encontrosComId,
      cargaHorariaMinutos,
      situacao: 'prevista',
      ocupadas: 0,
      vagasRestantes: vagas,
      emEspera: 0
    });
  });

  app.patch('/atividades/:id', (req, res) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não autenticado' });
    }
    if (req.usuario.papel !== 'organizacao') {
      return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização pode alterar atividades' });
    }

    const { id } = req.params;
    const stmtAtv = db.prepare('SELECT * FROM atividades WHERE id = ?');
    const atividade = stmtAtv.get(id);
    if (!atividade) {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
    }

    if (atividade.situacao === 'cancelada') {
      return res.status(422).json({ erro: 'ATIVIDADE_CANCELADA', mensagem: 'Atividade já está cancelada' });
    }

    const { titulo, tipo, salaId, vagas, encontros } = req.body;

    if (salaId !== undefined || tipo !== undefined || encontros !== undefined) {
      return res.status(422).json({ erro: 'CAMPO_NAO_EDITAVEL', mensagem: 'Campos salaId, tipo e encontros não são editáveis' });
    }

    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Título inválido' });
      }
    }

    if (vagas !== undefined) {
      if (typeof vagas !== 'number' || !Number.isInteger(vagas) || vagas < 1) {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Vagas inválidas' });
      }

      const salaStmt = db.prepare('SELECT capacidade FROM salas WHERE id = ?');
      const sala = salaStmt.get(atividade.salaId);
      if (sala && vagas > sala.capacidade) {
        return res.status(422).json({ erro: 'VAGAS_ACIMA_DA_CAPACIDADE', mensagem: 'Vagas acima da capacidade da sala' });
      }

      const ocupadasStmt = db.prepare(`
        SELECT COUNT(*) as cnt FROM inscricoes 
        WHERE atividadeId = ? AND status IN ('confirmada', 'convocada')
      `);
      const ocupadasRes = ocupadasStmt.get(id);
      const ocupadas = ocupadasRes ? ocupadasRes.cnt : 0;
      if (vagas < ocupadas) {
        return res.status(409).json({ erro: 'VAGAS_ABAIXO_DOS_INSCRITOS', mensagem: 'Vagas abaixo do número de ocupantes atuais' });
      }
    }

    const novoTitulo = titulo !== undefined ? titulo : atividade.titulo;
    const novasVagas = vagas !== undefined ? vagas : atividade.vagas;

    db.prepare('UPDATE atividades SET titulo = ?, vagas = ? WHERE id = ?').run(novoTitulo, novasVagas, id);

    const updatedAtv = { ...atividade, titulo: novoTitulo, vagas: novasVagas };
    const encStmt = db.prepare('SELECT id, inicio, fim FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC');
    const encontrosList = encStmt.all(id);

    const formatted = formatarAtividade(updatedAtv, encontrosList);
    res.status(200).json(formatted);
  });

  app.post('/atividades/:id/cancelamento', (req, res) => {
    if (req.usuario.papel !== 'organizacao') {
      return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização pode cancelar atividades' });
    }

    const { id } = req.params;
    const stmtAtv = db.prepare('SELECT * FROM atividades WHERE id = ?');
    const atividade = stmtAtv.get(id);
    if (!atividade) {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
    }

    if (atividade.situacao === 'cancelada') {
      return res.status(422).json({ erro: 'ATIVIDADE_CANCELADA', mensagem: 'Atividade já está cancelada' });
    }

    const encontrosStmt = db.prepare('SELECT id, inicio, fim FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC');
    const encontros = encontrosStmt.all(id);

    if (encontros.length > 0) {
      const primeiroInicio = new Date(encontros[0].inicio).getTime();
      const agoraTime = new Date(relogio).getTime();
      if (agoraTime >= primeiroInicio) {
        return res.status(422).json({ erro: 'ATIVIDADE_JA_INICIADA', mensagem: 'Atividade já foi iniciada' });
      }
    }

    db.prepare('UPDATE atividades SET situacao = ? WHERE id = ?').run('cancelada', id);

    let cargaHorariaMinutos = 0;
    for (const enc of encontros) {
      const inicio = new Date(enc.inicio);
      const fim = new Date(enc.fim);
      cargaHorariaMinutos += Math.round((fim - inicio) / 1000 / 60);
    }

    res.status(200).json({
      id: atividade.id,
      titulo: atividade.titulo,
      tipo: atividade.tipo,
      salaId: atividade.salaId,
      vagas: atividade.vagas,
      encontros,
      cargaHorariaMinutos,
      situacao: 'cancelada',
      ocupadas: 0,
      vagasRestantes: atividade.vagas,
      emEspera: 0
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

module.exports = { criarServidor };
