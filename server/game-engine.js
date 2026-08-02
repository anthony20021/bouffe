import { THEMES } from './product-catalog.js'

const shuffle = (items, random) => [...items].sort(() => random() - 0.5)

export class GameEngine {
  constructor({ catalog, random = Math.random, maxRounds = 5 } = {}) {
    this.catalog = catalog
    this.random = random
    this.maxRounds = maxRounds
    this.reset()
  }

  reset() {
    this.phase = 'lobby'
    this.round = 0
    this.activePlayerId = null
    this.theme = null
    this.referenceProduct = null
    this.availableProducts = []
    this.usedProductIds = new Set()
    this.proposals = []
    this.pendingProposal = null
    this.maxAttempts = 0
    this.result = null
    this.scores = {}
  }

  async start(playerIds) {
    if (playerIds.length !== 2) throw new Error('Deux joueurs sont nécessaires pour commencer.')
    this.reset()
    this.playerIds = [...playerIds]
    this.scores = Object.fromEntries(playerIds.map((id) => [id, 0]))
    this.round = 1
    this.activePlayerId = playerIds[0]
    await this.startRound()
  }

  async startRound() {
    let choice = null
    for (const theme of shuffle(THEMES, this.random)) {
      const products = await this.catalog.getByTheme(theme)
      const available = products.filter((product) => !this.usedProductIds.has(product.id))
      if (available.length >= 2) {
        choice = { theme, available }
        break
      }
    }
    if (!choice) {
      this.phase = 'game_over'
      this.result = { type: 'no_products', message: 'Il ne reste plus assez de produits pour lancer une manche.' }
      return
    }
    const reference = choice.available[Math.floor(this.random() * choice.available.length)]
    this.theme = choice.theme
    this.referenceProduct = reference
    this.usedProductIds.add(reference.id)
    this.availableProducts = choice.available.filter((product) => product.id !== reference.id)
    this.proposals = []
    this.pendingProposal = null
    this.maxAttempts = Math.min(5, this.availableProducts.length)
    this.result = null
    this.phase = 'selecting'
  }

  selectProduct(playerId, productId) {
    if (this.phase !== 'selecting') throw new Error('Aucune proposition n’est attendue.')
    if (playerId !== this.activePlayerId) throw new Error('Ce n’est pas votre tour.')
    const product = this.availableProducts.find((item) => item.id === productId)
    if (!product || this.usedProductIds.has(productId)) throw new Error('Ce produit n’est plus disponible.')
    this.usedProductIds.add(product.id)
    this.availableProducts = this.availableProducts.filter((item) => item.id !== product.id)
    this.pendingProposal = product
    this.proposals.push({ product, preferred: null })
    this.phase = 'awaiting_vote'
  }

  answerPreference(playerId, prefersProposal) {
    if (this.phase !== 'awaiting_vote') throw new Error('Aucun vote n’est attendu.')
    if (playerId === this.activePlayerId) throw new Error('Le joueur actif ne peut pas voter.')
    if (typeof prefersProposal !== 'boolean') throw new Error('La réponse est invalide.')
    const proposal = this.proposals.at(-1)
    proposal.preferred = prefersProposal
    this.pendingProposal = null
    if (prefersProposal) {
      this.scores[this.activePlayerId] += 1
      this.phase = 'round_result'
      this.result = { type: 'win', message: `${proposal.product.name} est préféré !` }
      return
    }
    if (this.proposals.length >= this.maxAttempts) {
      this.phase = 'round_result'
      this.result = { type: 'loss', message: 'Aucune proposition n’a été préférée.' }
      return
    }
    this.phase = 'selecting'
  }

  async nextRound(playerId) {
    if (this.phase !== 'round_result') throw new Error('La manche n’est pas terminée.')
    if (!this.playerIds.includes(playerId)) throw new Error('Joueur inconnu.')
    if (this.round >= this.maxRounds) {
      this.phase = 'game_over'
      const [first, second] = this.playerIds
      const winnerId = this.scores[first] === this.scores[second] ? null : this.scores[first] > this.scores[second] ? first : second
      this.result = { type: 'final', winnerId, message: winnerId ? 'Partie terminée.' : 'Égalité parfaite !' }
      return
    }
    this.round += 1
    this.activePlayerId = this.playerIds.find((id) => id !== this.activePlayerId)
    await this.startRound()
  }

  state() {
    return {
      phase: this.phase, round: this.round, maxRounds: this.maxRounds, activePlayerId: this.activePlayerId,
      theme: this.theme, referenceProduct: this.referenceProduct, availableProducts: this.availableProducts,
      proposals: this.proposals, pendingProposal: this.pendingProposal, maxAttempts: this.maxAttempts,
      attemptsRemaining: Math.max(0, this.maxAttempts - this.proposals.length), result: this.result, scores: this.scores,
    }
  }
}
