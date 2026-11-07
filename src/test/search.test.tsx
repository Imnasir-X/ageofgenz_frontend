import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SearchPaletteDialog, SearchPaletteProvider } from '@/components/search/SearchPalette';
import { addRecentSearch, clearRecentSearches, getRecentSearches, RECENT_KEY, RECENT_MAX, removeRecentSearch } from '@/lib/search/recent';
import { splitHighlight } from '@/lib/search/highlight';
import { articlesApi } from '@/lib/api/client';
import { clearCache } from '@/lib/api/cache';
import { normalizeArticle } from '@/lib/api/normalize';

const story = normalizeArticle({ id: 7, slug: 'climate-deal', title: 'Climate deal reached in Dhaka', category: { id: 1, name: 'World', slug: 'global' } });

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

function renderPalette(open = true) {
  const onOpenChange = vi.fn();
  render(
    <MemoryRouter initialEntries={['/']}>
      <SearchPaletteDialog open={open} onOpenChange={onOpenChange} />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
  return { onOpenChange };
}

const input = () => screen.getByRole('combobox', { name: 'Search stories' });
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('recent searches', () => {
  beforeEach(() => localStorage.clear());

  it('stores newest first, trims, de-duplicates case-insensitively and caps the list', () => {
    addRecentSearch('  climate  ');
    addRecentSearch('budget');
    addRecentSearch('CLIMATE');
    expect(getRecentSearches()).toEqual(['CLIMATE', 'budget']);
    for (let i = 0; i < 10; i++) addRecentSearch(`query ${i}`);
    expect(getRecentSearches()).toHaveLength(RECENT_MAX);
    expect(getRecentSearches()[0]).toBe('query 9');
  });

  it('ignores one-character queries, removes and clears, and survives corrupt storage', () => {
    addRecentSearch('a');
    expect(getRecentSearches()).toEqual([]);
    addRecentSearch('ai');
    addRecentSearch('tech');
    expect(removeRecentSearch('AI')).toEqual(['tech']);
    expect(clearRecentSearches()).toEqual([]);
    localStorage.setItem(RECENT_KEY, '{not json');
    expect(getRecentSearches()).toEqual([]);
  });
});

describe('highlight', () => {
  it('marks every query word, case-insensitively, and escapes regex characters', () => {
    expect(splitHighlight('Climate deal in Dhaka', 'dhaka climate')).toEqual([
      { text: 'Climate', match: true },
      { text: ' deal in ', match: false },
      { text: 'Dhaka', match: true },
    ]);
    expect(splitHighlight('C++ (and more)', 'c++')).toEqual([
      { text: 'C++', match: true },
      { text: ' (and more)', match: false },
    ]);
    expect(splitHighlight('Nothing', '')).toEqual([{ text: 'Nothing', match: false }]);
  });
});

describe('search palette', () => {
  let list: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    clearCache();
    list = vi.spyOn(articlesApi, 'list').mockResolvedValue({ results: [story], count: 14, next: '/api/articles/?page=2' });
    vi.spyOn(articlesApi, 'latest').mockResolvedValue([]);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debounces typing into a single request ~200ms after the last keystroke', async () => {
    renderPalette();
    fireEvent.change(input(), { target: { value: 'c' } });
    fireEvent.change(input(), { target: { value: 'cl' } });
    fireEvent.change(input(), { target: { value: 'cli' } });
    fireEvent.change(input(), { target: { value: 'clim' } });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(list).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(60);
    });
    await flush();
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ search: 'clim' }));
    expect(await screen.findByText('Clim', { selector: 'mark' })).toBeInTheDocument();
    expect(screen.getByText(/See all 14 results/)).toBeInTheDocument();
  });

  it('does not search below two characters and serves repeat queries from cache', async () => {
    renderPalette();
    fireEvent.change(input(), { target: { value: 'c' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(list).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: 'climate' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    fireEvent.change(input(), { target: { value: 'climat' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    fireEvent.change(input(), { target: { value: 'climate' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('saves the query as a recent search when a result is opened, and shows recents on an empty query', async () => {
    const { onOpenChange } = renderPalette();
    fireEvent.change(input(), { target: { value: 'climate' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    fireEvent.click(await screen.findByRole('option', { name: /Climate deal reached in Dhaka/ }));
    expect(getRecentSearches()).toEqual(['climate']);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('where')).toHaveTextContent('/articles/climate-deal/');

    fireEvent.change(input(), { target: { value: '' } });
    expect(screen.getByRole('option', { name: 'climate' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Clear recent searches/ })).toBeInTheDocument();
  });

  it('"see all" goes to the search page with the query in the URL', async () => {
    renderPalette();
    fireEvent.change(input(), { target: { value: 'climate' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    fireEvent.click(await screen.findByRole('option', { name: /See all 14 results/ }));
    expect(screen.getByTestId('where')).toHaveTextContent('/search?q=climate');
    expect(getRecentSearches()).toEqual(['climate']);
  });

  it('shows a helpful error with a retry when the API fails', async () => {
    list.mockRejectedValueOnce(new Error('boom'));
    renderPalette();
    fireEvent.change(input(), { target: { value: 'climate' } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await flush();
    expect(await screen.findByText(/Search didn’t load/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: /Try again/ }));
    await flush();
    expect(await screen.findByText('Climate', { selector: 'mark' })).toBeInTheDocument();
  });
});

describe('palette shortcuts', () => {
  beforeEach(() => {
    vi.spyOn(articlesApi, 'latest').mockResolvedValue([]);
  });
  afterEach(() => vi.restoreAllMocks());

  it('opens with Ctrl+K and with "/" (but not while typing in a field)', () => {
    render(
      <MemoryRouter>
        <SearchPaletteProvider>
          <input aria-label="other field" />
        </SearchPaletteProvider>
      </MemoryRouter>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('other field'), { key: '/' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: '/' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
