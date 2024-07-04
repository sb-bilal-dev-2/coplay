const ytdl = require('ytdl-core');
const fs = require('fs')
const { exec } = require('child_process');
const { initCRUDAndDatabase } = require('./serverCRUD')
initCRUDAndDatabase()
const { movies_model } = require('./schemas/movies')
const { newContent_single } = require('./newContent')
/**
 * Example CLI
 * 
 * node youtubeServer.js 'https://www.youtube.com/watch?v=BtAm8DITKyI' en
 */

// For CLI Download https://ytdl-org.github.io/youtube-dl/download.html
/**
git clone https://github.com/ytdl-org/youtube-dl.git youtube-dl
cd youtube-dl/
make youtube-dl
sudo cp youtube-dl /usr/local/bin/
 */
// Sample Request
// youtube-dl -f 251 'https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7' --no-check-certificate
// Request Formats
// youtube-dl -F 'https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7' --no-check-certificate
// [
//     "https://youtu.be/EgT_us6AsDg?si=uyyHR0YYTm3JyIZ7",
//     "https://youtu.be/WXwgZL4zx9o?si=FNVX_HRjLZsF_Or8",
//     "https://youtu.be/PwQmPLjnSPo?si=3llYzPm3JXlzTjor"
// ]
// Example usage
const videoURL = process.argv[2]?.replaceAll(`'`).replaceAll(`"`);
const mediaLang = process.argv[3];
if (!videoURL) { throw Error('Pass Url as in Example CLI ') }
if (!mediaLang) { throw Error('Pass media language as in Example CLI ') }

// getVideoInfoAndStore(videoURL)
processYoutubeVideo()
async function processYoutubeVideo() {
    console.log('processing video: ' + videoURL)
    await downloadYouTubeVideo(videoURL)
    const mediaInfo = await getVideoInfoAndStore(videoURL)
    await newContent_single(mediaLang, mediaInfo)
}

// Function to get video information
async function getVideoInfoAndStore(url) {
    try {
        const { videoDetails } = await ytdl.getInfo(url);
        const title = videoDetails.title + '_' + videoDetails.author.name
        const adjustedInfo = {
            title,
            mediaLang,
            label: videoDetails.title,
            category: videoDetails.category,
            isShortsEligible: videoDetails.isShortsEligible,
            youtubeUrl: url,
            // youtubeDetails: videoDetails,

        }
        const webpLocation = `"./files/movieFiles/${title}.webp"`
        if (fs.existsSync(webpLocation)) {
            const renameThumbnailExt_command = `mv ${webpLocation} "./files/movieFiles/${title}.jpg"`
            await executeCli(renameThumbnailExt_command)
        }

        console.log('adjustedInfo', adjustedInfo)
        const newItem = await movies_model.create(adjustedInfo)

        return newItem
    } catch (error) {
        console.error('Error getting video information:', error);
        throw error;
    }
}

async function downloadYouTubeVideo(url) {
    // audio download test 
    // const command = `youtube-dl -f 249 --write-sub --no-check-certificate '${url}'`;
    const video_command = `youtube-dl -f mp4 --write-thumbnail --write-sub --all-subs -o './files/movieFiles/%(title)s_%(uploader)s.%(ext)s' --no-check-certificate '${url}'`;
    await executeCli(video_command)
        .then((message) => console.log('Video Download successful:', message))
        .catch((error) => console.error('Video Download failed:', error))

    const audio_command = `youtube-dl -f 249 -o './files/movieFiles/%(title)s_%(uploader)s.%(ext)s' --no-check-certificate '${url}'`;
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

