// Affiliate link generator utility for Product
// Similar to the provided Python logic

const PRODUCT_AFFILIATE_UTM = "product.app";

/**
 * Generate a UTM affiliate link, ensuring the base link is valid and properly formatted.
 * @param {string} baseLink - The original product link.
 * @param {string} utmSource - The UTM source to append (default: PRODUCT_AFFILIATE_UTM).
 * @returns {string|null} - The affiliate link with UTM parameter, or null if invalid.
 */
export function generateAffiliateLink(baseLink: string, utmSource: string = PRODUCT_AFFILIATE_UTM): string | null {
    try {
        console.log(`[generateAffiliateLink] Input baseLink: ${baseLink}, utmSource: ${utmSource}`);
        const url = new URL(baseLink);
        // Only add if not already present
        if (!url.searchParams.has("utm_source")) {
            url.searchParams.append("utm_source", utmSource);
            console.log(`[generateAffiliateLink] Appended utm_source: ${utmSource}`);
        } else {
            console.log(`[generateAffiliateLink] utm_source already present: ${url.searchParams.get("utm_source")}`);
        }
        const result = url.toString();
        console.log(`[generateAffiliateLink] Resulting URL: ${result}`);
        return result;
    } catch (e) {
        console.error(`[generateAffiliateLink] Invalid URL: ${baseLink}`, e);
        // Invalid URL
        return null;
    }
}

export { PRODUCT_AFFILIATE_UTM };
