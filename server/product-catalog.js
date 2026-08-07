const API_URL = 'https://search.openfoodfacts.org/search'

export const THEMES = [
  { id: 'boissons', label: 'Boissons', category: 'beverages' },
  { id: 'biscuits', label: 'Biscuits', category: 'biscuits-and-cakes' },
  { id: 'chips', label: 'Chips', category: 'crisps' },
  { id: 'chocolats', label: 'Chocolats', category: 'chocolates' },
  { id: 'bonbons', label: 'Bonbons', category: 'candies' },
  { id: 'cereales', label: 'Céréales', category: 'breakfast-cereals' },
  { id: 'fast_food', label: 'Fast-food', category: 'fast-food' },
]

const FALLBACK_BY_THEME = {
  boissons: ['Coca-Cola Zéro|Coca-Cola', 'Pepsi Max|Pepsi', 'Fanta Citron Frappé|Coca-Cola', 'Sprite Citron Vert|Coca-Cola', 'Orangina Rouge|Suntory', 'Oasis Pomme Cassis Framboise|Suntory', 'Lipton Ice Tea Framboise|Lipton', 'Schweppes Indian Tonic|Schweppes', '7 Up Free|PepsiCo', 'Dr Pepper Cherry|Keurig', 'Fuze Tea Pêche Hibiscus|Coca-Cola', 'Tropicana Multivitaminé|Tropicana', 'Minute Maid Orange|Coca-Cola', 'Volvic Thé Vert Menthe|Danone', 'Perrier Citron|Nestlé', 'San Pellegrino|San Pellegrino', 'Red Bull Sugarfree|Red Bull', 'Monster Ultra|Monster', 'Vittel Fruits Rouges|Nestlé', 'Badoit Rouge|Danone'],
  biscuits: ['Prince Goût Vanille|LU', 'Oreo Golden|Mondelez', 'Granola Cookies|LU', 'Pépito Pépites|LU', 'Sablés Chocolat|Bonne Maman', 'Palmito Chocolat|LU', 'Mikado Daim|Mondelez', 'BN Fraise|BN', 'Savane Chocolat|Brossard', 'Madeleines Coquilles|St Michel', 'Napolitain Chocolat|LU', 'Barquettes Abricot|LU', 'Kinder Pingui|Ferrero', 'Pitch Fraise|Brioche Pasquier', 'Pim’s Framboise|LU', 'Lotus Biscoff|Lotus', 'Galettes Bretonnes|St Michel', 'Belvita Chocolat|LU', 'Kango Noisette|LU', 'Figolu Figue|LU'],
  chips: ['Chips Méditerranéennes|Lay’s', 'Chips Poulet Rôti|Lay’s', 'Curly Cacahuète|Vico', '3D’s Paprika|3D’s', 'Pringles Hot Spicy|Pringles', 'Monster Munch Flamin Hot|Vico', 'Doritos Sweet Chili|Doritos', 'Chips Vinaigre|Vico', 'Chips Paysannes Fromage|Vico', 'Chips Sel de Guérande|Brets', 'Pringles Cheddar|Pringles', 'Pringles Pizza|Pringles', 'Bugles Original|Bugles', 'Croustilles Nature|Vico', 'Chips Barbecue|Brets', 'Chips Curry|Brets', 'Chips Truffe|Brets', 'Tortilla Paprika|Doritos', 'Tortilla Fromage|Doritos', 'Curly Donuts Paprika|Vico'],
  chocolats: ['Kinder Bueno White|Ferrero', 'Snickers Crisp|Mars', 'Twix White|Mars', 'Lion Blanc|Nestlé', 'KitKat Chunky|Nestlé', 'Crunch Blanc|Nestlé', 'Milka Oreo|Milka', 'Toblerone Blanc|Mondelez', 'Kinder Country Dark|Ferrero', 'Kinder Maxi King|Ferrero', 'Mars Protein|Mars', 'Bounty Dark|Mars', 'M&M’s Crispy|Mars', 'Maltesers|Mars', 'Côte d’Or Noir|Mondelez', 'Lindt Excellence|Lindt', 'Raffaello|Ferrero', 'After Eight Orange|Nestlé', 'Galak Cookie|Nestlé', 'Daim Mini|Mondelez'],
  bonbons: ['Dragibus Soft|Haribo', 'Tagada Purple|Haribo', 'Schtroumpfs Pik|Haribo', 'Carambar Atomic|Carambar', 'Lutti Scoubidou|Lutti', 'Skittles Crazy Sours|Mars', 'Mentos Rainbow|Perfetti', 'Malabar Tutti Frutti|Carambar', 'Crocodiles Pik|Haribo', 'Happy Cherries|Haribo', 'Rotella Réglisse|Haribo', 'Chamallows|Haribo', 'Arlequin Original|Lutti', 'Bubblizz Cola|Lutti', 'Dents de la Mer|Lutti', 'Têtes Brûlées Billes|Verquin', 'Krema Batna|Krema', 'Sour Patch Watermelon|Mondelez', 'Halls Extra Strong|Mondelez', 'Pastilles La Vosgienne|La Vosgienne'],
  cereales: ['Trésor Chocolat|Kellogg’s', 'Miel Pops|Kellogg’s', 'Chocapic|Nestlé', 'Lion Céréales|Nestlé', 'Cookie Crisp|Nestlé', 'Crunch Céréales|Nestlé', 'Special K|Kellogg’s', 'Golden Grahams|Nestlé', 'Frosties|Kellogg’s', 'Corn Flakes|Kellogg’s', 'Coco Pops|Kellogg’s', 'Smacks|Kellogg’s', 'Fitness Nature|Nestlé', 'Nesquik|Nestlé', 'Cheerios Miel|Nestlé', 'Weetabix Original|Weetabix', 'Muesli Croustillant|Jordans', 'Quaker Oats|Quaker', 'Lucky Charms|General Mills', 'Cinnamon Toast Crunch|General Mills'],
  fast_food: ['Big Mac|McDonald’s', 'Whopper|Burger King', 'McChicken|McDonald’s', 'Double Cheese|McDonald’s', 'Wrap Chicken|McDonald’s', 'Bucket Original|KFC', 'Tenders|KFC', 'Bacon King|Burger King', 'Royal Cheese|McDonald’s', 'Filet-O-Fish|McDonald’s', 'McNuggets|McDonald’s', 'CBO|McDonald’s', 'Big Tasty|McDonald’s', 'Big King|Burger King', 'Long Chicken|Burger King', 'Chicken Royale|Burger King', 'Zinger Burger|KFC', 'Boxmaster|KFC', 'Hot Wings|KFC', 'Chicken Bucket|KFC'],
}

function fallbackProducts(theme) {
  return (FALLBACK_BY_THEME[theme.id] || []).map((entry, index) => {
    const [name, brand] = entry.split('|')
    return { id: `fallback-${theme.id}-${index}`, name, brand, theme: theme.id, imageUrl: '', active: true }
  })
}

export class ProductCatalog {
  constructor({ fetchImpl = (...args) => fetch(...args), apiUrl = API_URL } = {}) {
    this.fetchImpl = fetchImpl
    this.apiUrl = apiUrl
    this.cache = new Map()
  }

  async getByTheme(theme) {
    if (!this.cache.has(theme.id)) {
      this.cache.set(theme.id, this.fetchTheme(theme).catch((err) => {
        console.warn(`Catalogue OFF indisponible pour "${theme.id}", repli local :`, err.message)
        return fallbackProducts(theme)
      }))
    }
    return this.cache.get(theme.id)
  }

  async fetchTheme(theme) {
    const params = new URLSearchParams({
      q: `categories_tags:"en:${theme.category}" AND countries_tags:"en:france"`,
      fields: 'code,product_name,product_name_fr,brands,image_front_small_url',
      // Un petit échantillon suffit pour une manche (5 essais maximum) et évite
      // de balayer inutilement les millions de fiches Open Food Facts.
      page_size: '60',
    })
    const response = await this.fetchImpl(`${this.apiUrl}?${params}`, {
      headers: { 'User-Agent': globalThis.process?.env?.OFF_USER_AGENT || 'Tchateur/1.0 (https://github.com/your-org/tchateur)' },
    })
    if (!response.ok) throw new Error(`La liste des produits est temporairement indisponible (HTTP ${response.status}).`)
    const data = await response.json()
    const known = new Set()

    return (data.hits || []).flatMap((item) => {
      const name = (item.product_name_fr || item.product_name || '').trim()
      const brand = (Array.isArray(item.brands) ? item.brands[0] : (item.brands || '').split(',')[0]).trim()
      if (!item.code || !name || !brand || known.has(item.code)) return []
      known.add(item.code)
      return [{ id: item.code, name, brand, theme: theme.id, imageUrl: item.image_front_small_url || '', active: true }]
    })
  }
}
