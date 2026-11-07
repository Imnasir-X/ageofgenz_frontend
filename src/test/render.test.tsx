import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoryCard } from '@/components/news/StoryCard';
import { BriefingBox } from '@/components/article/BriefingBox';
import NotFound from '@/pages/NotFound';
import { normalizeArticle } from '@/lib/api/normalize';

const article = normalizeArticle({
  id: 1,
  slug: 'story',
  title: 'A Story About Ai',
  excerpt: 'The standfirst.',
  content_blocks: [
    { type: 'paragraph', text: 'The standfirst.' },
    { type: 'paragraph', text: 'The second paragraph explains the main point of the story in one sentence. Then more detail.' },
  ],
  category: { id: 3, name: 'Opinion', slug: 'opinion' },
});

describe('smoke renders', () => {
  it('renders a story card with the opinion label and a link to the article', () => {
    render(
      <MemoryRouter>
        <StoryCard article={article} variant="row" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'A Story About AI' })).toHaveAttribute('href', '/articles/story/');
    expect(screen.getAllByText('Opinion').length).toBeGreaterThan(0);
  });

  it('shows extractive key points when the backend has no TL;DR', () => {
    render(<BriefingBox article={article} />);
    expect(screen.getByText('Key points')).toBeInTheDocument();
    expect(screen.getByText(/The second paragraph explains the main point/)).toBeInTheDocument();
  });

  it('renders the 404 page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This story isn’t here.');
  });
});
