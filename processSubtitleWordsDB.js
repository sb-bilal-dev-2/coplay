const en50kMapped = require('./en50kLemmaInfoMapped.json')
const fs = require('fs');
const { initCRUDAndDatabase } = require('./serverCRUD');
initCRUDAndDatabase()

const WordsModel = require('./schemas/wordInfos').model;
const OccurancesModel = require('./schemas/occurances').model;
const Subtitles = require('./schemas/subtitles').model;
// insertWords()
calculateUsedWordsAndUpdateWordsAccordingly(
    JSON.parse(fs.readFileSync(`./files/movieFiles/${'kung_fu_panda_3'}.subtitles.usedWords.json`, 'utf-8')),
    {
        genras: ['cartoon', 'animals', 'action', 'comedy'],
        hashtags: ['kung_fu_panda', 'martial_arts'],
        series: '3rd',
        mediaTitle: 'kung_fu_panda_3',
        mediaTitleBase: 'kung_fu_panda',
        mediaType: 'movie'
    }
)

// getAllLemmas()
// also insert items en_full which are not in the database 
async function insertWords() {
    const lemmas = Object.keys(en50kMapped).map(key => {
        const lemma = en50kMapped[key];

        return {
            ...lemma,
            inflections: lemma?.inflections?.map(inf => inf.text),
            inflectionInfos: lemma?.inflections
        }
    })
    // console.log('lemmas: ', lemmas)
    try {
        await WordsModel.insertMany(lemmas)
        console.log('done inserting words')
        // calculateUsedWordsAndUpdateWordsAccordingly(JSON.parse(fs.readFileSync(`./files/movieFiles/${'kung_fu_panda_3'}.subtitles.usedWords.json`, 'utf-8')))
        // await WordsModel.bulkWrite(words.map(ll => ({ ...ll, occurances: [] })).map(ll => ({
        //     updateOne: {
        //         filter: {
        //             lemma: ll.lemma
        //         },
        //         update: ll
        //     },
        // })))
    } catch (err) {
        console.log('err: ', err)
    }
}
// insertAllSubtitles()
function insertAllSubtitles() {
    const movieFiles = fs.readdirSync('./files/movieFiles').filter(item => item.includes('.subtitles.json'))
    console.log('movieFiles: ', movieFiles)
    movieFiles.forEach(item => {
        console.log('subtitles for: ', item)
        const subtitles = fs.readFileSync('./files/movieFiles/' + item, 'utf-8');
        // console.log('subtitles for: ', item)
        const [name, lang] = item.split('.subtitles.json')[0].split('.')
        console.log('subtitles', subtitles)
        console.log('name and lang', name, lang)
        const subtitleObject = {
            title: name,
            mediaLang: 'en',
            lang: lang,
            subtitles
        }

        // console.log('Subtitles Model', Subtitles)
        // console.log('Words Model', WordsModel)

        // SubtitlesModel.insert(subtitleObject)
    })
}
async function calculateUsedWordsAndUpdateWordsAccordingly(subtitleLinesWithUsedWords, mediaInfo) {
    const lemmasByInflection = await getAllLemmasMappedByInflection()
    const genres = mediaInfo?.genres
    const hashtags = mediaInfo?.hashtags
    const usedWords = getUsedWordsBySubtitleLines(subtitleLinesWithUsedWords)
    const occurances = usedWords.map(({ word: inflection, startTime, endTime, context, contextSubtitles }, index) => {
        const lemma = lemmasByInflection[inflection] || inflection
        const lemmaOccuranceCount = contextSubtitles[1]?.usedLemmas?.filter(usedLemma => usedLemma === lemma).length
        const lemmaOccuranceCountOnContext = contextSubtitles[1]?.usedLemmas?.concat(contextSubtitles[0]?.usedLemmas).concat(contextSubtitles[2]?.usedLemmas).filter(usedLemma => usedLemma === lemma).length

        const occurance = {
            context,
            contextSubtitles,
            lemmaOccuranceCount,
            lemmaOccuranceCountOnContext,
            mediaTitle: mediaInfo.mediaTitle,
            mediaType: mediaInfo.mediaType,
            mediaTitleBase: mediaInfo.mediaTitleBase,
            startTime,
            endTime,
            genres,
            hashtags,
            series: mediaInfo.series,
            inflection,
            lemma
        }

        console.log('occurance: ', inflection, occurance)
        return occurance;
        // return 
    })

    try {
        // await OccurancesModel.insertMany(occurances);
        // const bulkWrite = occurances.map((occ) => ({
        //     updateOne: {
        //         filter: {
        //             mediatTitle: occ.mediaTitle,
        //             mediatType: occ.mediaType,
        //             startTime: occ.startTime,
        //             inflection: occ.inflection,
        //         },
        //         update: occ,
        //         options: { upsert: true }
        //     }
        // }))
        // await OccurancesModel.bulkWrite(bulkWrite);
        console.log('bulk update successful')
    } catch (err) {
        console.log('errored at bulk: ', err)
    }
}

function getUsedWordsBySubtitleLines(subtitleLines) {
    const usedWords = []

    subtitleLines.forEach((sLine, index) => {
        const initialContextSubtitles = [subtitleLines[index - 1], sLine, subtitleLines[index + 1]]
        const contextSubtitles = getContextSubtitles(initialContextSubtitles)
        // console.log('sLine', sLine)
        // console.log('context', context)
        sLine.usedWords.forEach(usedWord => {
            usedWords.push({
                context: contextSubtitles.map(ctx => ctx?.text),
                contextSubtitles,
                startTime: sLine.startTime,
                endTime: sLine.endTime,
                word: usedWord,
            })
        })
    })

    return usedWords;
}

function getContextSubtitles(previousCurrentNextSubtitleLines) {
    let previous = previousCurrentNextSubtitleLines[0];
    let current = previousCurrentNextSubtitleLines[1];
    let next = previousCurrentNextSubtitleLines[2];

    if (current?.startTime - previous?.endTime > 3000) {
        previous = undefined;
    }

    if (next?.startTime - current?.endTime > 3000) {
        previous = undefined;
    }

    return [previous, current, next]
}

async function getAllLemmas() {
    const lemmas = await WordsModel.find();
    console.log('lemmas', lemmas)

    return lemmas
}

async function getAllLemmasMappedByInflection() {
    const lemma = await WordsModel.find();
    console.log('lemma', lemma)
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
