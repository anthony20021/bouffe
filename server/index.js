import { createGameServer } from './server.js'

const port = Number(process.env.PORT || 3000)
createGameServer({ port })
console.log(`Tchateur WebSocket server listening on ws://localhost:${port}`)
