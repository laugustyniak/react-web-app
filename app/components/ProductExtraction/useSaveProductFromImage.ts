import { insertProduct } from "~/lib/firestoreService";
import type { Product } from "~/lib/dataTypes";
import { toast } from "sonner";

/**
 * Hook to return a callback for saving a product from an image result to Firestore
 * Optionally, you can pass a programId and description to be included in the product
 */
export function useSaveProductFromImage(options?: { programId?: string; description?: string }) {
    return async (img: {
        name?: string;
        image?: string;
        link?: string;
        source?: string;
    }) => {
        // Compose the product object according to Product type
        const product: Omit<Product, "id"> = {
            title: img.name || "Untitled Product",
            program: options?.programId || "",
            affiliate_link: img.link,
            image_url: img.image,
            metadata: {
                description_in_english: options?.description || img.source || "",
            },
        };
        try {
            await insertProduct(product);
            toast.success("Product saved to collection");
        } catch (e) {
            toast.error("Failed to save product");
            // eslint-disable-next-line no-console
            console.error("Failed to save product", e);
        }
    };
}
