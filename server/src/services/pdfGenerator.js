import puppeteer from 'puppeteer';

let browser = null;

/**
 * Get or create a shared browser instance (reuse for performance)
 */
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

/**
 * Generate a PDF from a URL.
 * Returns { pdfBuffer, title }
 */
export async function generatePdf(url, options = {}) {
  const {
    format = 'A4',
    printBackground = true,
    timeout = 120000,  // Increased from 60000 to 120000 (2 minutes)
    waitUntil = 'networkidle2',  // Changed from 'networkidle0' to 'networkidle2' (less strict)
  } = options;

  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    // Set a realistic viewport
    await page.setViewport({ width: 1440, height: 900 });

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    // Navigate to the URL with timeout and retry fallback
    let navigationFailed = false;
    try {
      await page.goto(url, {
        waitUntil,
        timeout,
      });
    } catch (navError) {
      console.warn(`Navigation with ${waitUntil} failed, retrying with domcontentloaded...`, navError.message);
      navigationFailed = true;
      
      // Fallback: try again with domcontentloaded (faster but less thorough)
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
      } catch (fallbackError) {
        console.error(`Both navigation attempts failed for ${url}`, fallbackError.message);
        throw fallbackError;
      }
    }

    // Wait a bit for any lazy-loaded content
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));

    // Get the page title
    const title = await page.title();

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format,
      printBackground,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    return { pdfBuffer, title };
  } finally {
    await page.close();
  }
}

/**
 * Gracefully close the browser on shutdown
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Handle process shutdown
process.on('SIGINT', closeBrowser);
process.on('SIGTERM', closeBrowser);
