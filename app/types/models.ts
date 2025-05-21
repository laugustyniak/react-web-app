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
    duration_s: number;
    title?: string;
    program?: string;
    description?: string;
    logo_url?: string;
}


export interface VideoFrame {
    frame_id: string;
    video_id: string;
    frame_number: number;
    timestamp_ms: number;
    frame_path: string;
    storage_url: string;
    scene_score?: number;
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
