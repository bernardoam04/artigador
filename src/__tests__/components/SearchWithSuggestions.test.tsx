import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('SearchWithSuggestions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('dispara onSearch ao pressionar Enter', async () => {
        const onSearch = vi.fn();
        render(
            <SearchWithSuggestions
                className="border p-2"
                onSearch={onSearch}
                placeholder="Buscar..."
            />
        );

        const input = screen.getByPlaceholderText('Buscar...');
        await userEvent.type(input, 'deep learning');
        await userEvent.keyboard('{Enter}');

        expect(onSearch).toHaveBeenCalledWith('deep learning');
    });

    it('mostra sugestões (mock fetch) e chama onSearch ao clicar em sugestão não-article', async () => {
        const onSearch = vi.fn();

        // Mock de fetch para retornar sugestões
        const suggestions = [
            { type: 'keyword', value: 'Artificial Intelligence', count: 42 },
            { type: 'author', value: 'Ada Lovelace' },
        ];
        const fetchMock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
            ok: true,
            json: async () => ({ suggestions }),
        } as any);

        render(
            <SearchWithSuggestions
                className="border p-2"
                onSearch={onSearch}
                placeholder="Procurar..."
            />
        );

        const input = screen.getByPlaceholderText('Procurar...');
        await userEvent.type(input, 'ai');

        // Aguarda fetch ser chamado e sugestões renderizadas (debounce ~300ms)
        await waitFor(() => expect(fetchMock).toHaveBeenCalled(), { timeout: 2000 });
        await waitFor(() => expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument(), { timeout: 2000 });

        // Clica na primeira sugestão (keyword) que deve chamar onSearch
        await userEvent.click(screen.getByText('Artificial Intelligence'));

        expect(onSearch).toHaveBeenCalledWith('Artificial Intelligence');
        expect(fetchMock).toHaveBeenCalled();
    });
});
