# GeoResto

Application mobile de recherche de restaurants avec filtrage par allergènes et préférences alimentaires.

## Fonctionnalités

- **Recherche géolocalisée** - Carte interactive avec restaurants à proximité
- **Filtres allergènes** - Profil utilisateur avec restrictions alimentaires
- **Réservations** - Réservation en un clic
- **Notifications** - Alertes promos et événements
- **Livraison** - Intégration UberEats, Deliveroo, JustEat
- **Suggestions IA** - Recommandations personnalisées

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Mobile | React Native, Expo, TypeScript |
| Backend | Supabase (Auth, PostgreSQL, Realtime) |
| Hosting | Vercel (Edge Functions) |
| APIs | Google Maps / Mapbox, Stripe |

## Installation

```bash
# Cloner le repo
git clone https://github.com/username/geo-resto-app.git
cd geo-resto-app

# Installer les dépendances
npm install

# Lancer en développement
npx expo start
```

## Configuration

Créer un fichier `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_MAPS_API_KEY=your_maps_api_key
```

## Documentation

La documentation complète du projet est disponible dans le dossier `/documentation` :

- `01_pitch.md` - Présentation du projet
- `02_business_model.md` - Modèle économique
- `03_etude_marche.md` - Analyse de marché
- `04_roadmap.md` - Planning de développement
- `05_kpis.md` - Indicateurs de performance
- `06_specifications.md` - Spécifications techniques
- `07_mockups.md` - Maquettes UI/UX

## Roadmap

| Phase | Période | Objectifs |
|-------|---------|-----------|
| MVP V1.0 | Jan-Fév 2026 | Carte, filtres, profils utilisateur |
| V1.5 | Mar-Avr 2026 | Réservations, favoris, notifications |
| V2.0 | Mai-Juin 2026 | IA, intégration livraison, dashboard resto |

## Licence

Projet de fin d'études - M2 Développement
