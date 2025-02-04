const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/getVideoUrl', async (req, res) => {
  const url = req.query.url;
  const play_id = req.query.playId;

  if (!url || !play_id) {
    console.error('Missing required parameters');
    return res.status(400).send("Missing required parameters");
  }

  console.log(`Received request for URL: ${url} and Play ID: ${play_id}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      headless: 'new',
    });

    const page = await browser.newPage();
    console.log('Browser launched and new page created');

    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log(`Navigated to URL: ${url}`);

    const videoPath = await page.evaluate((play_id) => {
      const anchor = Array.from(document.querySelectorAll('a'))
        .find(a => a.href.includes(play_id));

      console.log('Anchor element:', anchor);
      if (anchor) {
        const regex = new RegExp('\\\/video\\\/(.+)\\?', 'gm')
        const match = anchor.href.match(regex);
        console.log('anchor', anchor);
        console.log('match', match);
        return match ? match[1] : null;
      }
      return null;
    }, play_id);

    console.log(`Extracted video path: ${videoPath}`);
    await browser.close();

    if (videoPath) {
      const newUrl = `https://streamable.com/m/${videoPath}?partnerId=web_video-playback-page_video-share`
      console.log(`Returning video URL: ${newUrl}`);
      return res.status(200).send(newUrl);
    } else {
      console.error('Video path not found');
      return res.status(400).send('Video path not found');
    }
  } catch (error) {
    console.error('Error extracting video path', error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
