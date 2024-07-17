// Creates new db collections and adds new language to database
// Creates web page translations
// Storaes language words in the database
// Runs processNewWords for the language
// const MAIN_LANGUAGES = ['uz', 'ru', 'en', 'cn', 'ko', 'jp', 'tr', 'kk', 'ky', 'az', 'ta', 'fa']
// const LEARNING_LANGUAGES = ['en', 'ru', 'cn', 'ko', 'jp', 'fr', 'sp', 'it', 'tr', 'uz', 'ar']
const fs = require('fs')
const { default: mongoose } = require('mongoose');
const wordInfos = require('./schemas/wordInfos');
const { gTranslate } = require('./gTranslate');
const { generateImage, promptAI } = require('./playground/openai');
const { initCRUDAndDatabase } = require('./serverCRUD');
const { default: axios } = require('axios');

initCRUDAndDatabase()

// Available word occurances = https://github.com/hermitdave/FrequencyWords/tree/master/content/2018
const LEARNING_LANGUAGES = ['ko', 'ru', 'en', 'tr', 'zh_cn']
// potential_languages = ['ar', 'jp', 'de', 'it', 'es', 'hi', 'pt']
// others ['in', 'th', 'pt_br', 'uk']
// Promise.all(potential_languages.map(async (langCode) => await processNewLearningLanguage(langCode))
// processNewLearningLanguage('tr')
// processNewLearningLanguage('fr')
// processNewLearningLanguage('ko')
// processNewLearningLanguage('ru')
// processCommonWordInfos('ru')
async function processNewLearningLanguage(langCode, minimumOccurance) {
    return await insertWords()

    async function insertWords() {
        const WordInfosModel = mongoose.model(`wordInfos${!!langCode && `__${langCode}__s`}`, wordInfos.schema)
        const anyWords = await WordInfosModel.find().limit(2)
        const isNotEmpty = anyWords.length
        if (isNotEmpty) {
            console.log(`wordInfos_${langCode} is not empty`)
            // if (minimumOccurance) {
            //     let languageWords = await get_languageWords(langCode, minimumOccurance)
            //     const insertedMinimumOccurance = languageWords.sort((itemA, itemB) => itemA.occuranceCount - itemB.occuranceCount)[0].occuranceCount
            //     languageWords = languageWords.filter(item => item.occuranceCount < insertedMinimumOccurance)
            //     await WordInfosModel.insertMany(languageWords)
            // }
            return;
        }

        const languageWords = await get_languageWords(langCode, minimumOccurance)
        console.log('languageWords', languageWords)
        await WordInfosModel.insertMany(languageWords)
        console.log('successfully inserted ' + languageWords.length +' words for ' + langCode)
        return languageWords.length
    }
}

async function get_languageWords(langCode, minimumOccurance) {
    const MINIMUM_OCCURANCE = minimumOccurance || 30
    const url = `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${langCode}/${langCode}_full.txt`
    console.log('requested url: ', url)
    const response = await axios.get(url);
    console.log('words file response', response)

    const words = response.data.split('\n').map((item) => item.split(' ')).filter(item => Number(item[1]) >= MINIMUM_OCCURANCE).map(item => ({ the_word: item[0], occuranceCount: Number(item[1])}))

    return words
}


async function processCommonWordInfos(langCode, words, minimumOccurance) {
    const WordInfosModel = mongoose.model(`wordInfos${!!langCode && `_${langCode}`}`, wordInfos.schema)
    words = await WordInfosModel.find({ lemma: null })
    const MINIMUM_OCCURANCE = minimumOccurance || 200;
    const PROCESS_ITEMS_PER_INTERVAL = 20;
    // const file = fs.readFileSync(`./wordsResearchData/${langCode}_full.txt`, 'utf8')
    // const words = file.split('\n').map((item) => item.split(' '))
    const processPath = `./process/newLanguageWords_${langCode}.json`
    const processedWords = fs.existsSync(processPath) ? require(processPath) : []
    let index = -1;
    let wordsToRequest = []

    for (const wordInfo of words) {
        index += 1;
        const lowOccurance = wordInfo.occuranceCount < MINIMUM_OCCURANCE;
        const isFinish = lowOccurance || index + 1 === words.length
        if (index > processedWords.length && !lowOccurance) {
            wordsToRequest.push(wordInfo)
        }

        if (wordsToRequest.length === PROCESS_ITEMS_PER_INTERVAL) {
            const new_processedWords = await Promise.all(wordsToRequest.map(async (wrdInfo) => {
                const { lemma, the_word, occuranceCount } = wrdInfo
                // if (occurance < 100) return { word, occurance }
                let wordPromptInfo = wrdInfo;
                try {
                    if (!lemma) {
                        wordPromptInfo = await promptWordInfo(the_word)
                    }
                } catch (err) {
                    return wrdInfo
                }
                return { ...wordPromptInfo, occuranceCount }
            }))
            processedWords.push(...new_processedWords)
            fs.writeFileSync(processPath, JSON.stringify(processedWords, undefined, 2))
            wordsToRequest = []
        }

        if (isFinish) {
            return processedWords
        }
    }
}

async function process_translations_and_icons(langCode) {
    const WordInfosModel = mongoose.model(`wordInfos__${langCode}__s`, wordInfos.schema)
    const words = WordInfosModel.find({ translation: null })

    const translationsMap = {}
    const descriptionsMap = {}
    const imageUrlsMap = {}

    words.map(async (word) => {
        if (word.translation) return;
        const { translation, inflectionTranslations } = await requestWordTranslation(word.lemma, word.inflections)

        translationsMap[word.lemma] = { translation, inflectionTranslations }
    })

    words.map(async (word) => {
        if (word.translation) return;
        const { description } = await requestDescriptions(word.lemma)

        descriptionsMap[word.lemma] = { description }
    })

    words.map(async (word) => {
        if (word.imageUrl) return;
        // const imageUrl = await requestWordImage(word.lemma)

        imageUrlsMap[word.lemma] = { imageUrl }
    })

    await Promise.all(words.map(async (word) => {
        const updatedKeys = {}
        if (translationsMap[word]) {
            updatedKeys.translation = translationsMap[word]
        }
        if (descriptionsMap[word]) {
            updatedKeys.description = descriptionsMap[word]
        }
        if (imageUrlsMap[word]) {
            updatedKeys.imageUrl = imageUrlsMap[word]
        }
        return WordInfosModel.findByIdAndUpdate(word._id, updatedKeys)
    }))

    async function requestWordTranslation(wordLemma, wordInflections) {
        const translation = await gTranslate(wordLemma)
        const inflectionTranslations = (await gTranslate(wordInflections.join(', '))).split(', ')
        return { translation, inflectionTranslations }
    }

    async function requestWordImage(wordLemma) {
        return generateImage("Create icon like colorful image for the given word/phrase: " + wordLemma)
    }
}


module.exports = { LEARNING_LANGUAGES, get_languageWords }
