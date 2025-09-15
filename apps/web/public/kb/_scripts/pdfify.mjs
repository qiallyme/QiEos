import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { glob } from "glob";

async function pdfify() {
  console.log(" Starting PDF generation...");
  
  // Find all HTML files in kb/assets/html/
  const htmlFiles = await glob("public/kb/assets/html/*.html");
  
  if (htmlFiles.length === 0) {
    console.log(" No HTML files found in public/kb/assets/html/");
    return;
  }
  
  console.log(` Found ${htmlFiles.length} HTML file(s) to process`);
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  try {
    for (const htmlFile of htmlFiles) {
      const basename = path.basename(htmlFile, ".html");
      const pdfPath = `public/kb/assets/pdf/${basename}.pdf`;
      
      // Check if PDF exists and if HTML is newer
      const htmlStats = fs.statSync(htmlFile);
      let shouldGenerate = true;
      
      if (fs.existsSync(pdfPath)) {
        const pdfStats = fs.statSync(pdfPath);
        shouldGenerate = htmlStats.mtime > pdfStats.mtime;
      }
      
      if (!shouldGenerate) {
        console.log(`  Skipping ${basename}.pdf (up to date)`);
        continue;
      }
      
      console.log(` Generating ${basename}.pdf...`);
      
      const page = await browser.newPage();
      
      // Load the HTML file
      const fileUrl = `file://${path.resolve(htmlFile)}`;
      await page.goto(fileUrl, { 
        waitUntil: "networkidle0",
        timeout: 30000 
      });
      
      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in"
        }
      });
      
      await page.close();
      console.log(` Generated ${basename}.pdf`);
    }
  } finally {
    await browser.close();
  }
  
  console.log(" PDF generation complete!");
}

// Run the function
pdfify().catch(console.error);
