const ytdl = require('ytdl-core');
const fs = require('fs')
const { exec } = require('child_process');
const { initCRUDAndDatabase } = require('./serverCRUD')
initCRUDAndDatabase()
const { movies_model } = require('./schemas/movies')
const { parseAndTranslate_single } = require('./newContent');
const { getTranscriptionOfAudio } = require('./playground/openai');
const path = require('path');
const { toVtt } = require('subtitles-parser-vtt');
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
const mediaLang = process.argv[3];
const idTitle = process.argv.includes('--idTitle')


if (!videoURL) { throw Error('Pass Url as in Example CLI ') }
if (!mediaLang) { throw Error('Pass media language as in Example CLI ') }

// getVideoInfoAndStore(videoURL)
processYoutubeVideo()
async function processYoutubeVideo() {
    console.log('processing video: ' + videoURL)
    await downloadYouTubeVideo(videoURL)
    const mediaInfo = await getVideoInfoAndStore(videoURL)
    await getTranscriptionAndStoreAsVtt(mediaInfo)
    await parseAndTranslate_single(mediaInfo)
}

// Function to get video information
async function getVideoInfoAndStore(url) {
    let adjustedInfo;
    try {
        const { videoDetails } = await ytdl.getInfo(url);
        const title = idTitle ? videoDetails.videoId : videoDetails.title + '_' + videoDetails.videoId
        adjustedInfo = {
            title,
            mediaLang,
            label: videoDetails.title,
            category: videoDetails.category,
            keywords: videoDetails.keywords,
            isShortsEligible: videoDetails.isShortsEligible,
            youtubeUrl: videoDetails.video_url,
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
async function downloadYouTubeVideo(url) {
    // audio download test 
    // const command = `yt-dlp -f 249 --write-sub --no-check-certificate '${url}'`;
    const video_command = `yt-dlp -f mp4 --write-thumbnail --write-sub --all-subs -o './files/movieFiles/${idTitle ? '' : '%(title)s_'}%(id)s.%(ext)s' --no-check-certificate '${url}'`;
    await executeCli(video_command)
        .then((message) => console.log('Video Download successful:', message))
        .catch((error) => console.error('Video Download failed:', error))

    const audio_command = `yt-dlp -f bestaudio -o './files/movieFiles/${idTitle ? '' : '%(title)s_'}%(id)s.mp3' --no-check-certificate '${url}'`;
    await executeCli(audio_command)
        .then((message) => console.log('Audio Download successful:', message))
        .catch((error) => console.error('Audio Download failed:', error))
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

async function getTranscriptionAndStoreAsVtt(mediaInfo) {
    const vttPath = path.resolve(`files/movieFiles/${mediaInfo.title}.${mediaInfo.mediaLang}.vtt`)
    const isMissingVtt = !fs.existsSync(path.resolve(vttPath))
    if (isMissingVtt) {
        const transcription = await getTranscriptionOfAudio(path.resolve(`files/movieFiles/${mediaInfo.title}.mp3`))

        const newSubtitiles = transcription.segments.map(({ start, end, text, id }) => ({ startTime: start * 1000, endTime: end * 1000, text, id }))
        fs.writeFileSync(vttPath, toVtt(newSubtitiles))
    }
}