const API_URL = 'https://world.openfoodfacts.org/api/v2/search'

export const THEMES = [
  { id: 'boissons', label: 'Boissons', category: 'beverages' },
  { id: 'biscuits', label: 'Biscuits', category: 'biscuits-and-cakes' },
  { id: 'chips', label: 'Chips', category: 'crisps' },
  { id: 'chocolats', label: 'Chocolats', category: 'chocolates' },
  { id: 'bonbons', label: 'Bonbons', category: 'candies' },
  { id: 'cereales', label: 'Céréales', category: 'breakfast-cereals' },
  { id: 'fast_food', label: 'Fast-food', category: 'fast-foods' },
]

const FALLBACK_BY_THEME = {
  boissons: ['Coca-Cola|Coca-Cola', 'Pepsi|Pepsi', 'Fanta Orange|Coca-Cola', 'Sprite|Coca-Cola', 'Orangina|Suntory', 'Ice Tea Pêche|Lipton', 'Oasis Tropical|Suntory', 'Schweppes Agrumes|Schweppes', '7 Up Mojito|PepsiCo', 'Dr Pepper|Keurig', 'Canada Dry|Schweppes', 'Cristaline Citron|Roxane', 'Volvic Juicy Fraise|Danone', 'Evian|Danone', 'Perrier|Nestlé', 'Vittel|Nestlé', 'Red Bull|Red Bull', 'Monster Energy|Monster', 'Badoit|Danone', 'Nestea Citron|Nestlé'],
  biscuits: ['Petit Beurre|LU', 'Prince Chocolat|LU', 'Oreo Original|Mondelez', 'Granola|LU', 'Pépito|LU', 'Sablés|Bonne Maman', 'Palmito|LU', 'Mikado|Mondelez', 'BN Chocolat|BN', 'Savane|Brossard', 'Madeleines|Bonne Maman', 'Napolitain|LU', 'Barquettes Fraise|LU', 'Kinder Délice|Ferrero', 'Pitch Chocolat|Brioche Pasquier', 'Pim’s Orange|LU', 'Speculoos|Lotus', 'St Michel Galettes|St Michel', 'Belvita Miel|LU', 'Kango Chocolat|LU'],
  chips: ['Chips Nature|Lay’s', 'Chips Barbecue|Lay’s', 'Curly|Vico', '3D’s Fromage|Lay’s', 'Pringles Original|Pringles', 'Monster Munch|Vico', 'Doritos Nacho Cheese|Doritos', 'Chips Paysannes|Vico', 'Chips Fromage|Lay’s', 'Chips Sel et Vinaigre|Lay’s', 'Pringles Paprika|Pringles', 'Pringles Crème Oignon|Pringles', 'Bugles Nacho Cheese|3D’s', 'Croustilles Paprika|Vico', 'Chips Poulet Rôti|Brets', 'Chips Cheddar Jalapeño|Brets', 'Chips Ancienne|Bret’s', 'Tortilla Nature|Doritos', 'Tortilla Chili|Doritos', 'Curly Donuts|Vico'],
  chocolats: ['Kinder Bueno|Ferrero', 'Snickers|Mars', 'Twix|Mars', 'Lion|Nestlé', 'KitKat|Nestlé', 'Crunch|Nestlé', 'Milka Lait|Milka', 'Toblerone|Mondelez', 'Kinder Country|Ferrero', 'Kinder Maxi|Ferrero', 'Mars|Mars', 'Bounty|Mars', 'M&M’s Peanut|Mars', 'Milky Way|Mars', 'Côte d’Or Lait|Mondelez', 'Lindt Lait|Lindt', 'Ferrero Rocher|Ferrero', 'After Eight|Nestlé', 'Galak|Nestlé', 'Daim|Mondelez'],
  bonbons: ['Dragibus|Haribo', 'Tagada|Haribo', 'Schtroumpfs|Haribo', 'Carambar Caramel|Carambar', 'Lutti Bubblizz|Lutti', 'Skittles Fruits|Mars', 'Mentos Fruits|Perfetti', 'Malabar Fraise|Carambar', 'Croco|Haribo', 'Happy Cola|Haribo', 'Rotella|Haribo', 'Fraise Tagada Pink|Haribo', 'Arlequin|Lutti', 'Frites Acides|Lutti', 'Koala Guimauve|Lutti', 'Têtes Brûlées|Verquin', 'Krema Regal’ad|Krema', 'Sour Patch Kids|Mondelez', 'Halls Menthol|Mondelez', 'Pastilles Vichy|Vichy'],
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
  constructor({ fetchImpl = fetch, apiUrl = API_URL } = {}) {
    this.fetchImpl = fetchImpl
    this.apiUrl = apiUrl
    this.cache = new Map()
  }

  async getByTheme(theme) {
    if (!this.cache.has(theme.id)) {
      this.cache.set(theme.id, this.fetchTheme(theme).catch(() => fallbackProducts(theme)))
    }
    return this.cache.get(theme.id)
  }

  async fetchTheme(theme) {
    const params = new URLSearchParams({
      categories_tags_en: theme.category,
      countries_tags_en: 'france',
      fields: 'code,product_name,product_name_fr,brands,image_front_small_url',
      // Un petit échantillon suffit pour une manche (5 essais maximum) et évite
      // de balayer inutilement les millions de fiches Open Food Facts.
      page_size: '60',
    })
    const response = await this.fetchImpl(`${this.apiUrl}?${params}`, {
      headers: { 'User-Agent': globalThis.process?.env?.OFF_USER_AGENT || 'Tchateur/1.0 (https://github.com/your-org/tchateur)' },
    })
    if (!response.ok) throw new Error('La liste des produits est temporairement indisponible.')
    const data = await response.json()
    const known = new Set()

    return (data.products || []).flatMap((item) => {
      const name = (item.product_name_fr || item.product_name || '').trim()
      const brand = (item.brands || '').split(',')[0].trim()
      if (!item.code || !name || !brand || known.has(item.code)) return []
      known.add(item.code)
      return [{ id: item.code, name, brand, theme: theme.id, imageUrl: item.image_front_small_url || '', active: true }]
    })
  }
}
