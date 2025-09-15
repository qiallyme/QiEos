const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function pdfify() {
  console.log(' Starting PDF generation...');
  
  // Find all HTML files in kb/assets/html/
  const htmlFiles = await glob('kb/assets/html/*.html');
  
  if (htmlFiles.length === 0) {
    console.log(' No HTML files found in kb/assets/html/');
    return;
  }
  
  console.log( Found  HTML file(s) to process);
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const htmlFile of htmlFiles) {
      const basename = path.basename(htmlFile, '.html');
      const pdfPath = kb/assets/pdf/.pdf;
      
      // Check if PDF exists and if HTML is newer
      const htmlStats = fs.statSync(htmlFile);
      let shouldGenerate = true;
      
      if (fs.existsSync(pdfPath)) {
        const pdfStats = fs.statSync(pdfPath);
        shouldGenerate = htmlStats.mtime > pdfStats.mtime;
      }
      
      if (!shouldGenerate) {
        console.log(  Skipping .pdf (up to date));
        continue;
      }
      
      console.log( Generating .pdf...);
      
      const page = await browser.newPage();
      
      // Load the HTML file
      const fileUrl = ile://;
      await page.goto(fileUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      await page.close();
      console.log( Generated .pdf);
    }
  } finally {
    await browser.close();
  }
  
  console.log(' PDF generation complete!');
}

// Run if called directly
if (require.main === module) {
  pdfify().catch(console.error);
}

module.exports = { pdfify };
