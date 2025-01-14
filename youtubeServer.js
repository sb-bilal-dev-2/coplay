const ytdl = require('ytdl-core');
const fs = require('fs')
const { exec } = require('child_process');
const { initCRUDAndDatabase } = require('./serverCRUD')
const { movies_model } = require('./schemas/movies')
const { parseAndTranslate_single } = require('./newContent');
const { getTranscriptionOfAudio } = require('./playground/openai');
const path = require('path');
const { toVtt } = require('subtitles-parser-vtt');
const YoutubeTranscript = require('youtube-transcript').YoutubeTranscript;
const { subtitles_model } = require('./schemas/subtitles');

/**
 * Example CLI
 * 
 * node youtubeServer.js 'https://www.youtube.com/watch?v=4m48GqaOz90' en
 */
/**
 * Install CLI
 * sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
 * sudo chmod a+rx /usr/local/bin/yt-dlp
 */
// Sample Request
// yt-dlp -f 251 'https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7' --no-check-certificate
// Request Formats
// yt-dlp -F 'https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7' --no-check-certificate
// [
//     "https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7",
//     "https://youtu.be/WXwgZL4zx9o?si=FNVX_HRjLZsF_Or8",
//     "https://youtu.be/PwQmPLjnSPo?si=3llYzPm3JXlzTjor"
// ]
// Example usage
const videoURL = process.argv[2]?.replaceAll(`'`, ' ').replaceAll(`"`, ' ');
const mediaLangArg = process.argv[3];

// getVideoInfoAndStore(videoURL)
// getVideoInfo(videoURL)
if (videoURL && mediaLangArg) {
    // initCRUDAndDatabase()
    // processYoutubeVideo(videoURL, mediaLangArg)
}

async function processYoutubeVideo(url, mediaLang) {
    if (!url) { throw Error('Pass Url as in Example CLI ') }
    if (!mediaLang) { throw Error('Pass media language as in Example CLI ') }

    console.log('processYoutubeVideo: ' + url)
    const mediaInfo = await getVideoInfoAndStore(url, mediaLang)
    console.log('processYoutubeVideo: new title', mediaInfo.title)
    const transcript = YoutubeTranscript.fetchTranscript("https://www.youtube.com/watch?v=2Vv-BfVoq4g").then(console.log);
    const adaptedTranscript = transcript
    await subtitles_model.insert(adaptedTranscript)
    await parseAndTranslate_single(mediaInfo)

    return subtitles_model.findOne({ youtubeUrl: mediaInfo.youtubeUrl })
}

// Function to get video information
async function getVideoInfoAndStore(url, mediaLang) {
    let adjustedInfo;
    try {
        const { videoDetails } = await ytdl.getInfo(url);
        const title = videoDetails.title + 'YOUTUBE_ID[' + videoDetails.videoId + ']'
        adjustedInfo = {
            title,
            mediaLang: mediaLang || mediaLangArg,
            label: videoDetails.title,
            category: videoDetails.category,
            keywords: videoDetails.keywords,
            isShortsEligible: videoDetails.isShortsEligible,
            youtubeUrl: `https://www.youtube.com/embed/${videoDetails.videoId}`,
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length]
            // youtubeDetails: videoDetails,
        }
        console.log('adjustedInfo', adjustedInfo)
        const newItem = await movies_model.create(adjustedInfo)
        console.log('newItem', newItem)
        return newItem
    } catch (error) {
        const DUPLICATE_KEY_ERROR_CODE = 11000
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            console.log('Skipping to store duplicate title: ' + error.keyValue.title)
            return movies_model.findOne({ title: adjustedInfo.title });
        }
        console.error('Error getting video information:', error);

        throw error;
    }
}

async function getVideoInfo(url) {
    try {
        const { videoDetails } = await ytdl.getInfo(url);
        console.log('videoDetails', videoDetails)
        return videoDetails
    } catch(err) {
        console.log('videoDetails error', error)
    }
}

// yt-dlp -f mp4 --write-sub --all-subs -o './files/movieFiles/%(title)sYOUTUBE_ID[%(id)s].%(ext)s' --no-check-certificate 'https://www.youtube.com/watch?v=2Vv-BfVoq4g'
async function downloadYouTubeVideo(url) {
    // audio download test 
    try {
        const video_command = `yt-dlp -f mp4 --write-thumbnail --write-sub --all-subs -o './files/movieFiles/%(title)s_%(id)s.%(ext)s' --no-check-certificate '${url}'`;
        await executeCli(video_command)
            .then((message) => console.log('Video Download successful:', message))
            .catch((error) => console.error('Video Download failed:', error))
    
        const audio_command = `yt-dlp -f bestaudio -o './files/movieFiles/%(title)s_%(id)s.mp3' --no-check-certificate '${url}'`;
        await executeCli(audio_command)
            .then((message) => console.log('Audio Download successful:', message))
            .catch((error) => console.error('Audio Download failed:', error))

    } catch(err) {
        console.log('ERROR at download: ', err)
    }
    // const command = `yt-dlp -f 249 --write-sub --no-check-certificate '${url}'`;
}

function executeCli(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}

async function getTranscriptionAndStoreAsVtt(mediaInfo, mediaLang) {
    const vttPath = path.resolve(`files/movieFiles/${mediaInfo.title}.${mediaInfo.mediaLang || mediaLang}.vtt`)
    const isMissingVtt = !fs.existsSync(path.resolve(vttPath))
    if (isMissingVtt) {
        const transcription = await getTranscriptionOfAudio(path.resolve(`files/movieFiles/${mediaInfo.title}.mp3`))

        const newSubtitiles = transcription.segments.map(({ start, end, text, id }) => ({ startTime: start * 1000, endTime: end * 1000, text, id }))
        fs.writeFileSync(vttPath, toVtt(newSubtitiles))
    }
}

module.exports = {
    processYoutubeVideo,
    getVideoInfoAndStore
}
