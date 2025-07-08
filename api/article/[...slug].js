export default async function handler(request, response) {
  // Get the full slug path
  const { slug } = request.query;
  const fullSlug = Array.isArray(slug) ? slug.join('/') : slug;
  
  // Log the request
  console.log(`[Vercel Function] Article request: /article/${fullSlug}`);
  console.log(`[Vercel Function] User-Agent: ${request.headers['user-agent']}`);
  
  try {
    // Proxy to Django backend
    const backendUrl = `https://ageofgenz-backend.onrender.com/article/${fullSlug}`;
    console.log(`[Vercel Function] Fetching from: ${backendUrl}`);
    
    const backendResponse = await fetch(backendUrl, {
      headers: {
        'user-agent': request.headers['user-agent'] || 'Vercel-Proxy/1.0',
      },
    });
    
    if (!backendResponse.ok) {
      console.log(`[Vercel Function] Backend returned: ${backendResponse.status}`);
      return response.status(backendResponse.status).send('Article not found');
    }
    
    const html = await backendResponse.text();
    console.log(`[Vercel Function] Received HTML: ${html.length} bytes`);
    
    // Send the HTML with proper headers
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.setHeader('X-Robots-Tag', 'index, follow');
    
    return response.status(200).send(html);
    
  } catch (error) {
    console.error('[Vercel Function] Error:', error);
    return response.status(500).send('Server error');
  }
}

// Configuration for the function
export const config = {
  api: {
    bodyParser: false,
  },
};