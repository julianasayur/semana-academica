import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import GradeAtividades from './GradeAtividades';
import * as api from '../api';

vi.mock('../api', () => ({
  listarAtividades: vi.fn(),
  setUsuario: vi.fn(),
}));

describe('GradeAtividades', () => {
  it('deve listar atividades e responder a filtros', async () => {
    api.listarAtividades.mockResolvedValue([
      { id: '1', titulo: 'Atividade Teste 1', tipo: 'palestra', salaId: 'sala-101', vagasRestantes: 10 },
    ]);

    const handleSelect = vi.fn();
    render(<GradeAtividades onSelectAtividade={handleSelect} />);

    await waitFor(() => {
        expect(screen.getByText('Atividade Teste 1')).toBeDefined();
        expect(screen.getByText('palestra')).toBeDefined();
    });

    const selectTipo = screen.getByTestId('select-tipo');
    fireEvent.change(selectTipo, { target: { value: 'minicurso' } });

    await waitFor(() => {
        expect(api.listarAtividades).toHaveBeenCalledWith(null, 'minicurso');
    });
  });
});
