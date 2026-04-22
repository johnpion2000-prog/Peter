import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

export const uploadProductImage = (
  productId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const storageRef = ref(storage, `product-images/${productId}/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: any) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({ progress });
      },
      (error: any) => {
        onProgress?.({ progress: 0, error: error.message });
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, downloadURL });
        resolve(downloadURL);
      }
    );
  });
};

export const deleteProductImage = async (imageURL: string): Promise<void> => {
  const imageRef = ref(storage, imageURL);
  await deleteObject(imageRef);
};
