import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import CriarAtividade from './CriarAtividade';
import * as api from '../api';

vi.mock('../api', () => ({
  criarAtividade: vi.fn(),
  listarSalas: vi.fn(() => Promise.resolve([])),
  setUsuario: vi.fn(),
}));

describe('CriarAtividade', () => {
  afterEach(() => {
    cleanup();
  });

  it('deve exibir erro da API', async () => {
    api.criarAtividade.mockRejectedValue(new Error('ERRO_DA_API'));

    render(<CriarAtividade />);
    
    // Fill the required title field
    const inputTitulo = screen.getByTestId('input-titulo');
    fireEvent.change(inputTitulo, { target: { value: 'Nova Palestra' } });

    // Submit using the submit button
    const submitBtn = screen.getByText('Salvar Atividade');
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeDefined();
        expect(screen.getByText('ERRO_DA_API')).toBeDefined();
    });
  });
});
