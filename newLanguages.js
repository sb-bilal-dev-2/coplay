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
// processNewLearningLanguage('en')
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
        console.log('successfully inserted ' + languageWords.length + ' words for ' + langCode)
        return languageWords.length
    }
}

async function get_languageWords(langCode, minimumOccurance) {
    const MINIMUM_OCCURANCE = minimumOccurance || 30
    const url = `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${langCode}/${langCode}_full.txt`
    console.log('requested words: ', url)
    const response = await axios.get(url);

    const words = response.data.split('\n').map((item) => item.split(' ')).filter(item => Number(item[1]) >= MINIMUM_OCCURANCE).map(item => ({ the_word: item[0], occuranceCount: Number(item[1]) }))

    return words
}

module.exports = { LEARNING_LANGUAGES, get_languageWords }
