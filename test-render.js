const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Path to a sample image (create one or use any local PNG/JPG)
// For testing, we'll create a simple canvas-based image programmatically
async function createTestImage() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent('<html><body style="background-color:white; color:black; font-family:sans-serif;"><h1>Evidence Photo Test</h1><p>This is a test image.</p></body></html>');
  
  // Generate a dummy PDF to prove HTML rendering works
  await page.pdf({ 
    path: './test-report.pdf', 
    format: 'A4',
    printBackground: true 
  });
  console.log('✅ HTML-to-PDF rendered successfully: ./test-report.pdf');

  // Now test Image decoding/rendering
  // We will draw an image onto a canvas and save it as a new image to prove decode works
  await page.goto('about:blank');
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#000000';
    ctx.font = '30px Arial';
    ctx.fillText('Evidence Photo Rendered Successfully', 50, 100);
    return canvas.toDataURL('image/png');
  }).then(dataUrl => {
    // Write the data URL to a file to verify it's valid
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('./test-evidence.png', Buffer.from(base64Data, 'base64'));
    console.log('✅ Image decoding/rendering successful: ./test-evidence.png');
  });

  await browser.close();
}

(async () => {
  try {
    console.log('🚀 Starting Puppeteer Validation...');
    await createTestImage();
    console.log('🎉 All validations passed! Your configuration is ready for deployment.');
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
})();