# Tchateur

Jeu Vue 3 pour deux personnes : trouvez le produit alimentaire que l’autre préfère, à partir de produits réels d’Open Food Facts.

## Démarrer

```bash
npm install
copy .env.example .env
npm run dev
```

Supabase Realtime remplace le serveur WebSocket local : une seule commande suffit pour lancer le frontend.
Open Food Facts reste utilisé pour les produits ; le jeu bascule sur sa sélection locale si leur service limite temporairement les requêtes.

## Configuration Supabase et Vercel

1. Créez un projet sur [database.new](https://database.new/).
2. Dans Supabase, ouvrez **Settings → API** : copiez **Project URL** dans `VITE_SUPABASE_URL` et **Publishable key** dans `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Aucune clé `service_role` n’est nécessaire : cette version utilise exclusivement Supabase Realtime et la clé publishable.
4. Dans Vercel, ouvrez votre projet → **Settings → Environment Variables** et ajoutez les deux variables `VITE_…`, puis redéployez.

```bash
npm test
npm run build
```

## Règles

- La partie compte quatorze manches et le créateur la démarre lorsque les deux joueurs sont connectés.
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
