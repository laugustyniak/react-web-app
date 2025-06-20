import type { Timestamp } from "firebase/firestore";

export type Product = {
    product_id: number; // Number of product in the image
    product_name: string; // Name of the product
    product_name_in_language: string; // Name of the product in target language
    description_in_english: string; // Description in English
    description_in_language: string; // Description in target language
    search_query: string; // Optimized search query to find similar products
    search_query_in_language: string; // Optimized search query to find similar products in target language
};

export type MultipleProducts = {
    products: Product[]; // List of products found in the image
};

export interface VideoData {
    video_id: string;
    video_url: string;
    storage_url?: string; // URL to our server copy of the video for frame extraction
    duration_s?: number;
    duration_ms?: number; // Duration in milliseconds
    title?: string;
    program?: string;
    is_processed?: boolean; // Processing status
    description?: string;
    logo_url?: string;
    visibility?: Visibility; // Visibility status
    created_at?: Timestamp; // Creation timestamp in format "June 11, 2025 at 1:47:13 AM UTC+2"
};

export interface VideoFrame {
    frame_id: string;
    video_id: string;
    frame_number: number;
    timestamp_ms: number;
    frame_path: string;
    storage_url: string;
    scene_score?: number;
    created_at?: Timestamp; // Creation timestamp
    updated_at?: Timestamp; // Last update timestamp
    // UI-specific optional fields
    image_url?: string;
}

// Note: This Product interface is for UI/mock data, not the same as the API Product type above
export interface UIProduct {
    product_id: string;
    frame_id: string;
    name: string;
    category: string;
    confidence: number;
    bounding_box: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    image_path: string;
}

export interface SimilarProduct {
    product_id: string;
    name: string;
    brand: string;
    price: number;
    currency: string;
    image_url: string;
    product_url: string;
    similarity_score: number;
}

export class Visibility {
    static PUBLIC = "public"; // Visible to all users
    static PRIVATE = "private"; // Only visible to owner
    static UNLISTED = "unlisted"; // Only visible with direct link
    static DRAFT = "draft"; // Not yet published
    static ARCHIVED = "archived"; // No longer active but preserved

    constructor(private value: string) {
        if (![Visibility.PUBLIC, Visibility.PRIVATE, Visibility.UNLISTED, Visibility.DRAFT, Visibility.ARCHIVED].includes(value)) {
            throw new Error(`Invalid visibility value: ${value}`);
        }
    }

    public getValue(): string {
        return this.value;
    }

    public static fromString(value: string): Visibility {
        return new Visibility(value);
    }
}
