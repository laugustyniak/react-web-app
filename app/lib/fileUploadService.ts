export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    file: {
      name: string;
      type: string;
      folder: string;
      urls: {
        original: string;
        thumbnail: string;
        medium: string;
      };
      paths: {
        original: string;
        thumbnail: string;
        medium: string;
      };
    };
  };
}

export async function uploadFile(
  file: File,
  type: string = 'programs'
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `https://us-central1-insbay-b32351.cloudfunctions.net/uploadFile?type=${type}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
}

/**
 * Converts a base64 data URL to a File object
 */
export function base64ToFile(base64Data: string, filename: string): File {
  // Extract the MIME type and base64 content
  const [header, data] = base64Data.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  
  // Convert base64 to byte array
  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  
  // Create File object
  return new File([byteArray], filename, { type: mimeType });
}

/**
 * Uploads a base64 image to cloud storage and returns hosted URLs
 */
export async function uploadBase64Image(
  base64Data: string,
  type: string = 'frames',
  filename?: string
): Promise<UploadFileResponse> {
  // Generate filename if not provided
  const defaultFilename = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
  const finalFilename = filename || defaultFilename;
  
  // Convert base64 to File
  const file = base64ToFile(base64Data, finalFilename);
  
  // Upload using existing upload service
  return uploadFile(file, type);
}
