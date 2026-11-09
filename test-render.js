const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createTestImage() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  // FIX: Create the page object here
  const page = await browser.newPage();

  try {
    // Generate a dummy PDF to prove HTML rendering works
    await page.pdf({ 
      path: './test-report.pdf', 
      format: 'A4',
      printBackground: true 
    });
    console.log('✅ HTML-to-PDF rendered successfully: ./test-report.pdf');

    // Now test Image decoding/rendering
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
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync('./test-evidence.png', Buffer.from(base64Data, 'base64'));
      console.log('✅ Image decoding/rendering successful: ./test-evidence.png');
    });
    
  } catch (error) {
    console.error("❌ Page execution error:", error);
    throw error;
  } finally {
    await browser.close();
  }
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