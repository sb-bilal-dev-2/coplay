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

initCRUDAndDatabase()

const LEARNING_LANGUAGES = ['ko', 'ru', 'en', 'tr', 'cn']

processNewLearningLanguage()

async function processNewLearningLanguage(langCode) {
    await insertWords()
    await process_translations_and_icons(langCode)
    // await newContent(langCode)

    async function insertWords() {
        const WordInfosModel = mongoose.model(`wordInfos${!!langCode && `_${langCode}`}`, wordInfos.schema)
        const anyWords = await WordInfosModel.find().limit(2)
        const isNotEmpty = anyWords.length
        if (isNotEmpty) return;

        const languageWords = get_languageWords()
        // await WordInfosModel.insertMany(languageWords)
    }

    async function get_languageWords() {
        const words = (fs.readFileSync(`./wordsResearchData/${langCode}_full.txt`, 'utf8')).split('\n').map((item) => item.split(' '))
        const processPath = `./process/newLanguageWords_${langCode.json}`
        const processedWords = fs.existsSync(processPath) ? require(processPath) : []
        let index = -1;
        const wordsToRequest = []

        for (const wordAndOccurance of words) {
            index += 1;
            const word = wordAndOccurance[0]
            const occurance = Number(wordAndOccurance[1])
            const lowOccurance = occurance < 2;
            const isFinish = lowOccurance || index + 1 === words.length

            if (index > processedWords.length && !lowOccurance) {
                wordsToRequest.push({ word, occurance })
            }

            const new_processedWords = Promise.all(wordsToRequest.map(wordInfo => ([promptWordInfo(wordInfo.word), word.occurance])))
            processedWords.push(...new_processedWords)

            fs.writeFileSync(processPath, JSON.stringify(processedWords, undefined, 2))

            if (isFinish) {
                return processedWords
            }
        }
    }

    async function promptWordInfo(word) {
        return promptAI(fs.readFileSync(`./prompts/word_lemma_${langCode}.md`, 'utf8') + word)
    }
}

async function process_translations_and_icons(langCode) {
    const WordInfosModel = mongoose.model(`wordInfos_${langCode}`, wordInfos.schema)
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
        const imageUrl = await requestWordImage(word.lemma)

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


module.exports = { LEARNING_LANGUAGES }
