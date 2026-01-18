export interface Audiobook {
  id: string;
  title: string;
  author: string;
  description: string;
  narrator: string;
  durationMinutes: number;
  price: number;
  category: string;
  coverImageUrl?: string;
  audioFileUrl?: string;
  rating: number;
  reviewCount: number;
  publishedDate?: string;
}

export interface LibraryItem {
  id: string;
  audiobook: Audiobook;
  lastPositionSeconds: number;
  isCompleted: boolean;
  isFavorite: boolean;
  addedAt: string;
  lastPlayedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}
