import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import DetalheAtividade from './DetalheAtividade';
import * as api from '../api';

vi.mock('../api', () => ({
  detalharAtividade: vi.fn(),
  setUsuario: vi.fn(),
}));

describe('DetalheAtividade', () => {
  afterEach(() => {
    cleanup();
  });

  it('deve exibir detalhes da atividade', async () => {
    api.detalharAtividade.mockResolvedValue({
      id: '1',
      titulo: 'Atividade 1',
      vagas: 20,
      encontros: [{ id: 'e1', inicio: '2026-10-19T09:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }],
    });

    render(<DetalheAtividade id="1" />);

    await waitFor(() => {
        expect(screen.getByText('Atividade 1')).toBeDefined();
        expect(screen.getByText('Vagas Totais')).toBeDefined();
        expect(screen.getByText('20')).toBeDefined();
    });
  });
});
