export default async function handler(request, response) {
  const query = new URLSearchParams(request.query)
  query.set('fields', 'code,product_name,product_name_fr,brands,image_front_small_url')
  query.set('page_size', '60')
  try {
    const upstream = await fetch(`https://world.openfoodfacts.org/api/v2/search?${query}`, { headers: { 'User-Agent': process.env.OFF_USER_AGENT || 'Tchateur/1.0 (https://tchateur.vercel.app)' } })
    if (!upstream.ok) return response.status(upstream.status).json({ products: [] })
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return response.status(200).json(await upstream.json())
  } catch { return response.status(503).json({ products: [] }) }
}
