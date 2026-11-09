const puppeteer = require('puppeteer');
const fs = require('fs');

async function createTestImage() {
  // STRICT MODE: No --no-sandbox
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--disable-setuid-sandbox', // Often still needed on Linux even without --no-sandbox if user isn't root
      '--disable-dev-shm-usage'
      // Note: We are NOT passing --no-sandbox here
    ]
  });

  const page = await browser.newPage();

  try {
    console.log('🚀 Starting Strict Sandbox Validation...');
    
    // Test PDF
    await page.pdf({ 
      path: './test-report.pdf', 
      format: 'A4',
      printBackground: true 
    });
    console.log('✅ HTML-to-PDF rendered successfully: ./test-report.pdf');

    // Test Image
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
    
    console.log('🎉 Strict Sandbox Validation Passed!');

  } catch (error) {
    console.error('❌ Strict Sandbox Validation Failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

(async () => {
  try {
    await createTestImage();
  } catch (error) {
    process.exit(1);
  }
})();