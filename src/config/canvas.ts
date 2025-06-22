import { fabric } from 'fabric';

// This function can be expanded to load custom fonts from files
export async function loadFonts() {
  // Currently, no custom fonts are loaded, but you could add logic here
  // e.g., fabric.nodeCanvas.registerFont(...)
}

export function initializeCanvas(width: number, height: number): fabric.StaticCanvas {
  // Use StaticCanvas for non-interactive server-side rendering
  const canvas = new fabric.StaticCanvas(null, {
    width: width,
    height: height,
    renderOnAddRemove: false, // Important for performance
  });
  return canvas;
} 