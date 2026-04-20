import { useState } from 'react';
import { uploadImage, type ProgressCallback } from '../firebase/storage';

export function useImageUpload(folder = 'product_images') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, onProgress?: ProgressCallback): Promise<string> {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const path = `${folder}/${Date.now()}_${file.name}`;
      const downloadUrl = await uploadImage(file, path, (pct) => {
        setProgress(pct);
        onProgress?.(pct);
      });
      setUrl(downloadUrl);
      return downloadUrl;
    } catch (e) {
      const msg = 'Upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  }

  function reset() { setProgress(0); setUrl(null); setError(null); }

  return { upload, progress, uploading, url, error, reset };
}
