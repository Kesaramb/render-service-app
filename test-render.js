const axios = require('axios');

// Sample Fabric.js canvas data for testing (simulating a template from main app)
const testFabricData = {
  "version": "5.3.0",
  "objects": [
    {
      "type": "rect",
      "version": "5.3.0",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 100,
      "width": 200,
      "height": 100,
      "fill": "#ff0000",
      "stroke": "#000000",
      "strokeWidth": 2,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "rx": 0,
      "ry": 0,
      "name": "background-rect" // Named element for modifications
    },
    {
      "type": "text",
      "version": "5.3.0",
      "originX": "left",
      "originY": "top",
      "left": 150,
      "top": 130,
      "width": 100,
      "height": 40,
      "fill": "#ffffff",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 20,
      "text": "Hello Canvasmatic!",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "center",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "name": "main-text" // Named element for modifications
    }
  ],
  "background": "#ffffff"
};

// Sample modifications that the main app might send
const testModifications = [
  {
    "elementName": "main-text",
    "property": "text",
    "value": "Hello from Main App!"
  },
  {
    "elementName": "background-rect",
    "property": "fill",
    "value": "#00ff00"
  }
];

async function testRenderService() {
  try {
    console.log('Testing Canvasmatic Render Service...');
    console.log('Simulating request from main Canvasmatic app...');
    
    const response = await axios.post('http://localhost:8081/render', {
      fabricData: testFabricData,
      width: 800,
      height: 600,
      format: 'png',
      quality: 0.9,
      transparent: false,
      modifications: testModifications
    });

    console.log('✅ Render successful!');
    console.log('Response:', response.data);
    
    if (response.data.success && response.data.data.imageUrl) {
      console.log('📸 Image URL:', response.data.data.imageUrl);
      console.log('📁 Filename:', response.data.data.filename);
      
      // If it's a data URL, we can show the base64 length
      if (response.data.data.imageUrl.startsWith('data:')) {
        const base64Length = response.data.data.imageUrl.split(',')[1]?.length || 0;
        console.log('📊 Base64 data length:', base64Length, 'characters');
      }
    }

  } catch (error) {
    console.error('❌ Render failed:', error.response?.data || error.message);
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:8081/health');
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  const isHealthy = await testHealth();
  if (isHealthy) {
    await testRenderService();
  } else {
    console.log('Service is not healthy. Please start the service first with: npm run dev');
  }
}

runTests(); 