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

export async function uploadBase64Image(
  base64Data: string,
  type: string = 'inspirations'
): Promise<UploadFileResponse> {
  // Convert base64 to blob
  const fetchResponse = await fetch(base64Data);
  const blob = await fetchResponse.blob();

  // Create a File from the blob
  const file = new File(
    [blob],
    `generated-inspiration-${new Date().getTime()}.png`,
    { type: 'image/png' }
  );

  // Use the existing uploadFile function
  return uploadFile(file, type);
}
