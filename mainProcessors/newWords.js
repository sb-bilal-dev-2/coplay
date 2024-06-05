
// Runs for all new words if those don't have processed data within the wordInfos collection

const wordInfos = require("../schemas/wordInfos");

/**
 * Should request word Inflictions (variations) and occurance and other
 * Should reqeust Definition, Pronounciation, Romanization & (some other variables should be defined).
 * Should Translate word to different languages
 * Should request Examples, Synonyms, Antonyms
 * Should request openAI Image (simplistic) src for the word
 * Should request openAI Context Image
 */

const SUPPORTED_LANGUAGES_GPT = {

}
const TRANSLATE_FROM = 'RU'

async function processNewWords(lang = '') {
    const wordsModel = wordInfos["wordInfos_model" + lang]
    const words = wordsModel.find({})
    const isLangEligibleForGPT = SUPPORTED_LANGUAGES_GPT[lang]
    const updatedWords = Promise.all(words.map(requestWord))

    await wordsModel.updateMany(updatedWords)
}
