
const ffmpeg = require('fluent-ffmpeg');
getVideoTime()
function getVideoTime(start = '01:04:20.000', end = '01:04:24.000', src = './files/movieFiles/frozen.480.mp4') {
    return new Promise((resolve, reject) => {
        ffmpeg(src)
            .setStartTime(start)
            .duration(end)
            .output('parseVideoToShortOutput.mp4') // Temporary output file
            .on('end', () => {
                resolve('output.mp4');
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
    });
}

module.exports = getVideoTime;
