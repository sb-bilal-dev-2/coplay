const fs = require('fs')

// const wordsJson = require('./word_data.json');
const fileName = 'en_full'
const wordsText = fs.readFileSync(`./files/${fileName}.txt`, 'utf-8');

(function initGetWordCollection(db) {
    const wordLines = wordsText.split('\n')
    const wordAndOccuranceCount = wordLines.map((wLine) => {
        const wLineAsArray = wLine.split(' ');
        return {
            the_word: wLineAsArray[0],
            occuranceCount: wLineAsArray[1],
        }
    })
    console.log('wordAndOccuranceCount', wordAndOccuranceCount)
    fs.writeFileSync(`./${fileName}.json`, JSON.stringify(wordAndOccuranceCount, undefined, 2))
})()