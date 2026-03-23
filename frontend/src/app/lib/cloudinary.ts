const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    CLOUD_NAME &&
    CLOUD_NAME !== 'your_cloud_name' &&
    UPLOAD_PRESET &&
    UPLOAD_PRESET !== 'your_upload_preset'
  );
}

export interface UploadProgress {
  file: string;
  progress: number; // 0-100, 100 = done
  error?: string;
  url?: string;
}

/**
 * Upload a single File to Cloudinary using an unsigned upload preset.
 * Returns the secure CDN URL.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary non configuré. Ajoutez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans .env');
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'maison-marnoa/products');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 95)); // 95% during upload, 100 on success
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as { secure_url: string };
        onProgress?.(100);
        resolve(data.secure_url);
      } else {
        reject(new Error(`Cloudinary error ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

/**
 * Upload multiple files concurrently, reporting progress per file.
 */
export async function uploadFilesToCloudinary(
  files: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<string[]> {
  const state: UploadProgress[] = files.map(f => ({ file: f.name, progress: 0 }));

  const notify = () => onProgress?.([...state]);

  const uploads = files.map((file, i) =>
    uploadToCloudinary(file, (pct) => {
      state[i].progress = pct;
      notify();
    })
      .then(url => {
        state[i].url = url;
        state[i].progress = 100;
        notify();
        return url;
      })
      .catch(err => {
        state[i].error = err instanceof Error ? err.message : 'Erreur';
        state[i].progress = 0;
        notify();
        throw err;
      })
  );

  return Promise.all(uploads);
}
