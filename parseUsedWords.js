const path = require('path')
const fs = require('fs')
const fromVtt = require('subtitles-parser-vtt').fromVtt
const englishWords50k = require('./wordsResearchData/en50kAndLemmasReviewed.json')
const en_5kLemmas = require('./wordsResearchData/en_5kLemmas.json')
const splitUsedWords = require('./splitUsedWords');
const ultimateLemmaInfoMap = require('./wordsResearchData/en50kLemmaInfoMapped.json')
const { initCRUDAndDatabase } = require('./serverCRUD');
const { processSubtitleOccurancesDB } = require('./processSubtitleWordsDB')
const { subtitles_model } = require('./schemas/subtitles')
const { movies_model } = require('./schemas/movies')
const { mapForTags } = require('./src/mapForTags')
const { get_languageWords } = require('./newLanguages')
const WordInfosModel = require('./schemas/wordInfos').wordInfos_model;

initCRUDAndDatabase() // Need DB access to fetch word inflictions (variations) 

async function parseUsedWords(mediaInfo) {
    const mediaLang = mediaInfo.mediaLang;
    const englishWordsFull = await get_languageWords(mediaLang)
    let mediaTitle = mediaInfo.title;
    const subtitlePath = path.join(__dirname, 'files', 'movieFiles', `${mediaTitle}.${mediaLang}.vtt`);
    if (!fs.existsSync(subtitlePath)) {
        console.error('SUBTITLE_PARSER: no vtt for - ' + subtitlePath);
        return;
    }
    const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
    const subtitles = fromVtt(subtitlesVtt, 'ms');

    if (!subtitles) return;
    const usedWords = []
    const englishWordsMap = mapItems(englishWordsFull, 'the_word')

    let subtitlesWithUsedWords = subtitles.map((sbt) => {
        const tagsMap = mapForTags(sbt)
        const taglessText = tagsMap.taglessText || tagsMap.text
        const usedWordsPerLine = splitUsedWords(taglessText);

        return {
            ...sbt,
            taglessText,
            usedWords: usedWordsPerLine
        }
    })

    // console.log('subtitles', subtitlesWithUsedWords)

    subtitlesWithUsedWords = await (async function getUsedLemmasByUsedWords(list) {
        lemmasByInflection = await getAllLemmasMappedByInflection()
        // console.log('lemmasByInflection', lemmasByInflection)
        const subtitlesWithUsedLemmas = list.map((subtitleLine) => {

            return {
                ...subtitleLine,
                usedLemmas: subtitleLine.usedWords.map(inflection => lemmasByInflection[inflection])
            }
        })
        // console.log('subtitlesWithUsedLemmas', subtitlesWithUsedLemmas);
        try {
            await processSubtitleOccurancesDB(
                subtitlesWithUsedLemmas,
                mediaInfo
            )
            // fs.writeFileSync(`${contentFolder}/${mediaTitle}.subtitles.usedWords.json`, JSON.stringify(subtitlesWithUsedLemmas))            
        } catch (err) {
            console.log('OCCURANCE: unhandled error ', err)
        }

        return subtitlesWithUsedLemmas
        async function getAllLemmasMappedByInflection() {
            const lemma = await WordInfosModel.find();
            const mappedByInflection = {}

            lemma.forEach((lemma) => {
                if (!mappedByInflection[lemma.lemma]) {
                    mappedByInflection[lemma.lemma] = lemma.lemma
                }
                if (!lemma.inflections) {
                    mappedByInflection[lemma.lemma] = lemma.lemma
                } else {
                    lemma.inflections.forEach((infl) => {
                        mappedByInflection[infl] = lemma.lemma
                    })
                }
            })

            return mappedByInflection
        }
    })(subtitlesWithUsedWords)

    const words = splitUsedWords(subtitles.map(sbt => sbt.text).join('\n'))

    usedWords.push(...words)
    const en50kMap = mapItems(englishWords50k, 'the_word')
    const usedWords50k = {}
    const usedWordsPost50k = {}
    const lemmaOccuranceCount = {}
    const en_5kMappedByWords = {}

    en_5kLemmas.forEach(item => {
        item.inflections.forEach(({ text }) => {
            en_5kMappedByWords[text] = item.lemma;
        })
    })

    usedWords.forEach(wrd => {
        if (en50kMap[wrd]) {
            if (usedWords50k[wrd]) {
                usedWords50k[wrd] += 1
            } else {
                usedWords50k[wrd] = 1
            }
            let lemma = en_5kMappedByWords[wrd]

            if (!lemma) {
                lemma = en50kMap[wrd]
            }

            if (lemmaOccuranceCount[lemma]) {
                lemmaOccuranceCount[lemma] += 1
            } else {
                lemmaOccuranceCount[lemma] = 1
            }
        } else if (!en50kMap[wrd] && englishWordsMap[wrd]) {
            if (usedWordsPost50k[wrd]) {
                usedWordsPost50k[wrd] += 1
            } else {
                usedWordsPost50k[wrd] = 1
            }
        }
    })

    let usedLemmas50kInfosList = Object.keys(lemmaOccuranceCount).map(lemma => ultimateLemmaInfoMap[lemma])

    // fs.writeFileSync(`${contentFolder}/${mediaTitle}.usedWords50k.json`, JSON.stringify(usedWords50k))
    // fs.writeFileSync(`${contentFolder}/${mediaTitle}.usedWordsPost50k.json`, JSON.stringify(usedWordsPost50k))
    // fs.writeFileSync(`${contentFolder}/${mediaTitle}.lemmaOccuranceCount.json`, JSON.stringify(lemmaOccuranceCount))
    // fs.writeFileSync(`${contentFolder}/${mediaTitle}.usedLemmas50kInfosList.json`, JSON.stringify(usedLemmas50kInfosList))
    const newParsedSubtitle = {
        mediaLang,
        title: mediaLang,
        mediaId: mediaInfo._id,
        mediaTitle,
        usedLemmas: usedLemmas50kInfosList,
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

// function getUltimateLemmaInfoMap() {
//     const mapped = {}
//     // lemma
//     // inflictions: []
//     // part_of_speech: 'verb' | 'function word' | 'interjection' | 'adverb' | 'number' | 'noun' | 'adgective'
//     // within5k: true,
//     // within5kIndex:
//     // occuranceCount:

//     en_5kLemmas.forEach((lemma, index) => {
//         mapped[lemma.lemma.toLowerCase()] = {
//             within5k: true,
//             lemmaIndex: index,
//             ...lemma,
//         }
//     })
//     let lemmaLength = Object.keys(mapped).length;
//     englishWords50k.forEach((wrd, index) => {
//         const lemma = wrd.lemma || wrd.the_word

//         const mappedLemmaInfo = mapped[lemma]

//         if (!mappedLemmaInfo) {
//             mapped[lemma] = {
//                 lemma,
//                 within50k: true,
//                 lemmaIndex: ++lemmaLength,
//                 occuranceCount: wrd.occuranceCount,
//                 inflictions: [{ text: wrd.the_word }]
//             }
//         } else if (mappedLemmaInfo && !mappedLemmaInfo.within5k) {
//             mappedLemmaInfo.inflictions.push({ text: wrd.the_word })
//         }
//     })
//     fs.writeFileSync(`./en50kLemmaInfoMapped.json`, JSON.stringify(mapped))

//     return mapped
// }

function mapItems(array, key) {
    const mappedOccurance = {}
    array.forEach((item) => {
        mappedOccurance[item[key]] = item.lemma || item[key];
    })
    return mappedOccurance
}

module.exports = { mapItems, parseUsedWords }
