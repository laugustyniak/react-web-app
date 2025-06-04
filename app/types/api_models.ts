// Types for FindImage API
export interface FindImageRequest {
  query: string;
  location?: string; // default: "Japan"
  gl?: string;       // default: "jp"
  hl?: string;       // default: "ja"
}

export interface FindImageResponse {
  serpapi_response: Record<string, unknown>;
}

// Types for Segment API
export interface SegmentRequest {
  base64_image: string;
  coordinates: [number, number][];
  return_cropped?: boolean; // default: false
}

export interface SegmentResponse {
  image: string;
  mask: string;
}

// Types for Inpaint API
export interface InpaintRequest {
  base64_image: string;
  base64_mask?: string;
  prompt: string;
  negative_prompt: string;
  base64_control_image?: string;
  internal_model?: boolean; // default: false
}

export interface InpaintResponse {
  image: string;
  mask?: string;
}

// Types for ImagePrompt API
export interface ImagePromptRequest {
  base_prompt: string;
}

export interface ImagePromptResponse {
  enhanced_prompt: string;
}

// Types for ProductDescription API
export interface ProductDescriptionRequest {
  base64_image: string;
  language: string;
  source_description?: string; // default: ""
}

export interface ProductDescriptionResponse {
  description: string;
}

// Types for Upscale API
export interface UpscaleRequest {
  base64_image: string;
  prompt?: string; // default: ""
  internal_model?: boolean; // default: false
}

export interface UpscaleResponse {
  image: string;
}
