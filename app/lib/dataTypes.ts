export interface Inspiration {
  id: string;
  title: string;
  logoUrl: string;
  imageUrl: string;
  likes: number;
  comments: {
    count: number;
    items: Array<{
      id: string;
      author: string;
      text: string;
      date: string;
    }>;
  };
  date: string;
  description: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  contentId: string;
  contentType: 'inspiration' | 'product' | 'program';
}

export interface Product {
  id: string;
  title: string;
  program: string;
  description: string;
  price: string;
  imageUrl: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  logoText?: string;
  logoUrl?: string;
}
