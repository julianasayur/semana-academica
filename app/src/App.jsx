import { useState, useEffect } from 'react';
import './App.css';
import { setUsuario } from './api';
import GradeAtividades from './pages/GradeAtividades';
import DetalheAtividade from './pages/DetalheAtividade';
import CriarAtividade from './pages/CriarAtividade';

const usuarios = [
  { id: 'org-ana', nome: 'Ana Beatriz Lima', papel: 'organizacao' },
  { id: 'org-bruno', nome: 'Bruno Tavares', papel: 'organizacao' },
  { id: 'p-carla', nome: 'Carla Mendes Souza', papel: 'participante' },
  { id: 'p-diego', nome: 'Diego Alves', papel: 'participante' },
  { id: 'p-elisa', nome: 'Elisa Fernandes da Rocha', papel: 'participante' },
  { id: 'p-fabio', nome: 'Fábio Nogueira', papel: 'participante' },
  { id: 'p-gabriela', nome: 'Gabriela Moura Castro', papel: 'participante' },
  { id: 'p-heitor', nome: 'Heitor Campos', papel: 'participante' },
  { id: 'p-isadora', nome: 'Isadora Ribeiro dos Santos', papel: 'participante' },
  { id: 'p-joao', nome: 'João Pedro Martins', papel: 'participante' },
];

function App() {
  const [usuarioAtivo, setUsuarioAtivo] = useState(usuarios[0].id);
  const [pagina, setPagina] = useState('grade'); // 'grade' | 'criar'
  const [atividadeSelecionadaId, setAtividadeSelecionadaId] = useState(null);

  // Update backend header whenever selected user changes
  useEffect(() => {
    setUsuario(usuarioAtivo);
  }, [usuarioAtivo]);

  const usuarioObjeto = usuarios.find((u) => u.id === usuarioAtivo);

  const handleSelectAtividade = (id) => {
    setAtividadeSelecionadaId(id);
  };

  const handleCriacaoSucesso = () => {
    setPagina('grade');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', letterSpacing: '-0.5px' }}>Semana Acadêmica</h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>Módulo M1 - Grade de Atividades</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>
              Simular Usuário:
            </label>
            <select
              value={usuarioAtivo}
              onChange={(e) => setUsuarioAtivo(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}
              data-testid="select-usuario"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.papel === 'organizacao' ? 'Org' : 'Part'})
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: usuarioObjeto?.papel === 'organizacao' ? 'rgba(170, 59, 255, 0.15)' : 'var(--code-bg)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {usuarioObjeto?.papel === 'organizacao' ? 'PAINEL ORGANIZAÇÃO' : 'VISUALIZAÇÃO PARTICIPANTE'}
          </div>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => {
            setPagina('grade');
            setAtividadeSelecionadaId(null);
          }}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: pagina === 'grade' ? 'var(--accent)' : 'var(--code-bg)',
            color: pagina === 'grade' ? '#fff' : 'var(--text)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          data-testid="nav-grade"
        >
          Programação
        </button>
        
        {/* Render for both to allow verification of organization only actions by API */}
        <button
          onClick={() => setPagina('criar')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: pagina === 'criar' ? 'var(--accent)' : 'var(--code-bg)',
            color: pagina === 'criar' ? '#fff' : 'var(--text)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          data-testid="nav-criar"
        >
          Criar Atividade
        </button>
      </nav>

      <main style={{ minHeight: '400px' }}>
        {pagina === 'grade' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <GradeAtividades onSelectAtividade={handleSelectAtividade} />
            <DetalheAtividade
              atividadeId={atividadeSelecionadaId}
              onBack={() => setAtividadeSelecionadaId(null)}
            />
          </div>
        ) : (
          <CriarAtividade onSuccess={handleCriacaoSucesso} />
        )}
      </main>
    </div>
  );
}

export default App;
