import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import App from './App';
import * as api from './api';

vi.mock('./api', () => ({
  setUsuario: vi.fn(),
  listarAtividades: vi.fn(() => Promise.resolve([])),
  listarSalas: vi.fn(() => Promise.resolve([])),
  detalharAtividade: vi.fn(),
  criarAtividade: vi.fn(),
}));

describe('App Integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('deve alternar usuarios e chamar setUsuario', async () => {
    render(<App />);

    const select = screen.getByTestId('select-usuario');
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: 'org-bruno' } });
    expect(api.setUsuario).toHaveBeenCalledWith('org-bruno');
  });

  it('deve alternar entre paginas de programacao e criacao de atividades', async () => {
    render(<App />);

    const btnCriar = screen.getByTestId('nav-criar');
    fireEvent.click(btnCriar);

    await waitFor(() => {
        expect(screen.getByText('Criar Nova Atividade')).toBeDefined();
    });

    const btnGrade = screen.getByTestId('nav-grade');
    fireEvent.click(btnGrade);

    await waitFor(() => {
        expect(screen.getByText('Programação de Atividades')).toBeDefined();
    });
  });
});
