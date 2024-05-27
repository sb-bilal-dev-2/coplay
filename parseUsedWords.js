const path = require('path')
const fs = require('fs')
const fromVtt = require('subtitles-parser-vtt').fromVtt
const englishWords50k = require('./wordsResearchData/en50kAndLemmasReviewed.json')
const englishWordsFull = require('./files/en_full.json')
const en_5kLemmas = require('./wordsResearchData/en_5kLemmas.json')
const splitUsedWords = require('./splitUsedWords');
const ultimateLemmaInfoMap = require('./wordsResearchData/en50kLemmaInfoMapped.json')
const { initCRUDAndDatabase } = require('./serverCRUD');
const { calculateUsedWordsAndUpdateWordsAccordingly } = require('./processSubtitleWordsDB')
const WordsModel = require('./schemas/wordInfos').words_model;
// parseUsedWords()
initCRUDAndDatabase() // Need DB access to fetch word inflictions (variations) 

function parseUsedWords(contentFolder = './files/movieFiles', mediaInfo) {
    let movieTitle = process.argv.slice(2)[0] || mediaInfo.movieTitle;
    const mediaLang = mediaInfo.mediaLang
    const subtitlePath = path.join(__dirname, 'files', 'movieFiles', `${movieTitle}.${mediaLang}.vtt`);
    const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
    const subtitles = fromVtt(subtitlesVtt, 'ms');
    console.log(subtitles.length);


    const usedWords = []
    const englishWordsMap = mapItems(englishWordsFull, 'the_word')

    let subtitlesWithUsedWords = subtitles.map((sbt) => {
        const usedWordsPerLine = splitUsedWords(sbt.text);

        return {
            ...sbt,
            usedWords: usedWordsPerLine
        }
    })

    console.log('subtitles', subtitlesWithUsedWords)

    subtitlesWithUsedWords = (async function getUsedLemmasByUsedWords(list) {
        lemmasByInflection = await getAllLemmasMappedByInflection()
        console.log('lemmasByInflection', lemmasByInflection)
        const listWithUsedLemmas = list.map((subtitleLine) => {
            return {
                ...subtitleLine,
                usedLemmas: subtitleLine.usedWords.map(inflection => lemmasByInflection[inflection])
            }
        })
        console.log('listWithUsedLemmas', listWithUsedLemmas);
        await calculateUsedWordsAndUpdateWordsAccordingly(
            listWithUsedLemmas,
            mediaInfo
        )
        fs.writeFileSync(`${contentFolder}/${movieTitle}.subtitles.usedWords.json`, JSON.stringify(listWithUsedLemmas))

        return listWithUsedLemmas
        async function getAllLemmasMappedByInflection() {
            const lemma = await WordsModel.find();
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
    const usedLemmas50k = {}
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

            if (usedLemmas50k[lemma]) {
                usedLemmas50k[lemma] += 1
            } else {
                usedLemmas50k[lemma] = 1
            }
        } else if (!en50kMap[wrd] && englishWordsMap[wrd]) {
            if (usedWordsPost50k[wrd]) {
                usedWordsPost50k[wrd] += 1
            } else {
                usedWordsPost50k[wrd] = 1
            }
        }
    })

    let usedLemmas50kInfosList = Object.keys(usedLemmas50k).map(lemma => ultimateLemmaInfoMap[lemma])


    // fs.writeFileSync(`${contentFolder}/${movieTitle}.usedWords50k.json`, JSON.stringify(usedWords50k))
    // fs.writeFileSync(`${contentFolder}/${movieTitle}.usedWordsPost50k.json`, JSON.stringify(usedWordsPost50k))
    fs.writeFileSync(`${contentFolder}/${movieTitle}.usedLemmas50k.json`, JSON.stringify(usedLemmas50k))
    fs.writeFileSync(`${contentFolder}/${movieTitle}.usedLemmas50kInfosList.json`, JSON.stringify(usedLemmas50kInfosList))
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
