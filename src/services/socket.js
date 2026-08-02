import { createClient } from '@supabase/supabase-js'
import { GameEngine } from '../../server/game-engine.js'
import { ProductCatalog } from '../../server/product-catalog.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const code = () => Math.random().toString(36).slice(2, 8).toUpperCase()

// Realtime seul : le créateur de la room exécute les règles et publie l’état.
// Aucune clé secrète n’est présente dans le navigateur.
export class ChatSocket {
  constructor() { this.listeners = new Set(); this.channel = null; this.host = false; this.players = new Map(); this.engine = null; this.roomCode = '' }
  onMessage(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  emit(data) { this.listeners.forEach((listener) => listener(data)) }
  connect() {
    if (!url || !key) return Promise.reject(new Error('Configure VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans .env.'))
    this.supabase ||= createClient(url, key)
    return Promise.resolve()
  }
  async subscribe(roomCode, playerId) {
    this.roomCode = roomCode
    this.channel?.unsubscribe()
    this.channel = this.supabase.channel(`tchateur:${roomCode}`, { config: { broadcast: { self: false } } })
    this.channel.on('broadcast', { event: 'command' }, ({ payload }) => this.receiveCommand(payload))
    this.channel.on('broadcast', { event: 'chat' }, ({ payload }) => this.emit({ type: 'chat_message', ...payload }))
    this.channel.on('broadcast', { event: 'state' }, ({ payload }) => { if (!this.host) this.emit(payload) })
    await new Promise((resolve, reject) => this.channel.subscribe((status) => status === 'SUBSCRIBED' ? resolve() : status === 'CHANNEL_ERROR' && reject(new Error('Connexion Supabase Realtime impossible.'))))
    this.playerId = playerId
  }
  snapshot(type = 'game_state') {
    return { type, roomCode: this.roomCode, creatorId: this.creatorId, players: [...this.players.values()], state: this.engine?.state() || { phase: 'lobby', scores: {} } }
  }
  publish(type = 'game_state') { const state = this.snapshot(type); this.emit(state); this.channel.send({ type: 'broadcast', event: 'state', payload: state }) }
  async send(type, payload = {}) {
    if (type === 'create_room') {
      this.host = true; this.creatorId = payload.playerId; this.players.set(payload.playerId, { id: payload.playerId, name: payload.name, connected: true })
      await this.subscribe(code(), payload.playerId); this.engine = new GameEngine({ catalog: new ProductCatalog({ apiUrl: '/api/products' }) }); this.emit(this.snapshot('room_created')); return
    }
    if (type === 'join_room') {
      this.host = false; await this.subscribe(payload.roomCode, payload.playerId); await this.channel.send({ type: 'broadcast', event: 'command', payload: { type: 'join_room', ...payload } }); return
    }
    if (type === 'chat_message') {
      const chat = { author: payload.author, text: String(payload.text || '').trim().slice(0, 500), time: new Date().toISOString() }
      if (!chat.text) return
      this.emit({ type: 'chat_message', ...chat })
      return this.channel.send({ type: 'broadcast', event: 'chat', payload: chat })
    }
    if (this.host) return this.apply(type, payload, this.playerId)
    return this.channel.send({ type: 'broadcast', event: 'command', payload: { type, ...payload, playerId: this.playerId } })
  }
  async receiveCommand(message) {
    if (!this.host) return
    if (message.type === 'join_room') {
      if (!this.players.has(message.playerId) && this.players.size >= 2) return
      this.players.set(message.playerId, { id: message.playerId, name: message.name, connected: true }); this.publish('room_joined'); return
    }
    await this.apply(message.type, message, message.playerId)
  }
  async apply(type, payload, playerId) {
    try {
      if (type === 'game_start') { if (playerId !== this.creatorId) throw new Error('Seul le créateur peut démarrer.'); await this.engine.start([...this.players.keys()]) }
      else if (type === 'select_product') this.engine.selectProduct(playerId, payload.productId)
      else if (type === 'answer_preference') this.engine.answerPreference(playerId, payload.prefersProposal)
      else if (type === 'next_round') await this.engine.nextRound(playerId)
      else throw new Error('Action inconnue.')
      this.publish(this.engine.phase === 'game_over' ? 'game_over' : 'game_state')
    } catch (error) { this.emit({ type: 'game_error', message: error.message }); this.channel.send({ type: 'broadcast', event: 'state', payload: { type: 'game_error', message: error.message } }) }
  }
  disconnect() { this.channel?.unsubscribe(); this.channel = null }
}
