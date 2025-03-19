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
  product_id: string;
  title: string;
  program: string;
  metadata?: {
    description_in_english?: string;
  };
  affiliate_link?: string;
  image_url?: string;
}

export interface Program {
  program_id: string;
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
