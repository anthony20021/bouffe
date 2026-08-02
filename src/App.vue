<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ChatSocket } from './services/socket'

const socket = new ChatSocket()
const screen = ref('home')
const name = ref(localStorage.getItem('tchateur:name') || '')
const roomCode = ref(localStorage.getItem('tchateur:room') || '')
const playerId = localStorage.getItem('tchateur:player') || crypto.randomUUID()
localStorage.setItem('tchateur:player', playerId)
const players = ref([])
const game = ref(null)
const error = ref('')
const loading = ref(false)
const selectedProductId = ref('')
const message = ref('')
const messages = ref([])

const normalizedCode = computed(() => roomCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
const canEnter = computed(() => name.value.trim().length >= 2 && (screen.value === 'create' || normalizedCode.value.length >= 4))
const me = computed(() => players.value.find((player) => player.id === playerId))
const activePlayer = computed(() => players.value.find((player) => player.id === game.value?.activePlayerId))
const isCreator = computed(() => game.value && players.value.some((player) => player.id === playerId) && game.value.creatorId === playerId)
const isActive = computed(() => game.value?.activePlayerId === playerId)
const isVoter = computed(() => game.value?.phase === 'awaiting_vote' && !isActive.value)
const canStart = computed(() => isCreator.value && players.value.filter((player) => player.connected).length === 2)

function saveSession() {
  localStorage.setItem('tchateur:name', name.value.trim())
  localStorage.setItem('tchateur:room', roomCode.value)
}
function applyState(data) {
  roomCode.value = data.roomCode || roomCode.value
  players.value = data.players || []
  game.value = { ...data.state, creatorId: data.creatorId }
  screen.value = game.value.phase === 'lobby' ? 'lobby' : 'game'
  saveSession()
}
const unsubscribe = socket.onMessage((data) => {
  if (['room_created', 'room_joined', 'game_state', 'game_over'].includes(data.type)) applyState(data)
  if (data.type === 'game_error') error.value = data.message
  if (data.type === 'chat_message') messages.value.push({ ...data, mine: data.author === name.value.trim() })
})

async function enterRoom(mode) {
  error.value = ''; loading.value = true
  try {
    await socket.connect()
    socket.send(mode === 'create' ? 'create_room' : 'join_room', { roomCode: mode === 'create' ? undefined : normalizedCode.value, name: name.value.trim(), playerId })
  } catch (err) { error.value = err.message || 'Serveur inaccessible.' } finally { loading.value = false }
}
function send(type, payload = {}) { error.value = ''; try { socket.send(type, payload) } catch (err) { error.value = err.message } }
function startGame() { send('game_start') }
function submitProduct() { if (selectedProductId.value) { send('select_product', { productId: selectedProductId.value }); selectedProductId.value = '' } }
function vote(prefersProposal) { send('answer_preference', { prefersProposal }) }
function nextRound() { send('next_round') }
function sendChat() { if (message.value.trim()) { send('chat_message', { author: name.value.trim(), text: message.value }); message.value = '' } }
function leaveRoom() { socket.disconnect(); game.value = null; players.value = []; messages.value = []; localStorage.removeItem('tchateur:room'); screen.value = 'home' }
onBeforeUnmount(() => { unsubscribe(); socket.disconnect() })
</script>

<template>
  <main class="app-shell">
    <header class="topbar"><button class="brand" @click="leaveRoom">tch<span>•</span>ateur</button><span v-if="roomCode" class="room-pill">SALON {{ roomCode }}</span></header>

    <section v-if="screen === 'home' || screen === 'create' || screen === 'join'" class="welcome">
      <div class="hero-copy"><p class="eyebrow">JEU À DEUX · PRODUITS RÉELS</p><h1>Trouve le produit<br /><em>qu’il préfère.</em></h1><p class="subtitle">Défiez-vous autour de boissons, bonbons, biscuits et bien plus encore.</p></div>
      <div v-if="screen === 'home'" class="choice-grid"><button class="choice-card primary" @click="screen = 'create'"><span class="choice-icon">+</span><strong>Créer une partie</strong><small>Inviter une personne avec un code</small></button><button class="choice-card" @click="screen = 'join'"><span class="choice-icon">→</span><strong>Rejoindre</strong><small>J’ai déjà un code de salon</small></button></div>
      <form v-else class="room-form" @submit.prevent="enterRoom(screen)"><button class="back" type="button" @click="screen = 'home'">← Retour</button><h2>{{ screen === 'create' ? 'Créer une partie' : 'Rejoindre une partie' }}</h2><label>Votre pseudo<input v-model="name" maxlength="24" placeholder="Ex. Alex" /></label><label v-if="screen === 'join'">Code du salon<input v-model="roomCode" maxlength="6" placeholder="ABC123" class="code-input" /></label><p v-if="error" class="error">{{ error }}</p><button class="submit" :disabled="!canEnter || loading">{{ loading ? 'Connexion…' : 'Continuer' }}</button></form>
    </section>

    <section v-else-if="screen === 'lobby'" class="lobby-card">
      <p class="eyebrow">SALLE D’ATTENTE</p><h1>Partage le code <b>{{ roomCode }}</b></h1><p>La partie commence quand vous êtes deux.</p>
      <div class="players"><div v-for="player in players" :key="player.id" class="player"><span :class="{ online: player.connected }">●</span>{{ player.name }} <small v-if="player.id === game?.creatorId">créateur</small></div><div v-if="players.length < 2" class="player waiting">● En attente d’un joueur…</div></div>
      <p v-if="error" class="error">{{ error }}</p><button v-if="isCreator" class="submit" :disabled="!canStart" @click="startGame">Démarrer la partie</button><p v-else class="wait-note">Le créateur lancera la partie dès votre arrivée.</p><div class="mini-chat"><article v-for="(item, index) in messages" :key="index" :class="{ mine: item.mine }"><b>{{ item.author }}</b> {{ item.text }}</article><form @submit.prevent="sendChat"><input v-model="message" placeholder="Écrire un message…" /><button>↑</button></form></div>
    </section>

    <section v-else class="game-layout">
      <aside class="scoreboard"><p class="eyebrow">MANCHE {{ game.round }}/{{ game.maxRounds }}</p><h2>{{ game.theme?.label }}</h2><div v-for="player in players" :key="player.id" class="score" :class="{ current: player.id === game.activePlayerId }"><span>{{ player.name }}</span><b>{{ game.scores[player.id] || 0 }}</b></div><button class="leave" @click="leaveRoom">Quitter</button></aside>
      <div class="game-panel">
        <div class="reference"><p class="eyebrow">PRODUIT DE RÉFÉRENCE</p><img v-if="game.referenceProduct?.imageUrl" :src="game.referenceProduct.imageUrl" alt="" /><div><h1>{{ game.referenceProduct?.name }}</h1><p>{{ game.referenceProduct?.brand }}</p></div></div>
        <p v-if="error" class="error">{{ error }}</p>
        <template v-if="game.phase === 'selecting'">
          <div v-if="isActive"><h2>À toi de jouer</h2><p class="hint">Trouve un produit que {{ players.find(p => p.id !== playerId)?.name }} préfère davantage. {{ game.attemptsRemaining }} essai(s) restant(s).</p><div class="product-grid"><button v-for="product in game.availableProducts" :key="product.id" class="product" :class="{ selected: selectedProductId === product.id }" @click="selectedProductId = product.id"><img v-if="product.imageUrl" :src="product.imageUrl" alt="" /><strong>{{ product.name }}</strong><small>{{ product.brand }}</small></button></div><button class="submit" :disabled="!selectedProductId" @click="submitProduct">Proposer ce produit</button></div><div v-else class="center-state"><h2>{{ activePlayer?.name }} cherche le produit idéal…</h2><p>Prépare ton choix : tu devras voter.</p></div>
        </template>
        <template v-else-if="game.phase === 'awaiting_vote'">
          <div class="vote-card"><p class="eyebrow">NOUVELLE PROPOSITION</p><h2>{{ game.pendingProposal?.name }}</h2><p>{{ game.pendingProposal?.brand }}</p><template v-if="isVoter"><p>Lequel préfères-tu ?</p><button class="vote secondary" @click="vote(false)">Je préfère {{ game.referenceProduct?.name }}</button><button class="vote" @click="vote(true)">Je préfère {{ game.pendingProposal?.name }}</button></template><p v-else class="wait-note">{{ players.find(p => p.id !== playerId)?.name }} est en train de voter…</p></div>
        </template>
        <template v-else-if="game.phase === 'round_result'"><div class="center-state"><p class="eyebrow">RÉSULTAT</p><h2>{{ game.result?.message }}</h2><p v-if="game.result?.type === 'loss'">Les produits refusés : {{ game.proposals.map(p => p.product.name).join(', ') }}</p><button class="submit" @click="nextRound">Manche suivante</button></div></template>
        <template v-else-if="game.phase === 'game_over'"><div class="center-state"><p class="eyebrow">PARTIE TERMINÉE</p><h2>{{ game.result?.winnerId ? `${players.find(p => p.id === game.result.winnerId)?.name} gagne !` : 'Égalité !' }}</h2><p>{{ game.result?.message }}</p><button class="submit" @click="leaveRoom">Nouvelle partie</button></div></template>
        <div class="mini-chat"><article v-for="(item, index) in messages" :key="index" :class="{ mine: item.mine }"><b>{{ item.author }}</b> {{ item.text }}</article><form @submit.prevent="sendChat"><input v-model="message" placeholder="Discuter…" /><button>↑</button></form></div><p class="attribution">Données produits : Open Food Facts (ODbL).</p>
      </div>
    </section>
  </main>
</template>
