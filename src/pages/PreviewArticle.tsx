import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';

import ArticleContentBlocks from '../components/ArticleContentBlocks';
import { API_BASE_URL } from '../utils/api';
import { getCategoryAccent, resolveCategoryMeta } from '../utils/categoryHelpers';
import type { ContentBlock } from '../types';

type PreviewArticlePayload = {
  id: number;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  content_blocks?: ContentBlock[] | null;
  content_mode?: string | null;
  featured_image?: string | null;
  featured_image_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  category?: { slug?: string | null; name?: string | null; parent_slug?: string | null } | null;
  category_name?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const PreviewArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState<PreviewArticlePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setError('Preview link expired or invalid.');
      setLoading(false);
      return;
    }

    const token = searchParams.get('token') || '';
    if (!token) {
      setError('Preview link expired or invalid.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPreview = async () => {
      try {
        const url = `${API_BASE_URL}/api/articles/preview/${id}/?token=${encodeURIComponent(token)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          setError('Preview link expired or invalid.');
          setLoading(false);
          return;
        }

        const payload = (await response.json()) as PreviewArticlePayload;
        setArticle(payload);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError('Preview link expired or invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
    return () => controller.abort();
  }, [id, searchParams]);

  const categoryMeta = useMemo(() => {
    if (!article) {
      return resolveCategoryMeta();
    }
    if (article.category && (article.category.slug || article.category.name)) {
      return resolveCategoryMeta({
        slug: article.category.slug ?? undefined,
        name: article.category.name ?? undefined,
        parent_slug: article.category.parent_slug ?? null,
      });
    }
    if (article.category_name) {
      return resolveCategoryMeta({ name: article.category_name });
    }
    return resolveCategoryMeta();
  }, [article]);

  const categoryAccent = useMemo(() => getCategoryAccent(categoryMeta), [categoryMeta]);

  const bannerTitle = article?.title ? `Preview: ${article.title}` : 'Preview';
  const publishedDate = formatDate(article?.published_at || article?.created_at || undefined);
  const imageUrl = article?.featured_image_url || article?.featured_image || '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{bannerTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="Cache-Control" content="no-store" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Helmet>

      <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-3 text-sm">
          <span className="font-semibold uppercase tracking-wide">Preview Mode - This article is not public.</span>
          <span className="text-amber-700">Links are temporary and should not be shared.</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading preview...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && article && (
          <article className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span className={`rounded-full px-3 py-1 text-white ${categoryAccent.badge}`}>
                {categoryMeta.topLevelName}
              </span>
              {publishedDate && <span>{publishedDate}</span>}
            </div>

            <h1 className="mt-5 text-3xl font-semibold text-slate-900 md:text-4xl">
              {article.title || 'Untitled'}
            </h1>

            {article.excerpt && (
              <p className="mt-4 text-lg text-slate-600">{article.excerpt}</p>
            )}

            {imageUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl">
                <img
                  src={imageUrl}
                  alt={article.title || 'Preview image'}
                  className="h-auto w-full object-cover"
                  loading="eager"
                />
              </div>
            )}

            <ArticleContentBlocks
              blocks={article.content_blocks}
              fallbackContent={article.content}
              className="article-content-container article-content mt-8 leading-[1.75]"
            />
          </article>
        )}
      </div>
    </div>
  );
};

export default PreviewArticle;
