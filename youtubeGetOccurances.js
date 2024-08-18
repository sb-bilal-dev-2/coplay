// const Client_ID = '286582041318-c9l94c5im2gispviq7kr376ga7u4hgj7.apps.googleusercontent.com'
// const Client_secret = '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'
// const { google } = require('googleapis');
// const axios = require('axios');
// const srtParser = require('subtitle');
require('dotenv').config()

// const youtube = google.youtube({ version: 'v3', auth: process.env.GOOGLE_API_KEY || 'AIzaSyAr4_UXl3AGdIqNzJxLf2mtAzYw4w0WqOs' });
// searchVideos()
// For Linux:
// wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
// sudo apt install ./google-chrome-stable_current_amd64.deb

const puppeteer = require('puppeteer');

async function parseVideoSrcs(keyword, language, numberOfItems) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable' // Only for Linux
  });
  const page = await browser.newPage();
  const url = `https://youglish.com/pronounce/${keyword}/${language}`;

  await page.goto(url, { waitUntil: 'networkidle0' });

  const videoSrcs = [];

  for (let i = 0; i < numberOfItems; i++) {
    // Wait for the iframe to load
    await page.waitForSelector('#player');

    // Get the src of the iframe
    const src = await page.$eval('#player', el => el.src);
    videoSrcs.push(src);

    // Click the next button if it's not the last iteration
    if (i < numberOfItems - 1) {
      await page.click('#b_next');
      // Wait for the page to load the next video
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
  }

  await browser.close();

  return videoSrcs;
}

// Example usage
parseVideoSrcs('hello', 'english', 2)
  .then(srcs => console.log(srcs))
  .catch(err => console.error(err));


async function searchVideos() {
  try {
    const query = 'someone'

    // Search for videos
    const searchResponse = await youtube.search.list({
      part: 'id,snippet',
      q: query + ',cc',
      type: 'video',
      videoCaption: 'closedCaption',
      safeSearch: 'strict',
      maxResults: 5 // Adjust as needed
    });
    console.log('searchResponse', searchResponse.data.items)
    const results = [];

    for (const item of searchResponse.data.items) {
      const videoId = item.id.videoId;

      // Get caption tracks for the video
      const captionResponse = await youtube.captions.list({
        part: 'snippet',
        videoId: videoId
      });

      // Get the first English caption track (you might want to add more logic here)
      const captionTrack = captionResponse.data.items.find(
        track => track.snippet.language === 'en'
      );
      // GET https://www.googleapis.com/youtube/v3/captions/id
    //   console.log('captionTrack', captionTrack)
      if (captionTrack) {
        // Download the actual subtitle content
        // const subtitleResponse = await axios.get(
        //   `https://www.googleapis.com/youtube/v3/captions/${captionTrack.id}`,
        //   { responseType: 'text' }
        // );
        // console.log('subtitleResponse.data', subtitleResponse.data)
        // // Parse the subtitle content
        // const parsedSubtitles = srtParser.parse(subtitleResponse.data);

        // // Search for the query in subtitles
        // const matches = parsedSubtitles?.filter(sub => 
        //   sub.text.toLowerCase().includes(query.toLowerCase())
        // );

        // results.push({
        //   videoId,
        //   title: item.snippet.title,
        //   matches: matches.map(match => ({
        //     text: match.text,
        //     start: match.start,
        //     end: match.end
        //   }))
        // });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
