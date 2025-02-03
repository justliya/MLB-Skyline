const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/getVideoUrl', async (req, res) => {
  const url = req.query.url;
  const play_id = req.query.playId;

  if (!url || !play_id) {
    return res.status(400).send("Missing required parameters");
  }

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
    headless: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const videoPath = await page.evaluate((play_id) => {
      const anchor = Array.from(document.querySelectorAll('a'))
        .find(a => a.href.includes(play_id));

      if (anchor) {
        const url = new URL(anchor.href);
        return url.pathname;
      }
      return null;
    }, play_id);
    await browser.close();

    if (videoPath) {
      return res.status(200).send(videoPath);
    } else {
      return res.status(400).send('Video path not found');
    }
  } catch (error) {
    console.error('Error extracting video path', error);
    await browser.close();
    return res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
