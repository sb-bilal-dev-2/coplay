const path = require('path')
const fs = require('fs')
const fromVtt = require('subtitles-parser-vtt').fromVtt
const englishWords50k = require('./en50kAndLemmasReviewed.json')
const englishWordsFull = require('./files/en_full.json')
const en_5kLemmas = require('./en_5kLemmas.json')
const movieName = process.argv.slice(2)[0] || '';
const subtitlePath = path.join(__dirname, 'files', 'movieFiles', `${movieName}.${'en'}.vtt`);
const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
const subtitles = fromVtt(subtitlesVtt, 'ms');
console.log(subtitles.length);
const ultimateLemmaInfoMap = require('./en50kLemmaInfoMapped.json')

const usedWords = []

const words = subtitles.map(sbt => sbt.text)
  .join('\n')
  .toLowerCase()
  .replaceAll('\n', ' ')
  .replaceAll('[', ' ')
  .replaceAll(']', ' ')
  .replaceAll('{', ' ')
  .replaceAll('}', ' ')
  .replaceAll('...', ' ')
  .replaceAll('..', ' ')
  .replaceAll('.', ' ')
  .replaceAll('---', ' ')
  .replaceAll('--', ' ')
  .replaceAll('(', ' ')
  .replaceAll(')', ' ')
  .replaceAll('"', ' ')
  .replaceAll('<', ' ')
  .replaceAll('>', ' ')
  .replaceAll('!', ' ')
  .replaceAll('?', ' ')
  .replaceAll('#', ' ')
  .replaceAll('&', ' ')
  .split(' ')
  .filter(wrd => wrd)
  .map(wrd => wrd[0] === "-" ? wrd.slice(1) : wrd)
  .map(wrd => wrd[wrd.length - 1] === "-" ? wrd.slice(0, wrd.length -1) : wrd)
usedWords.push(...words.map(wrd => wrd.trimEnd().trimStart()))
const en50kMap = mapItems(englishWords50k, 'the_word')
const englishWordsMap = mapItems(englishWordsFull, 'the_word')
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

function mapItems(array, key) {
    const mappedOccurance = {}
    array.forEach((item) => {
        mappedOccurance[item[key]] = item.lemma || item[key];
    })
    return mappedOccurance
}

let usedLemmas50kInfosList = Object.keys(usedLemmas50k).map(lemma => ultimateLemmaInfoMap[lemma])


fs.writeFileSync(`./files/movieFiles/${movieName}.usedWords50k.json`, JSON.stringify(usedWords50k))
fs.writeFileSync(`./files/movieFiles/${movieName}.usedWordsPost50k.json`, JSON.stringify(usedWordsPost50k))
fs.writeFileSync(`./files/movieFiles/${movieName}.usedLemmas50k.json`, JSON.stringify(usedLemmas50k))
fs.writeFileSync(`./files/movieFiles/${movieName}.usedLemmas50kInfosList.json`, JSON.stringify(usedLemmas50kInfosList))





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
