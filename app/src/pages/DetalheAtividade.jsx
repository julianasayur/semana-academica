import { useEffect, useState } from 'react';
import { detalharAtividade } from '../api';

const DetalheAtividade = ({ atividadeId, id, onBack }) => {
  const activeId = atividadeId || id;
  const [atividade, setAtividade] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarAtividade = async () => {
    if (!activeId) return;
    try {
      setErro(null);
      const data = await detalharAtividade(activeId);
      setAtividade(data);
    } catch (err) {
      setErro(err.message);
    }
  };

  useEffect(() => {
    carregarAtividade();
  }, [activeId]);

  if (!activeId) {
    return (
      <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
        <p>Selecione uma atividade para visualizar os detalhes.</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
        <button onClick={onBack} style={{ marginBottom: '12px' }}>Voltar</button>
        <div style={{ color: 'red' }}>{erro}</div>
      </div>
    );
  }

  if (!atividade) {
    return (
      <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
        <p>Carregando detalhes...</p>
      </div>
    );
  }

  const formatarData = (isoStr) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '12px', padding: '6px 12px', cursor: 'pointer' }}>
          Voltar para a lista
        </button>
      )}
      <h2 style={{ margin: '0 0 12px 0', color: 'var(--text-h)' }}>{atividade.titulo}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>TIPO</strong>
          <span style={{ fontSize: '16px', textTransform: 'capitalize', fontWeight: 'bold' }}>{atividade.tipo}</span>
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>SALA</strong>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{atividade.salaId}</span>
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>SITUAÇÃO</strong>
          <span style={{ fontSize: '16px', textTransform: 'capitalize', fontWeight: 'bold' }}>{atividade.situacao}</span>
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>CARGA HORÁRIA</strong>
          <span style={{ fontSize: '16px' }}>{atividade.cargaHorariaMinutos} minutos</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Vagas e Inscrições</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'var(--code-bg)', borderRadius: '4px', textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', display: 'block' }}>{atividade.vagas}</span>
            <span style={{ fontSize: '12px' }}>Vagas Totais</span>
          </div>
          <div style={{ padding: '8px', background: 'var(--code-bg)', borderRadius: '4px', textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', display: 'block' }}>{atividade.ocupadas}</span>
            <span style={{ fontSize: '12px' }}>Ocupadas</span>
          </div>
          <div style={{ padding: '8px', background: 'var(--code-bg)', borderRadius: '4px', textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', display: 'block' }}>{atividade.vagasRestantes}</span>
            <span style={{ fontSize: '12px' }}>Restantes</span>
          </div>
          <div style={{ padding: '8px', background: 'var(--code-bg)', borderRadius: '4px', textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', display: 'block' }}>{atividade.emEspera}</span>
            <span style={{ fontSize: '12px' }}>Em Espera</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Encontros</h3>
        {atividade.encontros && atividade.encontros.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {atividade.encontros.map((enc, idx) => (
              <li
                key={enc.id || idx}
                style={{
                  padding: '10px',
                  borderBottom: idx === atividade.encontros.length - 1 ? 'none' : '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Encontro #{idx + 1}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {formatarData(enc.inicio)} até {formatarData(enc.fim)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum encontro programado.</p>
        )}
      </div>
    </div>
  );
};

export default DetalheAtividade;
