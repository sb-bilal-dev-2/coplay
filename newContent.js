const fs = require('fs')
const { prepareSubtitles } = require('./openaiTranslateSubtitlesRecoursive.js')
const { parseUsedWords } = require('./parseUsedWords.js');
const { subtitles_model } = require('./schemas/subtitles.js');
// Runs for all new content if those don't have processed files
const movies_model = require('./schemas/movies').movies_model;

/**
 * Should request subtitle translations and highlights less known words/phrases
 * Should parse/request used words/phrases
 * Stores movie info in the Database.
 */
const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'tr']

// processNewContent(mediaContent = 'en')

async function processNewContent(mediaLang = 'en') {
    const contentFolder = './files/movieFiles'
    let { missingMediaTranslations, missingMediaParsedWords } = await getNewContentTitles(contentFolder, mediaLang)
    const newParsedSubtitlesMap = {}
    await Promise.all(missingMediaParsedWords.map(async mediaInfo => {
        const mediaTitle = mediaInfo.title
        // console.log('mediaTitle: ', mediaTitle)
        // newParsedSubtitlesMap[mediaInfo.title] = await parseUsedWords(contentFolder, mediaInfo)
    }))
    missingMediaTranslations = [[{
        mediaCharacters: [],
        genre: [],
        hashtags: [],
        _id: '65e820068e299f802746f28c',
        title: 'kung_fu_panda_3',
        label: 'Kung Fu Panda 3',
        subtitleLabels: [],
        __v: 0,
        parsedSubtitleId: '6658ea6d910945dd12a26715',
        subtitleInfos: []
    }, 'uz']]
    await Promise.all(missingMediaTranslations.map(async ([mediaInfo, translateLang]) => {
        const mediaTitle = mediaInfo.title
        console.log('mediaTitle: ', mediaTitle)
        const newSubtitleId = await prepareSubtitles(contentFolder, mediaInfo, translateLang, newParsedSubtitlesMap[mediaInfo.title])
        console.log('newSubtitleId', newSubtitleId)
        return newSubtitleId
    }))
}

async function getNewContentTitles(contentFolder, mediaLang = 'en') {
    // const allContents = fs.readdirSync(contentFolder)
    // let allMedia = allContents.filter((directory) => directory.includes('.mp4'))

    const allMedia = await movies_model.find({})
    const missingMediaTranslations = []
    const missingMediaParsedWords = []

    console.log("allMedia ", allMedia)

    allMedia.forEach((mediaInfo) => {
        if (!mediaInfo.parsedSubtitleId) {
            missingMediaParsedWords.push(mediaInfo)
        }
        const subtitleTranslationsMap = {}
        mediaInfo?.translations?.forEach(translationTitle => { subtitleTranslationsMap[translationTitle] })
        MAIN_LANGUAGES.forEach((language) => {
            if (language !== mediaLang) {
                console.log('M L: ', mediaInfo.title, language)
                if (!subtitleTranslationsMap[language]) {
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
    processNewContent,
}