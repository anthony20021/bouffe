export default async function handler(request, response) {
  const query = new URLSearchParams(request.query)
  query.set('fields', 'code,product_name,product_name_fr,brands,image_front_small_url')
  query.set('page_size', '60')
  try {
    const upstream = await fetch(`https://search.openfoodfacts.org/search?${query}`, { headers: { 'User-Agent': process.env.OFF_USER_AGENT || 'Tchateur/1.0 (https://tchateur.vercel.app)' } })
    if (!upstream.ok) {
      console.error('OFF upstream error', upstream.status, await upstream.text().catch(() => ''))
      return response.status(upstream.status).json({ hits: [] })
    }
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return response.status(200).json(await upstream.json())
  } catch (err) {
    console.error('OFF proxy failed', err)
    return response.status(503).json({ hits: [] })
  }
}
