# Tchateur

Jeu Vue 3 pour deux personnes : trouvez le produit alimentaire que l’autre préfère, à partir de produits réels d’Open Food Facts.

## Démarrer

```bash
npm install
copy .env.example .env
npm run server
npm run dev
```

Lancez le serveur WebSocket dans un terminal et Vite dans un second. Définissez `VITE_WS_URL` dans `.env` si le serveur n’est pas sur `ws://localhost:3000`.
Avant une mise en ligne, configurez aussi `OFF_USER_AGENT` avec le nom, la version et un moyen de contact de votre application, comme demandé par Open Food Facts.

```bash
npm test
npm run build
```

## Règles

- La partie compte cinq manches et le créateur la démarre lorsque les deux joueurs sont connectés.
- Un thème et un produit de référence sont tirés aléatoirement à chaque manche.
- Le joueur actif peut faire jusqu’à cinq propositions ; l’autre joueur vote.
- Un produit (identifié par son code-barres) ne peut être utilisé qu’une fois pendant toute la partie.
- L’état de jeu est validé par le serveur WebSocket ; le pseudo et le dernier salon sont mémorisés localement pour faciliter une reconnexion.

## Données produits

Les produits sont fournis par [Open Food Facts](https://world.openfoodfacts.org/) sous licence ODbL. Pour chaque manche, le serveur ne récupère qu’un échantillon de 60 produits correspondant à une seule catégorie française, puis le conserve en cache pour toute la partie. Il ne télécharge donc jamais le catalogue complet et fournit l’identification demandée par leur API.

## Protocole WebSocket attendu

Le client envoie des objets JSON :

```json
{ "type": "create_room", "roomCode": "ABC123", "name": "Alex" }
{ "type": "join_room", "roomCode": "ABC123", "name": "Sam" }
{ "type": "game_start" }
{ "type": "select_product", "productId": "barcode" }
{ "type": "answer_preference", "prefersProposal": true }
{ "type": "next_round" }
```

Le serveur répond avec `room_created`, `room_joined`, `game_state`, `game_over` ou `game_error`.
