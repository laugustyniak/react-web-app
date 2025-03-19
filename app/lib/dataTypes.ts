export interface Inspiration {
  id: string;
  title: string;
  logoUrl: string;
  imageUrl: string;
  products: string[];
  stars: number;
  starredBy: string[];
  commentIds: string[];
  commentCount: number;
  date: string;
  description: string;
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  date: string;
  contentId: string;
  contentType: 'inspiration' | 'product' | 'program';
}

export interface Product {
  title: string;
  program: string;
  price: number;
  metadata?: {
    description_in_english?: string;
  };
  sale_price?: number;
  image_url?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}
