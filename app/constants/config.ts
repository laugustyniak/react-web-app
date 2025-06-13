// Configuration constants
export const CONFIG = {
  // Backend API settings
  API: {
    // Always use the proxy route to hide API keys
    URL: '/api',
    // API key should never be exposed on the client
    KEY: typeof window !== 'undefined' ? '' : (process.env.BUY_IT_API_KEY_1 || ''),
  },

  // Inspiration generation
  INSPIRATION: {
    DEFAULT_PROMPT: "Create a sophisticated home decor lifestyle photo featuring elegant furniture and decorative items in a bright, airy living space. Show products in a realistic, high-end home setting with soft natural sunlight streaming through large windows. Include tasteful styling with neutral color palette, layered textures, and organic materials. Capture the products from an editorial perspective with professional composition and depth of field",
    NEGATIVE_PROMPT: "text, watermarks, logos, poor quality, blurry, artificial lighting, cluttered space, oversaturated colors, distorted proportions, unrealistic shadows, cartoon style, illustration, digital art style"
  },

  // Other app configuration values can be added here
};
