const fs = require('fs');
const path = require('path');
const { fromVtt } = require('subtitles-parser-vtt');
const OpenAI = require('openai');
const { initCRUDAndDatabase } = require('./serverCRUD');
const openai = new OpenAI({ key: process.env.OPENAI_API_KEY });

require('dotenv').config();
initCRUDAndDatabase();

// const subtitlesModel = require('./schemas/subtitles').subtitles_model;
// const wordListModel = require('./schemas/wordLists').wordLists_model;
// const phraseListModel = require('./schemas/phraseLists').phraseLists_model;
// const moviesModel = require('./schemas/movies').movies_model;

const promptres = JSON.parse(fs.readFileSync('./openaisubtitlepromptprocess.json', 'utf-8'))
console.log(promptres.processedTranslations.length);
console.log(promptres.usedWords.length);
console.log(promptres.usedPhrases.length);
const subtitlesVttPath = path.join(__dirname, 'files', 'movieFiles', `${'moana'}.${'en'}.vtt`);
const subtitlesVtt = fs.readFileSync(subtitlesVttPath, 'utf-8');
const subtitles = fromVtt(subtitlesVtt, 'ms');
console.log(subtitles.length);

// fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify(newpromptres))

const NEW_ITEM = {
  forTitle: 'moana',
  for: 'movie',
}
// createItems()
// async function createItems() {
//   try {
//     const asnwer1 =  await subtitlesModel.create(NEW_ITEM);
//     await wordListModel.create(NEW_ITEM);
//     await phraseListModel.create(NEW_ITEM);
//     console.log('logged new items', asnwer1)
  
//   } catch (err) {
//     console.log('err', err);
//   }
// }

const SYSTEM_PROMPT = `Subtitle lines translations, Used words & phrases, 1 or 2 word/phrase highlights`
const INITIAL_USER_PROMPT = `
PROMPT TRANSLATION: Subtitle lines translations + Matched words phrases + highlights

I will provide you array of subtitle lines. I want you to translate those lines for the given language.
I want you to respond with JSON format. I'll provide you with examples.

Also I want you to include used words/phrases within the given subtitle in your answer.
Also, for every subtitle line, I want you to give highlighted translation part.

IMPORTANT NOTE!: DO NOT INCLUDE NAMES and NON-${'ENGLISH'} words/phrases in usedPhrases or usedWords, in phrases you can replace it with it/someone/something when it needed to be included.

Language: RU.
Movie Context: name Frozen, genre: musical, medieval, fairytale, fantasy.
Known characters: 

e.g.SAMPLE INPUT JSON

{
  "subtitleLines": [
    "Do you want to build a snowman?",
    "The cold never bothered me anyway.",
    "Let it go, let it go, can't hold it back anymore.",
    "Love is an open door.",
    "Conceal, don't feel, don't let them know."
  ],
  "language": "RU",
  "movieContext": "Frozen",
  "genre": ["musical", "medieval", "fairytale", "fantasy"],
  "knownCharacters": []
}
e.g. SAMPLE OUTPUT JSON

{
  "translations": [
    {
      "original": "Do you want to build a snowman?",
      "translation": "Хочешь построить снеговика?",
      “highlighted”: [“snowman”],
      "highlightedTranslation”: ["снеговика”],

    },
    {
      "original": "The cold never bothered me anyway.",
      "translation": "Холод меня никогда не беспокоил.",
      "highlighted": [“cold”, “bothered”],
      "highlightedTranslation”: ["Холод", "беспокоил”],
    },
    {
      "original": "Let it go, let it go, can't hold it back anymore.",
      "translation": "Отпусти, отпусти, больше не могу сдерживать.",
      "highlighted": [“Let “it go, “hold it back”],
      "highlighted": ["Отпусти", "сдерживать”],
    }
  ],
  “usedWords”, [“Do”, “you”, “want”, “to”, “build”, “a”, “snowman”, “The”, “cold”, “never”, “bothered”, “me”, “anyway”, “Let”, “it”, “go”, “can’t”, “hold”, “it”, “back”, “anymore”],
  “usedPhrases”: [“Let it go”, “hold it back”]
}
REAL INPUT JSON
`;
// prepareSubtitles();

async function prepareSubtitles(title = 'moana', locale = 'en', translateLang = 'ru') {
  console.log('STARTING...')
  try {
    const subtitlesVttPath = path.join(__dirname, 'files', 'movieFiles', `${title}.${locale || 'en'}.vtt`);
    const subtitlesVtt = fs.readFileSync(subtitlesVttPath, 'utf-8');
    const subtitles = fromVtt(subtitlesVtt, 'ms');

    const inputPrompt = {
      subtitleLines: [],
      language: translateLang,
      movieContext: title,
      genre: ['musical', 'medieval', 'fairytale', 'fantasy'],
      knownCharacters: [],
    };
    let processedTranslations = []
    const usedWords = []
    const usedPhrases = []
    let linesToProcess = []
    let count = 0
    console.log('subtitles.length', subtitles.length)
    let index = -1
    for (const item of subtitles) {
      index++;

      const text = item.text.replaceAll('\n', "<br>")
      linesToProcess.push(text)
      count++;
      if (count > 10 || index === subtitles.length - 1) {
        count = 0
        try {
          // if (index < 20) { // 8 is limit
            inputPrompt.subtitleLines = linesToProcess;
            console.log('Input Prompt:', JSON.stringify(inputPrompt, null, 2));
            const newProcessedSubtitles = await promptSubtitles(inputPrompt);
            linesToProcess = [text]

            console.log('promptJSONResponse', newProcessedSubtitles)
            console.log('type', typeof newProcessedSubtitles)

            if (processedTranslations.length) {
              newProcessedSubtitles.translations.shift() // remove first item, as it just served as a context for translation
            }
            processedTranslations.push(...newProcessedSubtitles.translations)
            usedWords.push(...newProcessedSubtitles.usedWords)
            usedPhrases.push(...newProcessedSubtitles.usedPhrases)
            // await subtitlesModel.findOneAndUpdate(NEW_ITEM, { subtitles: processedTranslations });
            // await wordListModel.findOneAndUpdate(NEW_ITEM, { list: usedWords });
            // await phraseListModel.findOneAndUpdate(NEW_ITEM, { list: usedPhrases });
          
            fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify({processedTranslations,usedWords,usedPhrases}))
            console.log('processedTranslations.length:', processedTranslations.length + ` of ${subtitles.length}`)
          // }
        } catch(err) {
          console.log('ERRORED AT PROMPT: ', err)
          console.log('processedTranslations.length:', processedTranslations.length)
        }
      }
    };

    // const usedWordsMap = {};
    // usedWords.forEach(wrd => {
    //   const wrdLc = wrd.toLowercase()
    //   if (!usedWordsMap[wrdLc]) {
    //     usedWordsMap[wrdLc] = 0;
    //   } else {
    //     usedWordsMap[wrdLc] += 1;
    //   }
    // })
    // const usedPhrasesMap = {};
    // usedPhrases.forEach(wrd => {
    //   const wrdLc = wrd.toLowercase()
    //   if (!usedPhrasesMap[wrdLc]) {
    //     usedPhrasesMap[wrdLc] = 0;
    //   } else {
    //     usedPhrasesMap[wrdLc] += 1;
    //   }
    // })

    processedTranslations = processedTranslations.map((trn, index) => {
      return {
        ...trn,
        startTime: subtitles[index].startTime,
        endTime: subtitles[index].endTime,
      }
    })
    fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify({processedTranslations,usedWords,usedPhrases}))

    // await subtitlesModel.findOneAndUpdate(NEW_ITEM, { subtitles: processedTranslations });
    // await wordListModel.findOneAndUpdate(NEW_ITEM, { list: usedWords });
    // await phraseListModel.findOneAndUpdate(NEW_ITEM, { list: usedPhrases });

    return { processedTranslations, usedWordsMap, usedPhrasesMap };
  } catch (error) {
    console.error('Error UNCAUGHT:', error.message);
  }
}

async function promptSubtitles(prompt) {
  try {
    console.log('prompt', JSON.stringify(prompt, undefined, 2))
    const chatCompletion = await openai.chat.completions.create({
      response_format: { "type": "json_object" },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: INITIAL_USER_PROMPT + JSON.stringify(prompt) },
      ],
      model: 'gpt-3.5-turbo',
    });
  
    console.log('res', chatCompletion)
    console.log('choices[0].message.content', chatCompletion.choices[0].message.content)
  
    const promptResponse = chatCompletion.choices[0].message.content;
    const newProcessedSubtitles = JSON.parse(promptResponse);
    
    if (!Array.isArray(newProcessedSubtitles.translations)) {
      throw Error('Received not array for translations: ', JSON.stringify(newProcessedSubtitles, undefined, 2))
    }
    if (!Array.isArray(newProcessedSubtitles.usedWords)) {
      throw Error('Received not array for usedWords: ', JSON.stringify(newProcessedSubtitles, undefined, 2))
    }
    if (!Array.isArray(newProcessedSubtitles.usedPhrases)) {
      throw Error('Received not array for usedWords: ', JSON.stringify(newProcessedSubtitles, undefined, 2))
    }

    return newProcessedSubtitles;
  } catch (error) {
    console.error('PROMPT ERROR retrying after a second ...', error)
    await secondPause()
    return promptSubtitles(prompt)
  }
}

async function secondPause() {
  return new Promise((res) => {
    setTimeout(() => res(), 1000)
  })
}