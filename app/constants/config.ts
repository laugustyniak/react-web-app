// Configuration constants
export const CONFIG = {
  // Backend API settings
  API: {
    // In production/SSR, use the proxy route to hide API keys
    // In development with React Router dev server, use direct backend URL
    URL: typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? '/api'  // Use proxy in production
      : process.env.BACKEND_API_URL || 'http://localhost:8000',
    // API key should not be used on the client side when using proxy
    KEY: typeof window !== 'undefined' ? '' : (process.env.INSBUY_API_KEY_1 || ''),
  },

  // Inspiration generation
  INSPIRATION: {
    DEFAULT_PROMPT: "Create a sophisticated home decor lifestyle photo featuring elegant furniture and decorative items in a bright, airy living space. Show products in a realistic, high-end home setting with soft natural sunlight streaming through large windows. Include tasteful styling with neutral color palette, layered textures, and organic materials. Capture the products from an editorial perspective with professional composition and depth of field",
    NEGATIVE_PROMPT: "text, watermarks, logos, poor quality, blurry, artificial lighting, cluttered space, oversaturated colors, distorted proportions, unrealistic shadows, cartoon style, illustration, digital art style"
  },

  // Other app configuration values can be added here
}; 