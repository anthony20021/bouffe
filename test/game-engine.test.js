import test from 'node:test'
import assert from 'node:assert/strict'
import { GameEngine } from '../server/game-engine.js'

const products = Array.from({ length: 7 }, (_, index) => ({ id: `p${index}`, name: `Produit ${index}`, brand: 'Marque', theme: 'boissons', imageUrl: '', active: true }))
const catalog = { getByTheme: async () => products }
const random = () => 0

test('le produit de référence et les propositions ne peuvent jamais être réutilisés', async () => {
  const game = new GameEngine({ catalog, random })
  await game.start(['a', 'b'])
  const referenceId = game.referenceProduct.id
  assert.throws(() => game.selectProduct('a', referenceId), /plus disponible/)
  const proposalId = game.availableProducts[0].id
  game.selectProduct('a', proposalId)
  game.answerPreference('b', false)
  assert.throws(() => game.selectProduct('a', proposalId), /Aucune proposition/)
  assert.equal(game.usedProductIds.has(referenceId), true)
  assert.equal(game.usedProductIds.has(proposalId), true)
})

test('une victoire attribue un point et alterne le joueur actif à la manche suivante', async () => {
  const game = new GameEngine({ catalog, random })
  await game.start(['a', 'b'])
  game.selectProduct('a', game.availableProducts[0].id)
  game.answerPreference('b', true)
  assert.equal(game.phase, 'round_result')
  assert.equal(game.scores.a, 1)
  await game.nextRound('a')
  assert.equal(game.round, 2)
  assert.equal(game.activePlayerId, 'b')
})

test('un refus termine la manche même si des essais restent', async () => {
  const shortCatalog = { getByTheme: async () => products.slice(0, 3) }
  const game = new GameEngine({ catalog: shortCatalog, random })
  await game.start(['a', 'b'])
  game.selectProduct('a', game.availableProducts[0].id)
  game.answerPreference('b', false)
  assert.equal(game.phase, 'round_result')
  assert.equal(game.result.type, 'loss')
})

test('le joueur actif ne peut pas répondre à son propre vote', async () => {
  const game = new GameEngine({ catalog, random })
  await game.start(['a', 'b'])
  game.selectProduct('a', game.availableProducts[0].id)
  assert.throws(() => game.answerPreference('a', true), /ne peut pas voter/)
})

test('une manche ne charge qu’un thème tant qu’il est jouable', async () => {
  const calls = []
  const trackedCatalog = { getByTheme: async (theme) => { calls.push(theme.id); return products } }
  const game = new GameEngine({ catalog: trackedCatalog, random })
  await game.start(['a', 'b'])
  assert.equal(calls.length, 1)
})
