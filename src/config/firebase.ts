import * as admin from 'firebase-admin';

export function initializeFirebase() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin SDK env vars not fully set. Relying on default ADC.');
      admin.initializeApp(); // Initialize with Application Default Credentials
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized using environment variables.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw error;
    }
  }
}

export { admin }; 