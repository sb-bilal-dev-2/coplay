const fromVtt = require('subtitles-parser-vtt').fromVtt;
const toVtt = require('subtitles-parser-vtt').toVtt;
const gTranslate = require('./gTranslate').gTranslate;
const mapForTags = require('./src/mapForTags').mapForTags;
const { readFile, writeFile } = require('fs/promises');

const MOVIE_TITLE = 'frozen-2';
const MOVIE_DIR = './public/movies/' + MOVIE_TITLE;
const TARGET_LANG = 'uz';
// const subtitlesVtt = await readFile(subtitlesVttPath);

(async function() {

    const vttFileContent = await readFile(MOVIE_DIR + '/en.vtt', { encoding: 'utf-8'});
    // console.log('vttFileContent', vttFileContent)
    const subtitles = fromVtt(vttFileContent, "ms");
    const subtitlesWithTranslations = await Promise.all(subtitles.map(mapForTags).map(async (subtitle) => {
        let translation = await gTranslate(subtitle.subtitleLines.join(' '), TARGET_LANG);
        if (subtitle.tag) {
            translation = `<${subtitle.tag}>${translation}</${subtitle.tag}>`;
        }
        return {
            ...subtitle,
            text: translation,
        }
    }))
    console.log('sub', subtitlesWithTranslations)
    const translatedVtt = toVtt(subtitlesWithTranslations)
    await writeFile(MOVIE_DIR + '/' + TARGET_LANG + '.vtt', translatedVtt)
})()