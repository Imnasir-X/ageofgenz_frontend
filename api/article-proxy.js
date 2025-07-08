export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Extract slug from the path: /api/article-proxy/slug
  let slug = url.searchParams.get('slug');
  if (!slug) {
    // Try to extract from the path
    const match = pathname.match(/\/article(?:-proxy)?\/?(.+)?$/);
    if (match && match[1]) {
      slug = match[1];
    }
  }

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  // Bot/crawler detection
  const isBot = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp|telegram|twitter|linkedinbot/i.test(userAgent);

  if (!isBot) {
    // Redirect regular users to the React app
    return Response.redirect(`https://theageofgenz.com/article/${slug}`, 301);
  }

  // Fetch from Django backend
  try {
    const backendUrl = `https://ageofgenz-backend.onrender.com/article/${slug}`;
    const backendResponse = await fetch(backendUrl, {
      headers: {
        'user-agent': userAgent,
      },
    });

    if (!backendResponse.ok) {
      return new Response('Article not found', { status: backendResponse.status });
    }

    const html = await backendResponse.text();

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, s-maxage=3600, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Edge Function] Error:', error);
    return new Response('Server error', { status: 500 });
  }
}
