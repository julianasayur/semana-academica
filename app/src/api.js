
let usuarioId = null;

export const setUsuario = (id) => {
  usuarioId = id;
};

const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(usuarioId ? { 'X-Usuario': usuarioId } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.mensagem || 'Erro na requisição');
  }
  
  return response.json();
};

export const listarSalas = () => fetchApi('/salas');
export const listarAtividades = (dia, tipo) => {
    let url = '/atividades';
    const params = new URLSearchParams();
    if(dia) params.append('dia', dia);
    if(tipo) params.append('tipo', tipo);
    if(params.toString()) url += `?${params.toString()}`;
    return fetchApi(url);
};
export const detalharAtividade = (id) => fetchApi(`/atividades/${id}`);
export const criarAtividade = (dados) => fetchApi('/atividades', { method: 'POST', body: JSON.stringify(dados) });
