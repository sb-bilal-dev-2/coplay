const path = require('path')
const fs = require('fs')
const fromVtt = require('subtitles-parser-vtt').fromVtt
const splitUsedWords = require('./splitUsedWords');
// const englishWords50k = require('./wordsResearchData/en50kAndLemmasReviewed.json')
// const en_5kLemmas = require('./wordsResearchData/en_5kLemmas.json')
// const ultimateLemmaInfoMap = require('./wordsResearchData/en50kLemmaInfoMapped.json')
const { initCRUDAndDatabase } = require('./serverCRUD');
const { subtitles_model } = require('./schemas/subtitles')
const { movies_model } = require('./schemas/movies')
const { get_languageWords } = require('./newLanguages')
// const WordInfosModel = require('./schemas/wordInfos').wordInfos_model;

initCRUDAndDatabase() // Need DB access to fetch word inflictions (variations) 

async function parseUsedWords(mediaInfo) {
    const mediaLang = mediaInfo.mediaLang;
    console.log('Media Lang: ' + mediaLang)
    const allLanguageWords = await get_languageWords(mediaLang)
    let mediaTitle = mediaInfo.title;
    const subtitlePath = path.resolve(path.join(__dirname, 'files', 'movieFiles', `${mediaTitle}.${mediaLang}.vtt`));
    if (!fs.existsSync(subtitlePath)) {
        console.error('SUBTITLE_PARSER: no vtt for - ' + subtitlePath);
        return;
    }
    const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
    const subtitles = fromVtt(subtitlesVtt, 'ms');

    if (!subtitles) return;
    const usedWords = []
    const allLanguageWordsMap = allLanguageWords.reduce((acc, item) => (acc[item.the_word] = item, acc), {})
    const ignoredWords = []
    const lowOccuranceWords = []

    let subtitlesWithUsedWords = subtitles.map((sbt) => {
        const degaussedText = degausser(sbt.text)
        const usedWordsPerLine = splitUsedWords(degaussedText);

        usedWordsPerLine.forEach((word) => {
            const wordInfo = allLanguageWordsMap[word]
             if (wordInfo) {
                const lowOccurance = wordInfo.occurance < 10
                if (lowOccurance) {
                    lowOccuranceWords.push(word)
                }
            } else {
                ignoredWords.push(word)
            }
        })

        return {
            ...sbt,
            text: degaussedText,
            usedWords: usedWordsPerLine
        }
    })

    // console.log('subtitles', subtitlesWithUsedWords)

    const words = splitUsedWords(degausser(subtitles.map(sbt => sbt.text).join('\n')))

    usedWords.push(...words)

    const newParsedSubtitle = {
        mediaLang,
        title: mediaLang,
        mediaId: mediaInfo._id,
        mediaTitle,
        subtitles: subtitlesWithUsedWords
    }
    if (mediaInfo.youtubeUrl) {
        newParsedSubtitle.youtubeUrl = mediaInfo.youtubeUrl
    }
    console.log('newParsedSubtitle', newParsedSubtitle)
    let parsedSubtitle;
    try {
        parsedSubtitle = (await subtitles_model.create(newParsedSubtitle))
    } catch(err) {
        console.error('PARSER ERROR at' + mediaLang, err)
    }
    console.log('parsedSubtitle id', parsedSubtitle?._id)
    await movies_model.findByIdAndUpdate(mediaInfo._id, { parsedSubtitleId: parsedSubtitle._id })

    return parsedSubtitle?._id
}

// async function promptMissingLemmas() {
//     let usedLemmas50kInfosList = Object.keys(lemmaOccuranceCount).map(lemma => ultimateLemmaInfoMap[lemma])


// }

function degausser(input) {
    // Use a regular expression to replace HTML tags with an empty string
    return input.replace(/<[^>]*>/g, '');
}

module.exports = { parseUsedWords, degausser }
