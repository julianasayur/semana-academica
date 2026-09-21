import { useEffect, useState } from 'react';
import { listarAtividades } from '../api';

const GradeAtividades = ({ onSelectAtividade }) => {
  const [atividades, setAtividades] = useState([]);
  const [dia, setDia] = useState('');
  const [tipo, setTipo] = useState('');
  const [erro, setErro] = useState(null);

  const diasDisponiveis = [
    { label: 'Todos', value: '' },
    { label: 'Seg 19/10', value: '2026-10-19' },
    { label: 'Ter 20/10', value: '2026-10-20' },
    { label: 'Qua 21/10', value: '2026-10-21' },
    { label: 'Qui 22/10', value: '2026-10-22' },
    { label: 'Sex 23/10', value: '2026-10-23' },
  ];

  const carregarAtividades = async () => {
    try {
      setErro(null);
      const data = await listarAtividades(dia || null, tipo || null);
      setAtividades(data);
    } catch (err) {
      setErro(err.message);
    }
  };

  useEffect(() => {
    carregarAtividades();
  }, [dia, tipo]);

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
      <h2>Programação de Atividades</h2>
      {erro && <div style={{ color: 'red', marginBottom: '10px' }}>{erro}</div>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Dia:</label>
          <select value={dia} onChange={(e) => setDia(e.target.value)} data-testid="select-dia">
            {diasDisponiveis.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} data-testid="select-tipo">
            <option value="">Todos</option>
            <option value="palestra">Palestra</option>
            <option value="minicurso">Minicurso</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {atividades.length === 0 ? (
          <p>Nenhuma atividade encontrada.</p>
        ) : (
          atividades.map((atv) => (
            <div
              key={atv.id}
              onClick={() => onSelectAtividade(atv.id)}
              style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'var(--social-bg)',
                transition: 'box-shadow 0.2s',
              }}
              className="atividade-item"
              data-testid={`atividade-${atv.id}`}
            >
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-h)' }}>{atv.titulo}</h3>
              <div style={{ fontSize: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{atv.tipo}</span>
                <span>Sala: {atv.salaId}</span>
                <span>Vagas Restantes: {atv.vagasRestantes}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GradeAtividades;
