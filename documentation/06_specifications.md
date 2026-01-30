# GeoResto - Spécifications Techniques

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│  Supabase   │────▶│   Vercel    │
│ React Native│     │  (Backend)  │     │  (Edge fn)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Base de données (Supabase)

### Tables principales

- `users` : Profil, préférences, allergies
- `restaurants` : Infos, localisation, horaires
- `allergenes` : Liste allergènes standards
- `reservations` : Historique réservations
- `favorites` : Restos favoris
- `reviews` : Avis utilisateurs

### Relations

- users 1:N reservations
- users N:M restaurants (favorites)
- restaurants N:M allergenes

## API Endpoints

| Route | Méthode | Description |
|-------|---------|-------------|
| /restaurants | GET | Liste avec filtres |
| /restaurants/:id | GET | Détail restaurant |
| /reservations | POST | Créer réservation |
| /users/preferences | PUT | Màj préférences |

## Écrans principaux

1. **Home** : Carte + recherche
2. **Filtres** : Cuisine, prix, allergies
3. **Restaurant** : Fiche détaillée
4. **Réservation** : Formulaire
5. **Profil** : Préférences, historique
6. **Favoris** : Liste sauvegardée
