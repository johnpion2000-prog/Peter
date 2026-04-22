import { useState } from 'react';
import { uploadProductImage } from '../firebase/upload';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (productId: string, file: File): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const url = await uploadProductImage(productId, file, ({ progress: p }) => setProgress(p));
      return url;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
};
