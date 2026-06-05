import { Ionicons } from '@expo/vector-icons';

export type PlanId = 'free' | 'pro' | 'premium';

export interface StatCard {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const STATS: StatCard[] = [
  { label: 'Vues', value: '1.2k', icon: 'eye' },
  { label: 'Clics', value: '342', icon: 'hand-left' },
  { label: 'Réservations', value: '28', icon: 'calendar' },
];

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  popular: boolean;
  features: string[];
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 €',
    period: '/mois',
    tagline: 'Pour démarrer',
    popular: false,
    features: [
      'Fiche restaurant basique',
      'Visibilité standard dans la recherche',
      "Jusqu'à 5 photos",
      'Informations de contact',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '49 €',
    period: '/mois',
    tagline: 'Le plus populaire',
    popular: true,
    features: [
      'Tout du plan Gratuit',
      'Mise en avant dans les recommandations',
      'Photos illimitées + menu détaillé',
      '5 promotions actives par mois',
      'Évènements à venir (jam, concerts...)',
      'Statistiques détaillées (vues, clics)',
      'Badge « Vérifié » sur la fiche',
      'Support prioritaire par email',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '129 €',
    period: '/mois',
    tagline: 'Maximisez vos revenus',
    popular: false,
    features: [
      'Tout du plan Pro',
      'Promotions et évènements illimités',
      'Analytics avancées (conversion, ROI)',
      'Campagnes marketing ciblées',
      'Placement top résultats (x3 visibilité)',
      'Gestion multi-établissements',
      'API Réservations intégrée',
      'Account Manager dédié',
    ],
  },
];

export function getPlanData(planId: PlanId): SubscriptionPlan {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
}

export interface MenuArticle {
  id: string;
  name: string;
  price: number;
}

export const MENU_ARTICLES: MenuArticle[] = [
  { id: 'a1', name: 'Entrée du chef', price: 14 },
  { id: 'a2', name: 'Plat du jour', price: 19 },
  { id: 'a3', name: 'Menu complet', price: 32 },
  { id: 'a4', name: 'Dessert maison', price: 9 },
  { id: 'a5', name: 'Bouteille de vin', price: 28 },
  { id: 'a6', name: 'Cocktail signature', price: 12 },
];

export type EventType = 'jam' | 'concert' | 'spectacle' | 'degustation' | 'autre';

export interface EventOption {
  key: EventType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const EVENT_TYPES: EventOption[] = [
  { key: 'jam', label: 'Jam session', icon: 'musical-notes' },
  { key: 'concert', label: 'Concert', icon: 'mic' },
  { key: 'spectacle', label: 'Spectacle', icon: 'sparkles' },
  { key: 'degustation', label: 'Dégustation', icon: 'wine' },
  { key: 'autre', label: 'Autre', icon: 'ellipsis-horizontal' },
];

export type BoostDuration = 7 | 14 | 30;

export const BOOST_PRICES: Record<BoostDuration, string> = { 7: '19 €', 14: '35 €', 30: '69 €' };
