import { useEffect, useState } from 'react';
import { criarAtividade, listarSalas } from '../api';

const CriarAtividade = ({ onSuccess }) => {
  const [salas, setSalas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('palestra');
  const [salaId, setSalaId] = useState('');
  const [vagas, setVagas] = useState(20);
  const [encontros, setEncontros] = useState([]);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  // For adding a new meeting
  const [novoInicio, setNovoInicio] = useState('');
  const [novoFim, setNovoFim] = useState('');

  useEffect(() => {
    listarSalas()
      .then((data) => {
        setSalas(data);
        if (data.length > 0) {
          setSalaId(data[0].id);
        }
      })
      .catch((err) => {
        // Falls back to standard rooms in contract if API fails
        setSalas([
          { id: 'auditorio', nome: 'Auditório Central', capacidade: 200 },
          { id: 'sala-101', nome: 'Sala 101', capacidade: 40 },
          { id: 'sala-102', nome: 'Sala 102', capacidade: 40 },
          { id: 'lab-3', nome: 'Laboratório 3', capacidade: 20 },
        ]);
        setSalaId('auditorio');
      });
  }, []);

  const handleAdicionarEncontro = (e) => {
    e.preventDefault();
    if (!novoInicio || !novoFim) {
      alert('Por favor, preencha o início e fim do encontro.');
      return;
    }

    // Format datetime-local format 'YYYY-MM-DDTHH:MM' into ISO with -03:00 offset
    const inicioFormatted = `${novoInicio}:00-03:00`;
    const fimFormatted = `${novoFim}:00-03:00`;

    setEncontros([...encontros, { inicio: inicioFormatted, fim: fimFormatted }]);
    setNovoInicio('');
    setNovoFim('');
  };

  const handleRemoverEncontro = (index) => {
    setEncontros(encontros.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const dadosAtividade = {
      titulo,
      tipo,
      salaId,
      vagas: parseInt(vagas, 10),
      encontros,
    };

    try {
      const novaAtv = await criarAtividade(dadosAtividade);
      alert('Atividade criada com sucesso!');
      // Reset form
      setTitulo('');
      setTipo('palestra');
      setVagas(20);
      setEncontros([]);
      if (onSuccess) onSuccess(novaAtv);
    } catch (err) {
      // Rule 4: Do not invent/rewrite error messages; render the exact message returned by the API
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
      <h2>Criar Nova Atividade</h2>

      {erro && (
        <div style={{ padding: '12px', background: 'rgba(255, 0, 0, 0.1)', color: 'red', border: '1px solid red', borderRadius: '4px', marginBottom: '16px' }} data-testid="error-message">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
            data-testid="input-titulo"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '8px' }} data-testid="select-tipo-form">
              <option value="palestra">Palestra</option>
              <option value="minicurso">Minicurso</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Sala</label>
            <select value={salaId} onChange={(e) => setSalaId(e.target.value)} style={{ width: '100%', padding: '8px' }} data-testid="select-sala">
              {salas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} (Capacidade: {s.capacidade})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Vagas</label>
          <input
            type="number"
            value={vagas}
            onChange={(e) => setVagas(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            min="1"
            required
            data-testid="input-vagas"
          />
        </div>

        <div style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Encontros</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Início</label>
              <input
                type="datetime-local"
                value={novoInicio}
                onChange={(e) => setNovoInicio(e.target.value)}
                style={{ width: '100%', padding: '6px' }}
                data-testid="input-encontro-inicio"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Fim</label>
              <input
                type="datetime-local"
                value={novoFim}
                onChange={(e) => setNovoFim(e.target.value)}
                style={{ width: '100%', padding: '6px' }}
                data-testid="input-encontro-fim"
              />
            </div>
            <button type="button" onClick={handleAdicionarEncontro} style={{ padding: '6px 12px' }} data-testid="btn-add-encontro">
              +
            </button>
          </div>

          {encontros.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {encontros.map((enc, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: idx === encontros.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    #{idx + 1}: {enc.inicio.substring(0, 16).replace('T', ' ')} até {enc.fim.substring(11, 16)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoverEncontro(idx)}
                    style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>Nenhum encontro adicionado ainda.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Criando...' : 'Salvar Atividade'}
        </button>
      </form>
    </div>
  );
};

export default CriarAtividade;
