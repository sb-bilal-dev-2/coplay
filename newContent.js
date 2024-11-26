const { translateSubtitlesAndStoreToDB } = require('./openaiTranslateSubtitlesRecoursive.js')
const { addVttToDB } = require('./parseUsedWords.js');
// Runs for all new content if those don't have processed files
const movies_model = require('./schemas/movies').movies_model;

/**
 * Should request subtitle translations and highlights less known words/phrases
 * Should parse/request used words/phrases
 * Stores movie info in the Database.
 */
const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'tr']

/**
 * to add vtt subtitles of videos to db of the given language
 * 
 * SAMPLE USAGE:
 * 
 * node newContent.js --mediaLang en
 * 
 * SAMPLE USAGE single video: 
 *   
 * node newContent.js --title kungfu_panda_3
 */


newContentCLI()

async function parseAndTranslate_single(mediaInfo, translateLanguages) {
    try {
        if (typeof mediaInfo === 'string') {
            try {
                mediaInfo = await movies_model.findOne({ title: mediaInfo })
            } catch(err) {
                console.error('err.code: ' + err.code + ' err.message: ' + err.message)
            }

            console.log('Parsing Media. Info: ', mediaInfo)
        }
        let parsedWords
        if (!mediaInfo.parsedSubtitleId) {
            console.log('Will parse subtitle for the title: ' + mediaInfo.title)

            parsedWords = await addVttToDB(mediaInfo)
        }
        const translatedMap = {}
        mediaInfo?.subtitleInfos?.forEach(item => { translatedMap[item.translateLang] = true })

        console.log('Translating languages: ', translateLanguages)
        if (translateLanguages) {
            await Promise.all((translateLanguages.length ? translateLanguages : MAIN_LANGUAGES).filter(item => !translatedMap[item] && item !== mediaInfo.mediaLang).map(translateLang => {
                return translateSubtitlesAndStoreToDB('./files/movieFiles', mediaInfo, translateLang, parsedWords)
            }))
        }    
    } catch(error) {
        console.log('Error code and message: ', error.code, error.message)
    }
}

async function parseAndTranslate(mediaLang = 'en', translateLanguages) {
    const allMedia = await movies_model.find({ mediaLang })
    await Promise.all(allMedia.map(async (mediaInfo) => parseAndTranslate_single(mediaInfo, translateLanguages)))
}

async function newContentCLI() {
    if (process.argv[1].includes('newContent') ) {
        const translateLangsCmdIndex = process.argv.indexOf('--translateLangs')
        let translateLangs;
        if (translateLangsCmdIndex !== -1) {
            translateLangs = process.argv[translateLangsCmdIndex + 1]?.split(',') || []
        }

        const singleContent = process.argv.indexOf('--title')
        if (singleContent !== -1) {
            const title = process.argv[singleContent + 1]?.replaceAll('"', ' ')
    
            if (!title) {
              console.log('No title was followed after --title')
            } {
              console.log('Parsing the title: ' + title)
              parseAndTranslate_single(title, translateLangs)
            }
        } else {
            const mediaLang = process.argv.indexOf('--mediaLang')
    
            if (mediaLang === -1) {
                console.log('Pass either `--title TITLE` or `--mediaLang en` to process all english')
            }
            parseAndTranslate(process.argv[2], translateLangs)
        }
    }    
}

module.exports = {
    MAIN_LANGUAGES,
    parseAndTranslate,
    parseAndTranslate_single
}