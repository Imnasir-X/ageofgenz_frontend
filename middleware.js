export const config = {
  matcher: '/article/:path*',
}

export default async function middleware(request) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if it's a bot/crawler
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp|telegram|twitter|linkedinbot/i.test(userAgent);
  
  console.log(`Middleware: ${pathname}, User-Agent: ${userAgent.substring(0, 50)}, IsBot: ${isBot}`);
  
  if (isBot && pathname.startsWith('/article/')) {
    // For bots, fetch from backend
    const backendUrl = `https://ageofgenz-backend.onrender.com${pathname}`;
    
    try {
      const response = await fetch(backendUrl, {
        headers: {
          'user-agent': userAgent,
        },
      });
      
      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 's-maxage=3600, stale-while-revalidate',
          },
        });
      }
    } catch (error) {
      console.error('Middleware error:', error);
    }
  }
  
  // For non-bots or errors, continue normally
  return;
}