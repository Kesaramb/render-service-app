import express from 'express';
import { RenderService } from '../services/renderService';

const router = express.Router();
const renderService = new RenderService();

router.post('/', async (req, res) => {
  const { fabricData, width, height, format = 'png', quality = 0.9, transparent = false } = req.body;

  // Validation
  if (!fabricData || !width || !height) {
    return res.status(400).json({ 
      error: 'Missing required fields: fabricData, width, height' 
    });
  }

  if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
    return res.status(400).json({ 
      error: 'Invalid width or height. Must be positive numbers.' 
    });
  }

  if (width > 4000 || height > 4000) {
    return res.status(400).json({ 
      error: 'Dimensions exceed maximum allowed (4000px).' 
    });
  }

  try {
    const result = await renderService.renderImage({
      fabricData,
      width,
      height,
      format,
      quality,
      transparent
    });

    res.status(200).json({
      success: true,
      imageUrl: result.imageUrl,
      filename: result.filename
    });

  } catch (error: any) {
    console.error('Render error:', error);
    res.status(500).json({
      error: 'Image generation failed',
      message: error.message || String(error)
    });
  }
});

export { router as renderRouter }; 