const fs = require('fs')

const { callPredict } = require('./callPredict');

// callPredict(
// `give lemma of the given word.

// e.g. "do" gets response "do" 
// e.g. "texted" gets response "text"
// e.g. "having" gets response "have"
// e.g "nicer" gets response "nice"

// given word: me`);
let en50k = JSON.parse(fs.readFileSync('./en50kAndLemmasReviewed.json', 'utf8'));
// const storedFile = fs.readFileSync('./initGetWordIndex.txt', 'utf-8');
// const savedStartIndex = +String(storedFile).split('__')

(async function initGetWordCollection(startIndex = 0) {
    let abort = false;
    let nextIndex = startIndex;
    let itemCounted = 0;
    // const mapped = await Promise.all(en50k.map(async (item, ii) => {
    //     if (!item.lemma && !item.isBlocked && startIndex < ii && itemCounted < 60) {
    //         itemCounted++;
    //         nextIndex = ii + 1
    //         try {
    //             console.log('Predicting for - ' + item.the_word);
    //             let prediction = await callPredict(
    //                 `give lemma of the given word. Do not give empty response.
                    
    //                 e.g. "do" gets response "do" 
    //                 e.g. "texted" gets response "text"
    //                 e.g. "having" gets response "have"
    //                 e.g "nicer" gets response "nice"
                    
    //                 given word: ${item.the_word}`);
    //             const lemma = prediction.extractedResponse
    //             const isBlocked = prediction.isBlocked;

    //                         if (lemma[0] === `"`) {
    //                             lemma = lemma.replaceAll(`"`, '')
    //                         }
    //                         const newItem = {
    //                             ...item,
    //                             lemma,
    //                         }
    //                         if (isBlocked) {
    //                             newItem.isBlocked = isBlocked
    //                         }
    //                         return newItem
    //         } catch (err) {
    //             if (err.includes('UNAVAILABLE: No connection established')) {
    //                 abort = true
    //             }
    //             console.log(`error for ${item.the_word}: `, err)
    //             return item
    //         }
    //     }
    //     return item
    // }))

    const mapped = en50k.map((wordInfo) => {
        if (wordInfo.the_word.includes('-') || wordInfo.the_word.includes(' ')) {
            return {
                ...wordInfo,
                lemma: "",
            }
        }
        if (wordInfo.lemma && (wordInfo.lemma.includes('-') || wordInfo.lemma.includes(' '))) {
            return {
                ...wordInfo,
                lemma: "",
            }
        }
        return wordInfo
    })
    if (abort) {
        return;
    }
    fs.writeFileSync('./en50kAndLemmasReviewed.json', JSON.stringify(mapped, undefined, 2))
    en50k = mapped;
    // fs.writeFileSync('./initGetWordIndex.txt', "" + nextIndex + "__" + en50k[nextIndex]?.the_word,)

    // return setTimeout(() => initGetWordCollection(nextIndex), 60500)
})()
