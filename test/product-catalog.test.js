import test from 'node:test'
import assert from 'node:assert/strict'
import { ProductCatalog, THEMES } from '../server/product-catalog.js'

test('le catalogue utilise une sélection locale si Open Food Facts est indisponible', async () => {
  const catalog = new ProductCatalog({ fetchImpl: async () => ({ ok: false, status: 503 }) })
  const products = await catalog.getByTheme(THEMES[0])
  assert.equal(products.length >= 2, true)
  assert.equal(products[0].id.startsWith('fallback-boissons-'), true)
})
