export default async function handler(req, res) {
  const { slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  
  // Join slug array into a single string
  const articleSlug = Array.isArray(slug) ? slug.join('/') : slug;
  
  console.log(`[Article Function] Slug: ${articleSlug}`);
  console.log(`[Article Function] User-Agent: ${userAgent}`);
  
  // Check if it's a bot/crawler
  const isCrawler = /bot|crawler|spider|crawling|facebook|twitter|whatsapp|telegram|slack|discord|pinterest|tumblr|linkedin|twitterbot|facebookexternalhit/i.test(userAgent);
  
  if (!isCrawler) {
    console.log('[Article Function] Not a crawler, redirecting to React app');
    return res.redirect(301, `https://theageofgenz.com/article/${articleSlug}`);
  }
  
  try {
    console.log(`[Article Function] Fetching from backend: ${articleSlug}`);
    
    const backendUrl = `https://ageofgenz-backend.onrender.com/article/${articleSlug}`;
    const response = await fetch(backendUrl, {
      headers: {
        'User-Agent': userAgent,
      },
    });
    
    if (!response.ok) {
      console.log(`[Article Function] Backend error: ${response.status}`);
      return res.redirect(301, `https://theageofgenz.com/article/${articleSlug}`);
    }
    
    const html = await response.text();
    
    console.log(`[Article Function] Success! HTML length: ${html.length}`);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('[Article Function] Error:', error);
    return res.redirect(301, `https://theageofgenz.com/article/${articleSlug}`);
  }
}