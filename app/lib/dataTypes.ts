export interface Inspiration {
  id: string;
  title: string;
  description?: string;
  logoUrl?: string;
  imageUrl: string;
  program?: string;
  programTitle?: string;
  products?: string[];
  stars?: number;
  starredBy?: string[];
  commentIds?: string[];
  commentCount?: number;
  date?: string;
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
  id: string;
  title: string;
  program: string;
  metadata?: {
    description_in_english?: string;
  };
  affiliate_link?: string;
  image_url?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  logo_url?: string;
}

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}
