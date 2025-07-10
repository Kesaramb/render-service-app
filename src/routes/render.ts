import { Router } from 'express';
import { RenderService } from '../services/renderService';
import { MockRenderService } from '../services/mockRenderService';

const router = Router();

// Use mock service in development, real service in production
const renderService = process.env.NODE_ENV === 'development' 
  ? new MockRenderService() 
  : new RenderService();

// Helper function to apply modifications to fabricData
function applyModifications(fabricData: any, modifications: any[]): any {
  const modifiedData = JSON.parse(JSON.stringify(fabricData)); // Deep clone
  
  for (const modification of modifications) {
    const { elementName, property, value } = modification;
    
    // Find the element by name in the objects array
    if (modifiedData.objects && Array.isArray(modifiedData.objects)) {
      const element = modifiedData.objects.find((obj: any) => obj.name === elementName);
      if (element) {
        element[property] = value;
      }
    }
  }
  
  return modifiedData;
}

router.post('/', async (req, res) => {
  try {
    const { fabricData, width, height, format, quality, transparent, modifications } = req.body;

    console.log('Render request received:', {
      hasFabricData: !!fabricData,
      width,
      height,
      format,
      hasModifications: !!modifications,
      modificationCount: modifications?.length || 0
    });

    // Validate required fields
    if (!fabricData || !width || !height) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['fabricData', 'width', 'height'],
        received: { fabricData: !!fabricData, width, height }
      });
    }

    // Apply modifications to fabricData if provided
    let finalFabricData = fabricData;
    if (modifications && Array.isArray(modifications)) {
      finalFabricData = applyModifications(fabricData, modifications);
    }

    const result = await renderService.renderImage({
      fabricData: finalFabricData,
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