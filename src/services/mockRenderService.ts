import { fabric } from 'fabric';
import { createCanvas } from 'canvas';

interface RenderRequest {
  fabricData: any;
  width: number;
  height: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  transparent?: boolean;
}

export class MockRenderService {
  async renderImage(request: RenderRequest): Promise<{ imageUrl: string; filename: string }> {
    try {
      console.log('Starting mock render process:', {
        width: request.width,
        height: request.height,
        format: request.format,
        hasFabricData: !!request.fabricData
      });

      // Create a new node-canvas
      const nodeCanvas = createCanvas(request.width, request.height);
      
      // Create a new Fabric.js canvas with the node-canvas
      const fabricCanvas = new fabric.StaticCanvas(nodeCanvas as any, {
        width: request.width,
        height: request.height
      });

      // Load the Fabric.js data onto the canvas
      await new Promise<void>((resolve, reject) => {
        fabricCanvas.loadFromJSON(request.fabricData, () => {
          try {
            // Set the background if specified
            if (request.fabricData.background) {
              fabricCanvas.setBackgroundColor(request.fabricData.background, () => {
                fabricCanvas.renderAll();
                resolve();
              });
            } else {
              fabricCanvas.renderAll();
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      // Convert canvas to buffer
      let imageBuffer: Buffer;
      const format = request.format || 'png';
      
      if (format === 'png') {
        imageBuffer = nodeCanvas.toBuffer('image/png', {
          compressionLevel: 9,
          filters: nodeCanvas.PNG_FILTER_NONE,
          backgroundIndex: request.transparent ? 0 : undefined
        });
      } else if (format === 'jpeg') {
        imageBuffer = nodeCanvas.toBuffer('image/jpeg', {
          quality: request.quality || 0.9,
          progressive: true
        });
      } else {
        throw new Error(`Unsupported format: ${format}. Only 'png' and 'jpeg' are supported.`);
      }

      // For development, return a mock URL and save the image locally
      const filename = `render_${Date.now()}.${format}`;
      const mockImageUrl = `data:image/${format};base64,${imageBuffer.toString('base64')}`;

      console.log('Mock render completed successfully:', { filename });

      return { 
        imageUrl: mockImageUrl, 
        filename 
      };

    } catch (error) {
      console.error('Mock render error:', error);
      throw new Error(`Failed to render image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private drawObject(ctx: any, obj: any) {
    if (obj.type === 'rect') {
      ctx.fillStyle = obj.fill || '#000000';
      ctx.strokeStyle = obj.stroke || 'transparent';
      ctx.lineWidth = obj.strokeWidth || 0;
      
      if (obj.angle) {
        ctx.save();
        ctx.translate(obj.left + obj.width / 2, obj.top + obj.height / 2);
        ctx.rotate(obj.angle * Math.PI / 180);
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        if (obj.strokeWidth > 0) {
          ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        }
        ctx.restore();
      } else {
        ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
        if (obj.strokeWidth > 0) {
          ctx.strokeRect(obj.left, obj.top, obj.width, obj.height);
        }
      }
    } else if (obj.type === 'text') {
      ctx.fillStyle = obj.fill || '#000000';
      ctx.font = `${obj.fontStyle || 'normal'} ${obj.fontWeight || 'normal'} ${obj.fontSize || 16}px ${obj.fontFamily || 'Arial'}`;
      ctx.textAlign = obj.textAlign || 'left';
      ctx.textBaseline = 'top';
      
      if (obj.angle) {
        ctx.save();
        ctx.translate(obj.left, obj.top);
        ctx.rotate(obj.angle * Math.PI / 180);
        ctx.fillText(obj.text, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(obj.text, obj.left, obj.top);
      }
    }
  }
} 