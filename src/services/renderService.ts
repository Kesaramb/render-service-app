import { fabric } from 'fabric';
import { initializeCanvas, loadFonts } from '../config/canvas';
import { admin } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

async function uploadToStorage(imageBuffer: Buffer, format: string = 'png'): Promise<string> {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error("FIREBASE_STORAGE_BUCKET environment variable not set.");
    throw new Error("Storage bucket is not configured.");
  }

  const bucket = admin.storage().bucket(bucketName);
  const fileName = `renders/${uuidv4()}.${format}`;
  const file = bucket.file(fileName);

  await file.save(imageBuffer, {
    metadata: {
      contentType: `image/${format}`,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    },
    public: true, // Make the file public
  });

  return file.publicUrl();
}

export async function renderCanvas(fabricData: any, width: number, height: number): Promise<string> {
  await loadFonts(); // Ensure custom fonts are loaded
  
  const canvas = initializeCanvas(width, height);

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    try {
      canvas.loadFromJSON(fabricData, () => {
        canvas.renderAll();
        const stream = canvas.createPNGStream();
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err: Error) => reject(err));
      });
    } catch (error) {
      reject(error);
    }
  });

  const imageUrl = await uploadToStorage(buffer, 'png');
  return imageUrl;
} 