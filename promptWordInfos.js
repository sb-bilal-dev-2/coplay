const { default: mongoose } = require("mongoose");
// const wordInfos = require("./schemas/wordInfos");
const fs = require("fs");
const { promptAI, generateImage } = require("./playground/openai");
const { gTranslate } = require("./gTranslate");
const { schema: wordInfosSchema } = require('./schemas/wordInfos');

// require("./serverCRUD").initCRUDAndDatabase()

// const words_example = ['hello', 'new', 'told', 'lie', 'go']
// promptWordInfos(words_example, 'en', 10)
const MINUTE = (1000 * 60) + 500
const SAMPLE_INPUT_STRINGIFIED = JSON.stringify(
    { the_word: 'go', langCode: 'en' }
)
const SAMPLE_RESPONSE_STRINGIFIED = JSON.stringify({
    lemma: 'go',
    rootWord: 'go',
    functions: ['verb', 'noun'],
    pronounciation: 'ɡəʊ',
    shortExplanation: 'The word "go" is a verb that generally means to move or travel from one place to another. It can also refer to taking an action, proceeding with something, or functioning in a certain way.',
    shortDefinition: 'move from one place to another',
})

const OPTIONAL_VALUES = JSON.stringify({
    mistyped: true,
    slang: true,
    vulgar: true,
    isHomonym: true,
    homophones: [],
    homographs: [],
    informal: true,
    dialect: '',
    rude: true,
    gender: 'feminine | masculine | neutral',
    irregular: true,
    isFromAnotherLanguage: true,
})

const MAIN_PROMPT = {
    'en': `Give root word and lemma of the given word also 'shortExplanation' and 'shortDefinition' which are always in english.
    I provided other needed options in OPTIONAL_VALUES and their key naming describes what they are well. If it is a phrase don't give lemma, rootWord, functions. Give usedWords and explain as needed for the phrase but still with json.`,
    '': ``,
    '': ``,
}
// const MOCK_WORD_INFOS = [{ lemma: 'hello', the_word: 'go' }, { lemma: 'go', the_word: 'going' }]
// promptImages([{ lemma: 'hello' }, { lemma: 'turmoil' }, { lemma: 'construction' }, { lemma: 'apathy'}], console.log)
// processTranslations()
// promptAI(getWordInfoPromptByLanguage('broken', 'en'))
// promptWordInfos(['hello', 'broken'], 'en')
// promptWordInfoAndUpdateDB('hello', 'en')
async function promptWordInfoAndUpdateDB(the_word, mediaLang) {
    const WordInfosModel = mongoose.model(`wordInfos${!!mediaLang && `__${mediaLang.toLowerCase()}__s`}`, wordInfosSchema)

    try {
        const existingWordInfo = await WordInfosModel.findOne({ the_word })

        if (existingWordInfo && !existingWordInfo.shortDefinition) {

            const promptRes = (await promptWordInfos([the_word], mediaLang))[0]

            Object.keys(promptRes).forEach((key) => {
                existingWordInfo[key] = promptRes[key]
            })

            await existingWordInfo.save()
        }
    } catch (err) {
        console.log('PROMPT ERROR: ' + the_word, err)
    }
}

async function promptWordInfos(words, langCode) {
    // const WordInfosModel = mongoose.model(`wordInfos${!!langCode && `_${langCode}`}`, wordInfos.schema)

    const PROCESS_ITEMS_PER_INTERVAL = 20;
    // const file = fs.readFileSync(`./wordsResearchData/${langCode}_full.txt`, 'utf8')
    // const words = file.split('\n').map((item) => item.split(' '))
    const processedWords = []
    let index = -1;
    let wordsToRequest = []

    for (const wordInfo of words) {
        index += 1;
        const isFinish = index + 1 === words.length
        // if (index > processedWords.length) {
        wordsToRequest.push(wordInfo)
        // }

        if (isFinish || wordsToRequest.length === PROCESS_ITEMS_PER_INTERVAL) {
            const new_processedWords = await Promise.all(wordsToRequest.map(async (wrdInfo) => {
                // if (occurance < 100) return { word, occurance }
                let wordPromptInfo = wrdInfo;
                console.log('wrdInfo', wrdInfo)
                try {
                    // if (!lemma) {
                    let responseMessage = await promptAI(getWordInfoPromptByLanguage(wrdInfo, langCode))
                    try {
                        console.log('response 1', responseMessage)
                        if (responseMessage?.includes("REAL_RESPONSE: ")) {
                            console.log('response 2')
                            const parsableResponse = responseMessage?.split('REAL_RESPONSE: ')[1]
                            console.log('parsableResponse', parsableResponse)

                            wordPromptInfo = JSON.parse(parsableResponse)
                            console.log('responseMessage', responseMessage)
                        } else {
                            console.log('response 3')
                            responseMessage = JSON.parse(responseMessage?.content)
                        }
                    } catch (err) {
                        throw new Error('InvalidResponse: ' + JSON.stringify(responseMessage))
                    }
                    // wordPromptInfo = await promptAI(getWordInfoPromptByLanguage(the_word, langCode))
                    // }
                } catch (err) {
                    console.log('error for word: ', wrdInfo)
                    const errorName = handleOpenAIError(err);
                    if (errorName.includes('Network')) {

                    } else if (errorName.includes('UsageLimit')) {

                    } else if (errorName.includes('RateLimit')) {

                    } else if (errorName.includes('InvalidResponse')) {

                    } else {

                    }
                    return wrdInfo
                }
                return { ...wordPromptInfo }
            }))
            processedWords.push(...new_processedWords)
            // const processPath = `./process/newLanguageWords_${langCode}.json`
            // fs.writeFileSync(processPath, JSON.stringify(processedWords, undefined, 2))
            wordsToRequest = []
        }

        if (isFinish) {
            return processedWords
        }
    }
}

async function processTranslations(langCode, mainLang, wordInfos, callback) {
    const newTranslationsMap = {}
    const wordsToReqeust = []
    for (const wordInfo of wordInfos) {
        wordsToReqeust.push(wordInfo)

        if (wordsToReqeust.length === 20 || wordsToReqeust.length === wordInfos.length) {
            const newTranslations = await Promise.all(wordsToReqeust.map(
                async (wordToRequest) => {
                    const newTranslatedValues = await requestWordTranslation(wordToRequest)
                    newTranslationsMap[wordToRequest.the_word] = newTranslatedValues

                    return [wordToRequest.the_word, newTranslatedValues]
                }
            ))
            callback(newTranslations)
            wordsToReqeust = []
        }
    }

    return newTranslationsMap

    async function requestWordTranslation(wordInfo) {
        const [shortDefinition_translations, shortExplanation_translations] = Promise.all([
            await openAITranslate(wordInfo.shortDefinition, mainLang, langCode),
            await openAITranslate(wordInfo.shortDescription, mainLang, langCode)
        ])

        return { shortDefinition_translations, shortExplanation_translations }
    }
}

async function promptImages(wordInfos, callback) {
    const newImagesMap = {}
    let wordsToRequest = []
    console.log('wordInfos', wordInfos)
    for (let wordInfo of wordInfos) {
        wordsToRequest.push(wordInfo)

        if (wordsToRequest.length === 5 || wordInfo === wordInfos[wordInfos.length - 1]) {
            const newIcons = await Promise.all(wordsToRequest.map(
                async (wordToReqeust) => {
                    word = promptAI()
                    const wordPrompt = `Generate "${wordToReqeust.lemma}" emoji`
                    console.log('wordPrompt', wordPrompt)
                    const newIcon = await generateImage(wordPrompt)
                    newImagesMap[wordToReqeust.lemma] = newIcon
                    return [wordToReqeust.lemma, newIcon]
                }
            ))
            callback(newIcons)
            wordsToRequest = []
            await (new Promise((res) => setTimeout(res, MINUTE)))
        }
    }

    return newImagesMap
}

function getWordInfoPromptByLanguage(the_word, langCode) {
    const input = { the_word, langCode }
    const prompt = MAIN_PROMPT[langCode] || MAIN_PROMPT.en

    const finalPrompt = `${prompt}
OPTIONAL_RESPONSE_VALUES: ${OPTIONAL_VALUES}
e.g.
input ${SAMPLE_INPUT_STRINGIFIED}
should respond with ${SAMPLE_RESPONSE_STRINGIFIED}

INPUT: ${JSON.stringify(input)}
`
    console.log('PROMPT for ' + the_word, finalPrompt)
    return finalPrompt
}

async function openAITranslate(text, mainLang, textLang) {
    const translationResponse = await promptAI(`Translate following text to from ${textLang} to ${mainLang} and return { translation: String }. Text: ${text}`)
    return JSON.parse(translationResponse).translation
}

/**
 * 
 * @param {*} error 
 * @returns Network | UsageLimit | RateLimit
 */
const handleOpenAIError = (error) => {
    console.log('Error details:');
    console.log('Message:', error.message);
    console.log('Status:', error.status);
    console.log('Status Code:', error.statusCode);
    console.log('Error Code:', error.code);

    const isNetworkOrConnectionError = (error) => {
        return error.message.includes('APIConnectionError: Connection error.') ||
            error.message.toLowerCase().includes('network') ||
            error.code === 'ECONNREFUSED';
    };

    const isUsageLimitError = (error) => {
        return error.message.includes('You exceeded your current quota') ||
            error.code === 'insufficient_quota';
    };

    const isRateLimitError = (error) => {
        return error.message.includes('Rate limit reached') ||
            error.code === 'rate_limit_exceeded' ||
            error.statusCode === 429;
    };

    if (isNetworkOrConnectionError(error)) {
        console.log('Network or connection error occurred. Please check your internet connection and try again.');
        return 'Network'
    } else if (isUsageLimitError(error)) {
        console.log('Usage limit exceeded. Please check your OpenAI account quota.');
        return 'UsageLimit'
    } else if (isRateLimitError(error)) {
        console.log('Rate limit exceeded. Please slow down your requests.');
        return 'RateLimit'
    } else if (error.message) {
        return error.message
    }
};

module.exports = {
    promptWordInfos,
    promptWordInfoAndUpdateDB,
    promptImages,
    processTranslations
}