import { Ionicons } from '@expo/vector-icons';

export type ThumbValue = 'up' | 'down' | null;

export interface Reservation {
  id: string;
  restaurant: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmée' | 'en attente' | 'passée';
}

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', restaurant: 'Le Potager de Charlotte', date: '22 avril 2026', time: '20:00', guests: 2, status: 'confirmée' },
  { id: 'r2', restaurant: 'Sakura Ramen', date: '28 avril 2026', time: '12:30', guests: 4, status: 'en attente' },
  { id: 'r3', restaurant: 'La Trattoria Romana', date: '10 avril 2026', time: '19:30', guests: 3, status: 'passée' },
];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Nouvelle offre disponible', message: '-20% chez Le Potager de Charlotte ce soir', time: 'Il y a 2h', unread: true, icon: 'pricetag' },
  { id: 'n2', title: 'Réservation confirmée', message: 'Votre table pour 2 le 22 avril à 20:00', time: 'Hier', unread: true, icon: 'calendar' },
  { id: 'n3', title: 'Jam Session ce soir', message: 'Le Potager de Charlotte organise une jam jazz à 21:00', time: 'Il y a 4h', unread: true, icon: 'musical-notes' },
  { id: 'n4', title: 'Concert à venir', message: 'Chez Janou : quartet acoustique samedi 27 avril à 20:00', time: 'Hier', unread: false, icon: 'mic' },
  { id: 'n5', title: 'Dégustation de vins', message: 'Sakura Ramen : dégustation saké-sushi jeudi 2 mai', time: 'Il y a 2 jours', unread: false, icon: 'wine' },
  { id: 'n6', title: 'Nouveau restaurant', message: 'L\'Atelier Végétal vient d\'ouvrir près de chez vous', time: 'Il y a 3 jours', unread: false, icon: 'restaurant' },
];
