import { WebSocketServer } from 'ws'
import { GameEngine } from './game-engine.js'
import { ProductCatalog } from './product-catalog.js'

const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export function createGameServer({ port = 3000, catalog = new ProductCatalog() } = {}) {
  const rooms = new Map()
  const wss = new WebSocketServer({ port })

  const payload = (room) => ({
    type: room.engine.phase === 'game_over' ? 'game_over' : 'game_state', roomCode: room.code,
    creatorId: room.creatorId,
    players: [...room.players.values()].map(({ id, name, connected }) => ({ id, name, connected })),
    state: room.engine.state(),
  })
  const broadcast = (room) => {
    const data = JSON.stringify(payload(room))
    for (const player of room.players.values()) if (player.socket?.readyState === 1) player.socket.send(data)
  }
  const sendError = (socket, message) => socket.send(JSON.stringify({ type: 'game_error', message }))
  const getRoom = (code) => rooms.get(String(code || '').toUpperCase())

  wss.on('connection', (socket) => {
    socket.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString())
        if (message.type === 'create_room') {
          const name = String(message.name || '').trim().slice(0, 24)
          const playerId = String(message.playerId || '')
          if (name.length < 2 || !playerId) throw new Error('Pseudo ou identifiant joueur invalide.')
          let code = makeCode(); while (rooms.has(code)) code = makeCode()
          const room = { code, creatorId: playerId, players: new Map(), engine: new GameEngine({ catalog }) }
          room.players.set(playerId, { id: playerId, name, connected: true, socket })
          rooms.set(code, room); socket.room = room; socket.playerId = playerId
          socket.send(JSON.stringify({ ...payload(room), type: 'room_created' }))
          return
        }
        if (message.type === 'join_room') {
          const room = getRoom(message.roomCode)
          const name = String(message.name || '').trim().slice(0, 24); const playerId = String(message.playerId || '')
          if (!room) throw new Error('Ce salon n’existe pas.')
          const existing = room.players.get(playerId)
          if (!existing && room.players.size >= 2) throw new Error('Ce salon est déjà complet.')
          if (existing) Object.assign(existing, { name, connected: true, socket })
          else room.players.set(playerId, { id: playerId, name, connected: true, socket })
          socket.room = room; socket.playerId = playerId
          socket.send(JSON.stringify({ ...payload(room), type: 'room_joined' })); broadcast(room)
          return
        }
        const room = socket.room; const playerId = socket.playerId
        if (!room || !playerId) throw new Error('Rejoignez un salon avant de jouer.')
        if (message.type === 'game_start') {
          if (playerId !== room.creatorId) throw new Error('Seul le créateur peut démarrer la partie.')
          if ([...room.players.values()].filter((player) => player.connected).length !== 2) throw new Error('Les deux joueurs doivent être connectés.')
          await room.engine.start([...room.players.keys()])
        }
        else if (message.type === 'select_product') room.engine.selectProduct(playerId, message.productId)
        else if (message.type === 'answer_preference') room.engine.answerPreference(playerId, message.prefersProposal)
        else if (message.type === 'next_round') await room.engine.nextRound(playerId)
        else throw new Error('Message inconnu.')
        broadcast(room)
      } catch (error) { sendError(socket, error.message || 'Une erreur est survenue.') }
    })
    socket.on('close', () => {
      const room = socket.room; const player = room?.players.get(socket.playerId)
      if (player) { player.connected = false; player.socket = null; broadcast(room) }
    })
  })
  return wss
}
