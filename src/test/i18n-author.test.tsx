import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { LANG_STORAGE_KEY } from '@/lib/i18n/context';
import { STRINGS } from '@/lib/i18n/strings';
import { timeAgoIn, translate } from '@/lib/i18n/format';
import { Header } from '@/components/layout/Header';
import { SourcesList } from '@/components/article/SourcesList';
import AuthorPage from '@/pages/Author';
import { normalizeArticle, normalizeAuthorProfile } from '@/lib/api/normalize';
import { authorJsonLd, articleJsonLd } from '@/lib/article/jsonLd';
import { AuthProvider } from '@/context/AuthContext';
import { SearchPaletteProvider } from '@/components/search/SearchPalette';

const EMOJI = /\p{Extended_Pictographic}/u;

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  document.documentElement.lang = 'en';
});

describe('interface strings', () => {
  it('has a Bangla string for every English key and no emoji in either language', () => {
    const en = Object.keys(STRINGS.en).sort();
    expect(Object.keys(STRINGS.bn).sort()).toEqual(en);
    for (const lang of ['en', 'bn'] as const) {
      for (const [key, value] of Object.entries(STRINGS[lang])) {
        expect(EMOJI.test(value), `${lang}:${key}`).toBe(false);
      }
    }
  });

  it('fills placeholders with locale digits', () => {
    expect(translate('en', 'story.min', { n: 4 })).toBe('4 min');
    expect(translate('bn', 'story.min', { n: 4 })).toBe('৪ মিনিট');
    expect(timeAgoIn('bn', new Date(Date.now() - 3 * 3600e3).toISOString())).toMatch(/৩/);
  });
});

function Shell() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MemoryRouter>
          <SearchPaletteProvider>
            <Header />
          </SearchPaletteProvider>
        </MemoryRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

describe('Bangla toggle', () => {
  it('switches the interface to Bangla, sets <html lang> and remembers the choice', async () => {
    render(<Shell />);
    expect(screen.getAllByRole('link', { name: 'Tech' }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId('lang-toggle'));
    await waitFor(() => expect(document.documentElement.lang).toBe('bn'));
    expect(screen.getAllByRole('link', { name: 'প্রযুক্তি' }).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('bn');
    expect(screen.getByTestId('lang-toggle')).toHaveTextContent('English');
  });

  it('starts in English (matches prerendered HTML) and applies a saved Bangla choice after mount', async () => {
    window.localStorage.setItem(LANG_STORAGE_KEY, 'bn');
    render(<Shell />);
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'রাজনীতি' }).length).toBeGreaterThan(0));
  });
});

describe('sources list', () => {
  it('labels each source kind with text and an icon, never emoji', () => {
    const article = normalizeArticle({
      id: 1,
      slug: 's',
      title: 'S',
      category: { id: 1, name: 'Tech', slug: 'tech' },
      sources: [
        { url: 'https://www.reuters.com/x', title: 'Wire story', publisher: 'Reuters', kind: 'original' },
        { url: 'https://arxiv.org/abs/1', title: 'Paper', publisher: 'arXiv', kind: 'research' },
        { url: 'https://en.wikipedia.org/wiki/X', title: 'Background', publisher: 'Wikipedia', kind: 'reference' },
        { url: 'https://example.com/y', title: 'Unknown kind', kind: 'blog' },
      ],
    });
    const { container } = render(<SourcesList article={article} />);
    expect(screen.getByText('Original report')).toBeInTheDocument();
    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-kind]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-kind] svg[aria-hidden="true"]')).toHaveLength(3);
    expect(screen.getAllByText('Source type:', { exact: false }).length).toBe(3);
    expect(EMOJI.test(container.textContent ?? '')).toBe(false);
  });
});

const AUTHOR_PAYLOAD = {
  id: 2,
  name: 'Demo Reporter',
  slug: 'demo-reporter',
  bio: 'Covers AI policy.',
  avatar: null,
  role: 'staff',
  is_desk: false,
  article_count: 14,
  count: 14,
  next: 'https://api.example.com/api/authors/demo-reporter/?page=2',
  previous: null,
  articles: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    slug: `story-${i}`,
    title: `Story number ${i}`,
    excerpt: 'Standfirst.',
    category: { id: 1, name: 'Tech', slug: 'tech' },
    author: { id: 2, name: 'Demo Reporter', slug: 'demo-reporter', role: 'staff', is_desk: false },
    published_at: '2026-11-01T10:00:00Z',
  })),
};

describe('author pages', () => {
  it('normalises the author payload and links bylines to /author/<slug>/', () => {
    const p = normalizeAuthorProfile(AUTHOR_PAYLOAD, 1)!;
    expect(p.author.name).toBe('Demo Reporter');
    expect(p.author.url).toBe('/author/demo-reporter/');
    expect(p.pages).toBe(2);
    expect(p.articles[0].author.url).toBe('/author/demo-reporter/');
    expect(normalizeAuthorProfile({ detail: 'Not found.' })).toBeNull();
  });

  it('builds ProfilePage + Person JSON-LD, and the desk as an Organization', () => {
    const p = normalizeAuthorProfile(AUTHOR_PAYLOAD, 1)!;
    const [profile, crumbs] = authorJsonLd(p) as Record<string, unknown>[];
    expect(profile['@type']).toBe('ProfilePage');
    expect((profile.mainEntity as Record<string, unknown>)['@type']).toBe('Person');
    expect((profile.mainEntity as Record<string, unknown>).url).toBe('https://theageofgenz.com/author/demo-reporter/');
    expect(crumbs['@type']).toBe('BreadcrumbList');
    const desk = normalizeArticle({ id: 1, slug: 'd', title: 'D', author: { name: 'The Age of GenZ Newsroom', slug: 'the-age-of-genz-newsroom', is_desk: true } });
    const ld = articleJsonLd(desk)[0] as { author: Record<string, unknown>[] };
    expect(ld.author[0]['@type']).toBe('Organization');
  });

  it('renders bio, stories and pagination from the API', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(AUTHOR_PAYLOAD), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(
      <MemoryRouter initialEntries={['/author/demo-reporter/']}>
        <Routes>
          <Route path="/author/:slug/*" element={<AuthorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'Demo Reporter' })).toBeInTheDocument();
    expect(screen.getByText('Covers AI policy.')).toBeInTheDocument();
    expect(screen.getByText('Staff writer')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(12);
    const older = screen.getByRole('link', { name: /Older/ });
    expect(older).toHaveAttribute('href', '/author/demo-reporter/?page=2');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/authors/demo-reporter/');
    await act(async () => undefined);
  });
});
