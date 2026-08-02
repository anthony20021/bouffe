const socketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

export class ChatSocket {
  constructor() {
    this.socket = null
    this.listeners = new Set()
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve()
    if (this.socket?.readyState === WebSocket.CONNECTING) {
      return new Promise((resolve, reject) => {
        this.socket.addEventListener('open', resolve, { once: true })
        this.socket.addEventListener('error', reject, { once: true })
      })
    }

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(socketUrl)
      this.socket.addEventListener('open', () => resolve(), { once: true })
      this.socket.addEventListener('error', () => reject(new Error('Connexion au serveur impossible.')), { once: true })
      this.socket.addEventListener('message', (event) => {
        try {
          this.listeners.forEach((listener) => listener(JSON.parse(event.data)))
        } catch {
          // Les messages invalides sont ignorés pour garder le chat stable.
        }
      })
    })
  }

  send(type, payload = {}) {
    if (this.socket?.readyState !== WebSocket.OPEN) throw new Error('WebSocket non connecté.')
    this.socket.send(JSON.stringify({ type, ...payload }))
  }

  onMessage(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  disconnect() {
    this.socket?.close()
    this.socket = null
  }
}
