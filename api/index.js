const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const dbPath = process.env.DB_PATH || './banco.db';
const db = new DatabaseSync(dbPath);

function resetarDados() {
  db.exec(`
    DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS salas;
    
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
try {
  resetarDados();
} catch (e) {
  // Ignora erros de lock durante inicialização em paralelo
}

function criarServidor(port) {
  const app = express();
  app.use(express.json());

  // Estado do relógio em memória (apenas para MODO_TESTE)
  let relogio = '2026-10-13T09:00:00-03:00';

  if (process.env.MODO_TESTE === '1') {
    app.post('/_teste/reset', (req, res) => {
      try {
        resetarDados();
      } catch (e) {
        // Ignora lock
      }
      relogio = '2026-10-13T09:00:00-03:00';
      res.status(204).send();
    });

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

    const stmt = db.prepare('SELECT id FROM usuarios WHERE id = ?');
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

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

module.exports = { criarServidor };
