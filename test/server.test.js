import test from 'node:test'
import assert from 'node:assert/strict'
import { WebSocket } from 'ws'
import { createGameServer } from '../server/server.js'

const products = Array.from({ length: 7 }, (_, index) => ({ id: `p${index}`, name: `Produit ${index}`, brand: 'Marque', theme: 'boissons', imageUrl: '', active: true }))
const catalog = { getByTheme: async () => products }

function openClient(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    const messages = []
    socket.on('message', (raw) => messages.push(JSON.parse(raw.toString())))
    socket.once('open', () => resolve({ socket, messages }))
    socket.once('error', reject)
  })
}
async function waitFor(client, type, predicate = () => true) {
  for (let index = 0; index < 30; index += 1) {
    const found = client.messages.find((message) => message.type === type && predicate(message))
    if (found) return found
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error(`Message ${type} non reçu`)
}

test('le serveur synchronise la room et protège le démarrage', async () => {
  const server = createGameServer({ port: 0, catalog })
  await new Promise((resolve) => server.once('listening', resolve))
  const port = server.address().port
  const first = await openClient(`ws://127.0.0.1:${port}`)
  first.socket.send(JSON.stringify({ type: 'create_room', name: 'Alex', playerId: 'one' }))
  const created = await waitFor(first, 'room_created')
  const second = await openClient(`ws://127.0.0.1:${port}`)
  second.socket.send(JSON.stringify({ type: 'join_room', roomCode: created.roomCode, name: 'Sam', playerId: 'two' }))
  await waitFor(second, 'room_joined')
  second.socket.send(JSON.stringify({ type: 'game_start' }))
  const rejected = await waitFor(second, 'game_error')
  assert.match(rejected.message, /créateur/)
  first.socket.send(JSON.stringify({ type: 'game_start' }))
  const state = await waitFor(first, 'game_state', (message) => message.state.phase === 'selecting')
  assert.equal(state.state.phase, 'selecting')
  assert.equal(state.players.length, 2)
  first.socket.close(); second.socket.close()
  await new Promise((resolve) => server.close(resolve))
})
