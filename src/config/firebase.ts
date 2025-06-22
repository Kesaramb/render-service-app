import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Since this file is in src/config, and the service-account.json is at the root,
// we need to go up two directories from where the compiled JS file will be (dist/config).
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../../../service-account.json');


export function initializeFirebase() {
  if (admin.apps.length) {
    return; // Already initialized
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Prefer environment variables for production/deployed environments
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: `${projectId}.appspot.com`
      });
      console.log('[render-service] Firebase Admin SDK initialized using environment variables.');
    } catch (error: any) {
      console.error('[render-service] Error initializing with env vars:', error.message);
      throw error;
    }
  } else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    // Fallback to service account file for local development
     console.warn(`[render-service] Env vars not fully set, falling back to service account file: ${SERVICE_ACCOUNT_PATH}`);
     try {
        const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${serviceAccount.project_id}.appspot.com`
        });
        console.log('[render-service] Firebase Admin SDK initialized using service-account.json.');
     } catch (error: any) {
        console.error('[render-service] Error initializing with service-account.json:', error.message);
     }
  } else {
    // If neither is available, initialization will fail.
    console.error('[render-service] Could not initialize Firebase. Provide credentials via environment variables or a service-account.json file.');
  }
}

export { admin }; 