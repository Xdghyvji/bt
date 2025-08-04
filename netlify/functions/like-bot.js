// This is the final, self-contained version of the bot.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let browser = null;
  try {
    const { postUrl } = JSON.parse(event.body);

    if (!postUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'postUrl is required' }) };
    }

    // --- FINAL LAUNCH METHOD ---
    // This launches the browser packaged directly with the function.
    // The syntax for executablePath is corrected for the older package version.
    console.log('Launching self-contained browser...');
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      // CORRECTED: Use the property directly, not as a function call.
      executablePath: chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log('Browser launched successfully.');

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the target page
    console.log(`Navigating to ${postUrl}...`);
    await page.goto(postUrl, { waitUntil: 'networkidle2' });

    // Find and click the like button
    const likeButtonSelector = '#likeButton';
    console.log(`Searching for like button with selector: ${likeButtonSelector}`);
    await page.waitForSelector(likeButtonSelector, { timeout: 10000 });
    await page.click(likeButtonSelector);
    console.log('Successfully clicked the like button.');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully liked the post at ${postUrl}` }),
    };
  } catch (error) {
    console.error('Bot Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `An error occurred in the bot function: ${error.message}` }),
    };
  } finally {
    // Disconnect from the browser instance
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
};
