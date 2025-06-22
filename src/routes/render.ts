import { Router, Request, Response } from 'express';
import { renderCanvas } from '../services/renderService';

const router = Router();

router.post('/render', async (req: Request, res: Response) => {
  const { fabricData, width, height } = req.body;

  if (!fabricData || !width || !height) {
    return res.status(400).json({ 
      error: '`fabricData`, `width`, and `height` are required fields.' 
    });
  }

  try {
    // The renderCanvas function will now return a public URL of the uploaded image
    const imageUrl = await renderCanvas(fabricData, width, height);
    
    // The main app expects a JSON response with the URL
    res.status(200).json({ imageUrl });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`[render-service] Error in /render route:`, errorMessage);
    res.status(500).json({ 
      error: 'Failed to render and upload image.',
      details: errorMessage
    });
  }
});

export default router; 