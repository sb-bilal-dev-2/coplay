const fs = require('fs')
const { MAIN_LANGUAGES } = require('./mainProcessors/newLanguages.js')
const { prepareSubtitles } = require('./openaiTranslateSubtitlesRecoursive.js')
const { parseUsedWords } = require('./parseUsedWords.js')
// Runs for all new content if those don't have processed files
const movies_model = require('./schemas/movies').movies_model;

/**
 * Should request subtitle translations and highlights less known words/phrases
 * Should parse/request used words/phrases
 * Stores movie info in the Database.
 */

processNewContent()

async function processNewContent(contentFolder = './files/movieFiles', mediaLang = 'en') {
    let { missingMediaTranslations, missingMediaParsedWords, mediaInfoMap } = await getNewContentTitles(contentFolder, mediaLang)

    // missingMediaParsedWords.forEach(mediaTitle => {
    //     const mediaInfo = mediaInfoMap[mediaTitle]
    //     parseUsedWords(contentFolder, mediaInfo)
    // })
    // missingMediaTranslations.forEach(([mediaTitle, translateLang]) => {
    //     const mediaInfo = mediaInfoMap[mediaTitle]
    //     // prepareSubtitles(contentFolder, mediaInfo, translateLang)
    // })
}

async function getNewContentTitles(contentFolder, mediaLang = 'en') {
    const allContents = fs.readdirSync(contentFolder)
    let allMedia = allContents.filter((directory) => directory.includes('.mp4'))
    const missingMediaSubtitles = []
    const missingMediaTranslationsMap = {}
    const mediaInfoMap = {}
    const missingMediaTranslations = []
    const missingMediaParsedWords = []

    const allMediaMap = {}
    allMedia.forEach(directory => {
        console.log('directory', directory)

        const mediaName = directory.split('.')[0]
        allMediaMap[mediaName] = true
    })
    allMedia = Object.keys(allMediaMap)
    console.log("allMedia ", allMedia)
    const movieInfos = await movies_model.find().where('title').in(allMedia).exec();

    movieInfos.forEach(movieInfo => {
        mediaInfoMap[movieInfo.title] = movieInfo; 
    })

    allMedia.forEach((mediaName) => {
        if (!fs.existsSync(`${contentFolder}/${mediaName}.${mediaLang}.vtt`)) {
            missingMediaSubtitles.push(mediaName)
        }

        if (!fs.existsSync(`${contentFolder}/${mediaName}.subtitles.usedWords.json`)) {
            missingMediaParsedWords.push(mediaName)
        }

        MAIN_LANGUAGES.forEach((language) => {
            if (language !== mediaLang) {
                console.log('M L: ', mediaName, language)
                if (!fs.existsSync(`${contentFolder}/${mediaName}.${language}.subtitles.json`)) {
                    if (!missingMediaTranslationsMap[mediaName]) {
                        missingMediaTranslationsMap[mediaName] = {}
                    }
                    missingMediaTranslations.push([mediaName, language])
                    missingMediaTranslationsMap[mediaName][language] = true
                }
            }
        })
    })

    console.log('movieInfos length: ', movieInfos.map(i => i.title))
    console.log('No Subtitles for', missingMediaSubtitles)
    console.log('No Translations and highlights for', missingMediaTranslations)
    console.log('No Parsed Words for', missingMediaParsedWords)

    return {
        missingMediaSubtitles,
        missingMediaTranslations,
        missingMediaParsedWords,
        mediaInfoMap
    }
}
