const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const dbPath = process.env.DB_PATH || './banco.db';
const db = new DatabaseSync(dbPath);

function resetarDados() {
  db.exec(`
    DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS salas;
    DROP TABLE IF EXISTS atividades;
    
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
      vagas INTEGER
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

  app.get('/salas', (req, res) => {
    const stmt = db.prepare('SELECT * FROM salas');
    const salas = stmt.all();
    res.status(200).json(salas);
  });

  app.get('/atividades/:id', (req, res) => {
    res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
  });

  app.post('/atividades', (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não autenticado' });
    }
    if (req.usuario.papel !== 'organizacao') {
      return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização pode criar atividades' });
    }

    const { titulo, tipo, encontros } = req.body;
    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Título é obrigatório' });
    }

    if (tipo === 'palestra' && (!encontros || encontros.length !== 1)) {
        return res.status(422).json({ erro: 'QUANTIDADE_DE_ENCONTROS', mensagem: 'Palestra deve ter exatamente 1 encontro' });
    }

    if (encontros && encontros.length > 0) {
      const inicio = new Date(encontros[0].inicio);
      const fim = new Date(encontros[0].fim);
      const duracaoMinutos = (fim - inicio) / 1000 / 60;
      if (duracaoMinutos < 60 || duracaoMinutos > 240) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontro deve ter entre 1 e 4 horas' });
      }
    }

    res.status(201).json({}); // Placeholder
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

module.exports = { criarServidor };
