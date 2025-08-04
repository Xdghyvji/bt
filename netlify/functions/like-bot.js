// This is our serverless backend function.
// Its code does not need to change, as it's independent of the frontend build tool.
const puppeteer = require('puppeteer-core');

// --- IMPORTANT CONFIGURATION ---
// For local testing, you need to find your browser's WebSocket endpoint.
// 1. Close all instances of Chrome.
// 2. Open it from your command line with the remote debugging flag.
//    - Windows: "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
//    - macOS: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
// 3. It will print a WebSocket URL like "ws://127.0.0.1:9222/devtools/browser/..."
// 4. Paste that URL here.
const LOCAL_BROWSER_ENDPOINT = "ws://127.0.0.1:9222/devtools/browser/your-unique-ws-id";

// For production on Netlify, you would get this from a service like Browserless.io
// and store it as an environment variable in the Netlify UI.
const PRODUCTION_BROWSER_ENDPOINT = process.env.BROWSERLESS_ENDPOINT;

exports.handler = async (event) => {
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

    // Determine which browser endpoint to use
    const browserWSEndpoint = process.env.NETLIFY_DEV
      ? LOCAL_BROWSER_ENDPOINT
      : PRODUCTION_BROWSER_ENDPOINT;

    if (process.env.NETLIFY_DEV && browserWSEndpoint.includes('your-unique-ws-id')) {
        throw new Error("Please update the LOCAL_BROWSER_ENDPOINT in netlify/functions/like-bot.js with your browser's real WebSocket URL for local testing.");
    }

    // Connect to the browser instance
    console.log('Connecting to browser...');
    browser = await puppeteer.connect({ browserWSEndpoint });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the target page
    console.log(`Navigating to ${postUrl}...`);
    await page.goto(postUrl, { waitUntil: 'networkidle2' });

    // Find and click the like button
    const likeButtonSelector = '#likeButton'; // This is the selector for our test page
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
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    // Disconnect from the browser instance
    if (browser) {
      await browser.disconnect();
      console.log('Disconnected from browser.');
    }
  }
};
