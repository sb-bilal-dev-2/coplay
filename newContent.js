const { prepareSubtitleTranslations } = require('./openaiTranslateSubtitlesRecoursive.js')
const { parseUsedWords } = require('./parseUsedWords.js');
// Runs for all new content if those don't have processed files
const movies_model = require('./schemas/movies').movies_model;

/**
 * Should request subtitle translations and highlights less known words/phrases
 * Should parse/request used words/phrases
 * Stores movie info in the Database.
 */
const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'tr']

if (process.argv[1].includes('newContent.js')) {
    newContent(process.argv[2])
}

async function newContent_single(mediaInfo) {
    const parsedWords = await parseUsedWords(mediaInfo)
    const translatedMap = {}
    mediaInfo?.subtitleInfos?.forEach(item => { translatedMap[item.translateLang] = true })
    await Promise.all(MAIN_LANGUAGES.filter(item => translatedMap[item]).map(translateLang => {
        return prepareSubtitleTranslations(contentFolder = './files/movieFiles', mediaInfo, translateLang, parsedWords)
    }))
}

async function newContent(mediaLang = 'en') {
    const contentFolder = './files/movieFiles'
    let { missingMediaTranslations, missingMediaParsedWords } = await getNewContentTitles(contentFolder, mediaLang)
    const newParsedSubtitlesMap = {}
    await Promise.all(missingMediaParsedWords.map(async mediaInfo => {
        const mediaTitle = mediaInfo.title
        console.log('mediaTitle: ', mediaTitle)

        newParsedSubtitlesMap[mediaTitle] = await parseUsedWords(mediaInfo)
    }))
    await Promise.all(missingMediaTranslations.map(async ([mediaInfo, translateLang]) => {
        const mediaTitle = mediaInfo.title
        console.log('mediaTitle: ', mediaTitle, translateLang)

        const newSubtitleId = await prepareSubtitleTranslations(contentFolder, mediaInfo, translateLang, newParsedSubtitlesMap[mediaInfo.title])
        console.log('newSubtitleId', newSubtitleId)
        return newSubtitleId
    }))
}

async function getNewContentTitles(contentFolder, mediaLang = 'en') {
    const allMedia = await movies_model.find({})
    const missingMediaTranslations = []
    const missingMediaParsedWords = []

    allMedia.forEach((mediaInfo) => {
        if (!mediaInfo.parsedSubtitleId) {
            missingMediaParsedWords.push(mediaInfo)
        }

        const existingSubtitleTranslationsMap = {}
        mediaInfo?.subtitleInfos?.forEach(subtitleTrans => { existingSubtitleTranslationsMap[subtitleTrans.translateLang] = true })
        console.log('mediaInfo', mediaInfo)
        MAIN_LANGUAGES.forEach((language) => {
            if (language !== mediaLang) {
                if (!existingSubtitleTranslationsMap[language]) {
                    missingMediaTranslations.push([mediaInfo, language])
                }
            }
        })
    })

    console.log('No Translations and highlights for', missingMediaTranslations.map(item => item[0]?.title + ', ' + item[1]))
    console.log('No Parsed Words for', missingMediaParsedWords)

    return {
        missingMediaTranslations,
        missingMediaParsedWords,
    }
}

module.exports = {
    MAIN_LANGUAGES,
    newContent,
    newContent_single
}