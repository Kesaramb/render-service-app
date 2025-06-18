import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Health check endpoint
export const health = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    service: 'canvasmatic-render-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Render endpoint (placeholder for now)
export const render = functions.https.onRequest(async (req, res) => {
  try {
    // For now, return a placeholder response
    // TODO: Implement actual rendering logic with node-canvas
    res.json({
      message: 'Render service endpoint',
      status: 'placeholder',
      note: 'Actual rendering will be implemented with proper node-canvas setup'
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Render service temporarily unavailable'
    });
  }
});

// Root endpoint
export const root = functions.https.onRequest((req, res) => {
  res.json({
    service: 'Canvasmatic Render Service',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      render: '/render'
    }
  });
}); 