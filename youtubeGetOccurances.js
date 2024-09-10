// const Client_ID = '286582041318-c9l94c5im2gispviq7kr376ga7u4hgj7.apps.googleusercontent.com'
// const Client_secret = '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'
const { google } = require('googleapis');
const fs = require('fs')
const path = require('path')
const os = require('os')
const { exec } = require('child_process')
// const axios = require('axios');
// const srtParser = require('subtitle');
require('dotenv').config()
const { initCRUDAndDatabase } = require('./serverCRUD')
initCRUDAndDatabase()
const { schema: wordInfosSchema } = require('./schemas/wordInfos')
const { wordCollections_model } = require('./schemas/wordCollections')
const ytdl = require('ytdl-core')
const puppeteer = require('puppeteer')

const youtube = google.youtube({ version: 'v3', auth: process.env.GOOGLE_API_KEY || 'AIzaSyAr4_UXl3AGdIqNzJxLf2mtAzYw4w0WqOs' });
// searchVideos()
// For Linux:
// wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
// sudo apt install ./google-chrome-stable_current_amd64.deb
const pinyin = require("chinese-to-pinyin")

const { default: mongoose } = require('mongoose');
const { promptWordInfos } = require('./promptWordInfos');
const { getIsPhrase } = require('./utils/getIsPhrase');

// Call the update function
// updateWordCollectionWordInfos('zh-CN')
// updateAllWord('en');
// getWordOccuranceThroughYouglish('便宜', 'zh-CN', 3)
//   .then(srcs => console.log(srcs))
//   .catch(err => console.error(err));

// searchDownloadAndCheckSubtitles('这个多少钱?', 'zh-CN')
// searchDownloadAndCheckSubtitles('Someone', 'en')
// .then(results => {
//   console.log('Results:', results);
// })
// .catch(error => {
//   console.error('Error:', error);
// });


async function updateWordCollectionWordInfos(mediaLang) {
  const wordCollections = await wordCollections_model.find({ mediaLang })
  const keywords = wordCollections.reduce((acc, item) => acc.concat(item.keywords), [])
  const WordInfosModel = mongoose.model(`wordInfos${!!mediaLang && `__${mediaLang.toLowerCase()}__s`}`, wordInfosSchema)
  console.log('keywords', keywords)

  for (const keyword of keywords) {
    const { the_word } = keyword;
    const existingWordInfo = await WordInfosModel.findOne({ the_word: the_word })
    console.log('existingWordInfo for ' + the_word, existingWordInfo)

    const isPhrase = getIsPhrase(the_word, mediaLang)
    const { youglishSrcs, youglishOccurances } = await getWordOccuranceThroughYouglish(the_word, mediaLang, 15)
    const newWordInfo = existingWordInfo || { isPhrase, the_word: the_word }
    newWordInfo.youglishSrcs = youglishSrcs;
    newWordInfo.youglishOccurances = youglishOccurances;
    newWordInfo.youglishParsed = true;
    console.log('youglishSrcs', youglishSrcs)
    console.log('youglishOccurances', youglishOccurances)
    if (existingWordInfo) {
      await newWordInfo.save()
    }

    // const promptRes =  existingWordInfo?.shortDefinition ? {} : (await promptWordInfos([the_word], mediaLang))[0]
    const promptRes =  (await promptWordInfos([the_word], mediaLang))[0]
    
    Object.keys(promptRes).forEach((key) => {
      newWordInfo[key] = promptRes[key]
    })

    if (existingWordInfo) {
      await newWordInfo.save()
    } else if (!existingWordInfo) {
      await WordInfosModel.create(newWordInfo)
    }
    // await promptWordInfoAndUpdateDB(the_word, mediaLang)
  }
  console.log('UPDATED KEYWORDS:', keywords.map(item => item.the_word))
}

const ROMINIZE_FUNCTION = {
  'zh-CN': (text) => pinyin(text),
  'jp': () => { },
  'th': () => { },
  'ko': () => { },
  'default': () => { }
}

async function updateAllWord(langCode) {
  const WordInfosModel = mongoose.model(`wordInfos${!!langCode && `__${langCode}__s`}`, wordInfosSchema)
  try {
    // Fetch all wordInfos
    const wordInfos = await WordInfosModel.find({}).sort({ occurance: 1 });
    console.log('wordInfos', wordInfos)
    // Use for...of to handle async operations sequentially
    for (const wordInfo of wordInfos) {
      const { the_word, occurance } = wordInfo;

      try {
        // Call the getWordOccuranceThroughYouglish function for the current wordInfo
        const { youglishSrcs, youglishOccurances } = await getWordOccuranceThroughYouglish(the_word, langCode, 5);

        // Update the wordInfo document with the obtained sources
        wordInfo.youglishSrcs = youglishSrcs;
        wordInfo.youglishOccurances = youglishOccurances;
        wordInfo.youglishParsed = true;
        await wordInfo.save();

        console.log(`Successfully updated: ${the_word} occ: ${occurance} new videoSrcs.length: ${videoSrcs.length}`);
      } catch (err) {
        // Handle errors specific to the current wordInfo
        console.error(`Error processing ${the_word} occ: ${occurance}`, err);
        // Optionally, update the document with an error status or leave it unchanged
        wordInfo.youglishSrcs = [];
        wordInfo.youglishOccurances = 0;
        wordInfo.youglishParsed = true;

        await wordInfo.save();
      }
    }

    console.log('All wordInfos processed.');
  } catch (err) {
    // Handle errors that occur during the database operation or iteration
    console.error('Error fetching or updating wordInfos:', err);
  }
}

const LANGUAGE_QUERY_BY_LANG_CODE = {
  'en': 'english',
  'en-US': 'english',
  'ru': 'russian',
  'zh-CN': 'chinese'
}

async function getWordOccuranceThroughYouglish(keyword, langCode, numberOfItems) {
  const browser = await puppeteer.launch({
    args: ['--incognito'],
    // headless: false,
    // executablePath: '/usr/bin/google-chrome-stable' // Only for Linux
    timeout: 10000
  });
  console.log('launched browser...')
  // Create a new incognito browser context
  // const context = await browser.createIncognitoBrowserContext();
  // Create a new page inside the incognito context
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  const url = `https://youglish.com/pronounce/${keyword}/${LANGUAGE_QUERY_BY_LANG_CODE[langCode]}`;

  await page.goto(url, { waitUntil: 'networkidle0' });
    // That's it, a single line of code to solve reCAPTCHAs 🎉

  console.log('new page')
  await page.screenshot({ path: 'screenshot1.png' });

  await page.screenshot({ path: 'screenshot2.png' });

  const youglishSrcs = [];
  let youglishOccurances;
  try {
    youglishOccurances = Number(await page.$eval('#ttl_total', el => el.innerHTML)) || 0    
  } catch (err) {
  }

  try {
    const limit = (youglishOccurances < numberOfItems ? youglishOccurances : numberOfItems) - 1
    for (let i = 0; i < limit; i++) {
      // Wait for the iframe to load
      await page.waitForSelector('#player');
      await page.screenshot({ path: 'screenshot2.png' });

      // let src = await page.$eval('#player', el => el.src);
      // Get the src of the iframe
      await page.click('#player', { button: 'right' });
      // // await videoElement.click({ button: 'right' });
      await page.screenshot({ path: 'screenshot_rightclick.png' });
      const iframeElement = await page.waitForSelector('#player');
      const iframe = await iframeElement.contentFrame();
      console.log('iframe', iframe)
      await iframe.waitForSelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-wrapper > span.ytp-time-current')
      const lastAnchorElement = await iframe.$('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > a:last-of-type');
      console.log('lastAnchorElement', lastAnchorElement)
      const timeElement = await iframe.$('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-wrapper > span.ytp-time-current');
      const timeElementContent = await iframe.evaluate(el => el.innerHTML, timeElement);
      const timeInSeconds = timeToSeconds(timeElementContent.trim())
      console.log('Time: ', timeElementContent, timeInSeconds)
      const href = lastAnchorElement && await iframe.evaluate(el => el.getAttribute('href'), lastAnchorElement);
      console.log('Href of the last <a> tag:', href);
      // #movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > a
      const src = href + '&t=' + timeInSeconds
      // await page.screenshot({ path: 'screenshot_mouse_to_youtube.png' });

      // await new Promise(res => setTimeout(res, 2000))
      // Wait for the clipboard operation to complete
      // await page.waitForTimeout(1000);

      // Evaluate in browser context to get clipboard content
      // const copiedUrl2 = await page.evaluate(() => navigator.clipboard.readText());

      // console.log('copiedUrl2 video URL at current time:', copiedUrl2);

      // const title = await page.$eval('#player', el => el.title);
      // src = copiedUrl;
      console.log(`src ${i + 1} of ${limit}`, src)
      // const elementHandle = await page.$('#player_container');
      // console.log('html', await page.evaluate(el => el.outerHTML, elementHandle))

      youglishSrcs.push(src);
      // Click the next button if it's not the last iteration
      if (i < limit - 1) {
        await page.click('#b_next');
        // Wait for the page to load the next video
        await page.screenshot({ path: 'screenshot3.png' });
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });
        // await page.screenshot({ path: 'screenshot4.png' });
      }
    }

  } catch (err) {

  }

  await browser.close();

  return { youglishSrcs, youglishOccurances };
}

// Example usage
// getWordOccuranceThroughYouglish('hello', 'en', 2)
//   .then(srcs => console.log(srcs))
//   .catch(err => console.error(err));

function executeCli(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`Stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function searchDownloadAndCheckSubtitles(query, mediaLang = 'en') {
  try {
    const videos = await searchVideos(query, mediaLang);
    const results = [];

    const tempDir = 'files/temp';
    fs.rmSync(tempDir)
    fs.mkdirSync(tempDir)
    for (const video of videos) {
      const subtitlesPath = await downloadSubtitles(video.id, tempDir, mediaLang);
      if (subtitlesPath) {
        const parsedSubtitles = await parseSubtitles(subtitlesPath);
        const matches = checkSubtitlesForQuery(parsedSubtitles, query);
        if (matches.length > 0) {
          results.push({
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            title: video.title,
            matches: matches
          });
        }
      }
    }

    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });

    return results;
  } catch (error) {
    console.error('Error in searchDownloadAndCheckSubtitles:', error);
    return [];
  }
}

async function searchVideos(query, mediaLang) {
  const searchResponse = await youtube.search.list({
    part: 'id,snippet',
    q: `"${query}"`,
    type: 'video',
    videoCaption: 'closedCaption',
    safeSearch: 'strict',
    maxResults: 30
  });

  return searchResponse.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title
  }));
}

async function downloadSubtitles(videoId, tempDir, mediaLang) {
  const outputTemplate = path.join(tempDir, `${videoId}.%(ext)s`);
  // const command = `yt-dlp --skip-download --write-sub --sub-lang ${mediaLang} --no-check-certificate -o "${outputTemplate}" https://www.youtube.com/watch?v=${videoId}`;
  const url = `https://www.youtube.com/watch?v=${videoId}`
  try {
    const video_command = `yt-dlp -f mp4 --write-thumbnail --skip-download --write-sub --all-subs -o '${tempDir}/%(id)s.%(ext)s' --no-check-certificate '${url}'`;
    await executeCli(video_command)
      .then((message) => console.log('Video Download successful:', message))
      .catch((error) => console.error('Video Download failed:', error))
    const subtitlesPath = path.join('./files/temp', `${videoId}.${mediaLang}.vtt`);

    // Check if the file exists
    if (fs.existsSync(subtitlesPath)) {
      return subtitlesPath;
    };
  } catch (error) {
    console.error(`Error downloading subtitles for video ${videoId}:`, error);
    return null;
  }
}

async function parseSubtitles(vttPath) {
  try {
    const vttContent = await fs.readFile(vttPath, 'utf-8');
    return vttFrom(vttContent, 's', true); // Assuming YouTube auto-transcript format
  } catch (error) {
    console.error(`Error parsing VTT file: ${error}`);
    return null;
  }
}

function checkSubtitlesForQuery(parsedSubtitles, query) {
  const matches = [];
  for (const subtitle of parsedSubtitles) {
    if (subtitle.text.toLowerCase().includes(query.toLowerCase())) {
      matches.push({
        text: subtitle.text,
        start: subtitle.start,
        end: subtitle.end
      });
    }
  }
  return matches;
}
// const ytdl = require('ytdl-core');
// const { google } = require('googleapis');

// // You need to set up a Google Cloud project and get an API key
// const API_KEY = 'YOUR_YOUTUBE_API_KEY';
// const youtube = google.youtube({ version: 'v3', auth: API_KEY });

async function getChannelVideos(channelId, maxResults = 50) {
  try {
    const response = await youtube.search.list({
      part: 'id',
      channelId: channelId,
      type: 'video',
      order: 'date',
      maxResults: maxResults
    });

    return response.data.items.map(item => `https://www.youtube.com/watch?v=${item.id.videoId}`);
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

async function getPlaylistVideos(playlistId, maxResults = 50) {
  try {
    const response = await youtube.playlistItems.list({
      part: 'contentDetails',
      playlistId: playlistId,
      maxResults: maxResults
    });

    return response.data.items.map(item => `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`);
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return [];
  }
}

function timeToSeconds(timeString) {
  // Split the timeString by colon
  const parts = timeString.split(':').map(part => parseInt(part, 10));

  // Initialize variables with default values
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Assign values based on the number of parts
  if (parts.length === 3) {
    hours = parts[0];
    minutes = parts[1];
    seconds = parts[2];
  } else if (parts.length === 2) {
    minutes = parts[0];
    seconds = parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }

  // Calculate the total seconds
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Example usage:
// async function main() {
//   const channelId = 'UCBR8-60-B28hp2BmDPdntcQ'; // YouTube Spotlight channel
//   const playlistId = 'PLbpi6ZahtOH6Blw3RGYpWkSByi_T7Rygb'; // YouTube Rewind playlist

//   const channelVideos = await getChannelVideos(channelId);
//   console.log('Channel videos:', channelVideos);

//   const playlistVideos = await getPlaylistVideos(playlistId);
//   console.log('Playlist videos:', playlistVideos);

//   // Example of downloading a video using ytdl-core
//   if (channelVideos.length > 0) {
//     const videoUrl = channelVideos[0];
//     // ytdl(videoUrl).pipe(fs.createWriteStream('video.mp4'));
//   }
// }

// main();
module.exports = {
  updateWordCollectionWordInfos
}
