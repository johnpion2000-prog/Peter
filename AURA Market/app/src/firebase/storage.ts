import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export type ProgressCallback = (pct: number) => void;

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: ProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
    );
  });
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // image may not exist — ignore
  }
}
