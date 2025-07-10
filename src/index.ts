import express from 'express';
import cors from 'cors';
import { admin } from './config/firebase';
import { getStorage } from 'firebase-admin/storage';
import { fabric } from 'fabric';
// import 'fabric/dist/fabric.min'; // Remove this import
import { createCanvas, loadImage, Image } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import type { StaticCanvas } from 'fabric/fabric-impl';

// Explicitly register standard Fabric classes and fromObject methods
fabric.Image = fabric.Image;
fabric.IText = fabric.IText;
(fabric.Image as any).fromObject = (fabric.Image as any).fromObject;
(fabric.IText as any).fromObject = (fabric.IText as any).fromObject;

// Log module versions at startup
console.log('[Startup] fabric version:', require('fabric/package.json').version);
console.log('[Startup] canvas version:', require('canvas/package.json').version);

// Inject node-canvas into fabric for server-side rendering
(fabric as any).Canvas = fabric.StaticCanvas;
(fabric as any).nodeCanvas = createCanvas;
(fabric as any).nodeImage = loadImage;
(fabric as any).Image = Image;

const app = express();
const port = process.env.PORT || 8081;

const allowedOrigins = [
  'http://localhost:9002',
  'https://canvasmatic.com',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/render', async (req, res) => {
  const { fabricData, width, height, templateId } = req.body;

  // 1. Validate Input
  if (!fabricData || !width || !height || !templateId) {
    console.error('Render request missing required fields:', { fabricData: !!fabricData, width, height, templateId });
    return res.status(400).json({ 
      error: 'Bad Request: Missing fabricData, width, height, or templateId.',
      details: `Received: fabricData=${!!fabricData}, width=${width}, height=${height}, templateId=${templateId}`
    });
  }

  console.log(`[Render Service] Received render job for templateId: ${templateId} with dimensions ${width}x${height}`);

  // Log all object types in the Fabric JSON
  if (Array.isArray(fabricData?.objects)) {
    const types = fabricData.objects.map((obj: any) => obj.type);
    console.log('[Render Service] Fabric object types:', types);
  } else {
    console.warn('[Render Service] No objects array found in fabricData or not an array.');
  }

  try {
    // 2. Initialize Fabric Canvas on Server
    console.log('[Render Service] Initializing Fabric StaticCanvas...');
    const staticCanvas = new fabric.StaticCanvas(null, { width, height }) as StaticCanvas & { toBuffer: (...args: any[]) => Buffer };
    
    // 3. Load data and render
    console.log('[Render Service] Loading Fabric JSON into canvas...');
    await new Promise<void>((resolve, reject) => {
      staticCanvas.loadFromJSON(fabricData, () => {
        console.log('[Render Service] Canvas renderAll called.');
        staticCanvas.renderAll();
        resolve();
      }, (o: any, object: any) => {
        // Log each object as it's loaded
        if (object && object.type) {
          console.log(`[Render Service] Loaded object of type: ${object.type}`);
        }
      });
    });

    console.log('[Render Service] Fabric data loaded and canvas rendered.');

    // 4. Convert to PNG buffer
    console.log('[Render Service] Converting canvas to PNG buffer...');
    const buffer = staticCanvas.toBuffer({
        format: 'png',
        quality: 1,
    });
    
    // 5. Upload to Firebase Storage
    if (!admin) {
        throw new Error("Firebase Admin SDK not initialized. Check server logs and configuration.");
    }
    console.log('[Render Service] Uploading image to Firebase Storage...');
    const bucket = getStorage(admin.app()).bucket();
    const fileName = `renders/${templateId}/${uuidv4()}.png`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    console.log(`[Render Service] Image uploaded to Firebase Storage at: ${fileName}`);

    // Get public URL
    console.log('[Render Service] Generating signed URL for image...');
    const [publicUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
    });

    // 6. Return public URL
    console.log('[Render Service] Render process complete. Returning imageUrl.');
    res.status(200).json({ imageUrl: publicUrl });

  } catch (error) {
    console.error('[Render Service] --- RENDERING FAILED ---');
    if (error instanceof Error) {
      console.error('[Render Service] Error message:', error.message);
      console.error('[Render Service] Error stack:', error.stack);
    } else {
      console.error('[Render Service] Unknown error:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during rendering.';
    const errorStack = error instanceof Error ? error.stack : 'No stack available.';
    
    res.status(500).json({ 
      error: 'Failed to generate image.',
      details: {
        message: errorMessage,
        stack: errorStack?.split('\n').slice(0, 10).join('\\n'),
      }
    });
  }
});

app.listen(port, () => {
  console.log(`[Render Service] Server listening on port ${port}`);
});
