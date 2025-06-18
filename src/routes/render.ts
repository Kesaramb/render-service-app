import { Router } from 'express';
import { RenderService } from '../services/renderService';

const router = Router();
const renderService = new RenderService();

router.post('/', async (req, res) => {
  try {
    const { fabricData, width, height, format, quality, transparent } = req.body;

    // Validate required fields
    if (!fabricData || !width || !height) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['fabricData', 'width', 'height'],
        received: { fabricData: !!fabricData, width, height }
      });
    }

    const result = await renderService.renderImage({
      fabricData,
      width,
      height,
      format: format || 'png',
      quality: quality || 0.9,
      transparent: transparent || false
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      error: 'Render failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as renderRouter }; 