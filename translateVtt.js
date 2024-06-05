const fromVtt = require('subtitles-parser-vtt').fromVtt;
const toVtt = require('subtitles-parser-vtt').toVtt;
const gTranslate = require('./gTranslate').gTranslate;
const mapForTags = require('./src/mapForTags').mapForTags;
const { readFile } = require('fs/promises');

// const translateVtt = toVtt(translateVtt("ru", "lion-king"))
// await writeFileSync(MOVIE_DIR + '/' + targetLang + '.vtt', translateVtt)

async function translateVtt(targetLang = "uz", movieTitle) {
    const MOVIE_DIR = './public/movies/' + movieTitle;
    const vttFileContent = await readFile(MOVIE_DIR + '/en.vtt', { encoding: 'utf-8'});
    // console.log('vttFileContent', vttFileContent)
    const subtitles = fromVtt(vttFileContent, "ms");
    const subtitlesWithTranslations = await Promise.all(subtitles.map(mapForTags).map(async (subtitle) => {
        let translation = await gTranslate(subtitle.subtitleLines.join(' '), { to: targetLang, from: 'en' });
        if (subtitle.tag) {
            translation = `<${subtitle.tag}>${translation}</${subtitle.tag}>`;
        }
        return {
            ...subtitle,
            text: translation,
        }
    }))
    console.log('TRANSLATED: ' + movieTitle, JSON.stringify(subtitlesWithTranslations, undefined, 2))

    return subtitlesWithTranslations
}

module.exports = {
    translateVtt
}