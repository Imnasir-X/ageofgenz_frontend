export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Extract slug from query parameter (set by Vercel rewrite)
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug parameter', { 
      status: 400,
      headers: { 'content-type': 'text/plain' }
    });
  }
  
  // Comprehensive bot detection
  const isBot = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp|telegram|twitter|linkedinbot|googlebot|bingbot|yandexbot|duckduckbot|baiduspider|applebot|petalbot|semrushbot|ahrefsbot|mj12bot|dotbot|blexbot|bubing|seznambot|sogou|exabot|facebot|ia_archiver|developers\.google\.com\/\+\/web\/snippet/i.test(userAgent);
  
  // For bots: serve SEO-optimized HTML from Django backend
  if (isBot) {
    try {
      const backendUrl = `https://ageofgenz-backend.onrender.com/article/${encodeURIComponent(slug)}`;
      const backendResponse = await fetch(backendUrl, {
        headers: {
          'user-agent': userAgent,
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!backendResponse.ok) {
        // Return 404 with proper headers for SEO
        return new Response('Article not found', { 
          status: 404,
          headers: { 
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-cache'
          }
        });
      }
      
      const html = await backendResponse.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, s-maxage=3600, max-age=300, stale-while-revalidate=86400',
          'vary': 'User-Agent',
        },
      });
    } catch (error) {
      console.error('[Edge Function] Backend error:', error);
      return new Response('Service temporarily unavailable', { 
        status: 503,
        headers: { 
          'content-type': 'text/html; charset=utf-8',
          'retry-after': '60'
        }
      });
    }
  }
  
  // For real users: serve React app shell
  try {
    const appResponse = await fetch('https://theageofgenz.com/index.html', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!appResponse.ok) {
      throw new Error('Failed to fetch app shell');
    }
    
    const html = await appResponse.text();
    
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('[Edge Function] App shell error:', error);
    
    // Fallback: minimal HTML shell
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Age of Gen Z</title>
    <script>
        // Redirect to main site if edge function fails
        window.location.href = 'https://theageofgenz.com/article/${encodeURIComponent(slug)}';
    </script>
</head>
<body>
    <p>Loading...</p>
</body>
</html>`;
    
    return new Response(fallbackHtml, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache',
      },
    });
  }
}