const fs = require('fs');
const path = require('path');
const { fromVtt } = require('subtitles-parser-vtt');
const OpenAI = require('openai');
const { initCRUDAndDatabase } = require('./serverCRUD');
const openai = new OpenAI({ key: process.env.OPENAI_API_KEY });

require('dotenv').config();
initCRUDAndDatabase();

const subtitlesModel = require('./schemas/subtitles').model;
const wordListModel = require('./schemas/wordLists').model;
const phraseListModel = require('./schemas/phraseLists').model;
const moviesModel = require('./schemas/movies').model;

// const promptres = JSON.parse(fs.readFileSync('./openaisubtitlepromptprocess.json', 'utf-8'))
// console.log(promptres.processedTranslations.length);
// const subtitlePath = path.join(__dirname, 'files', 'movieFiles', `${'kung_fu_panda_3'}.${'en'}.vtt`);
// const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
// const subtitles = fromVtt(subtitlesVtt, 'ms');
// console.log(subtitles.length);

// fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify(newpromptres))

const NEW_ITEM = {
  forTitle: 'kung_fu_panda_3',
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

const SYSTEM_PROMPT = `Subtitle lines translations, Used phrases, 1 or 2 word/phrase highlights`
const INITIAL_USER_PROMPT = `
PROMPT TRANSLATION: Subtitle lines translations + Matched phrases + highlights

I will provide you array of subtitle lines. I want you to translate those lines for the given language.
I want you to respond with JSON format. I'll provide you with examples.

Also if you detect phrases I want you to include those used phrases within the given subtitle in your answer.
Also, for every subtitle line, I want you to give highlighted translation part.

!IMPORTANT:
Number of tranlated items should be same as number of subtitleLines in the given prompt.
Hightlight no more than 2 words/phrases per subtitle. Prefer highlighting less common words/phrases within the subtitle rather than common ones.
Do not highlight single word subtitles.

Language: RU.
Movie Context: name Frozen, genre: musical, medieval, fairytale, fantasy.
Known characters: 

e.g.SAMPLE INPUT JSON

{
  "subtitleLines": [
    "Do you want to build a snowman?",
    "The cold never bothered me anyway.",
    "Let it go, let it go, can't hold it back anymore.",
    "Nope.",
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
      "highlighted": [“Let it go", “hold it back”],
      "usedPhrases": ["Let it go", "hold it back"],
      "highlighted": ["Отпусти", "сдерживать”],
    },
    {
      "original": "Nope.",
      "translation": "Нет.",
    }
  ]
}
REAL INPUT JSON
`;
prepareSubtitles();

async function prepareSubtitles(title = 'kung_fu_panda_3', locale = 'en', translateLang = 'ru') {
  console.log('STARTING...')
  try {
    const subtitlesVttPath = path.join(__dirname, 'files', 'movieFiles', `${title}.${locale || 'en'}.vtt`);
    const subtitlesVtt = fs.readFileSync(subtitlesVttPath, 'utf-8');
    const subtitles = fromVtt(subtitlesVtt, 'ms');

    const inputPrompt = {
      subtitleLines: [],
      language: translateLang,
      movieContext: title,
      genre: ['animation', 'action', 'family', 'comedy', 'adventure'],
      knownCharacters: [],
    };
    let processedTranslations = []
    let itemsToProcess = []

    let count = 0
    console.log('subtitles.length', subtitles.length)
    let index = -1
    for (const item of subtitles) {
      index++;

      const text = item.text.replaceAll('\n', "<br>")
      itemsToProcess.push({ text, ...item })
      count++;
      if (count > 10 || index === subtitles.length - 1) {
        count = 0
        try {
          inputPrompt.subtitleLines = itemsToProcess.map(item => item.text);
          const newProcessedSubtitles = await promptSubtitles(inputPrompt, itemsToProcess);
          itemsToProcess = [item]

          if (processedTranslations.length) {
            newProcessedSubtitles.translations.shift() // remove first item, as it just served as a context for translation
          }
          processedTranslations.push(...newProcessedSubtitles.translations)
          // await subtitlesModel.findOneAndUpdate(NEW_ITEM, { subtitles: processedTranslations });
          // await wordListModel.findOneAndUpdate(NEW_ITEM, { list: usedWords });
          // await phraseListModel.findOneAndUpdate(NEW_ITEM, { list: usedPhrases });

          fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify(processedTranslations))
          console.log('processedTranslations.length:', processedTranslations.length + ` of ${subtitles.length}`)
          // }
        } catch (err) {
          console.log('ERRORED AT PROMPT: ', err)
          console.log('processedTranslations.length:', processedTranslations.length)
        }
      }
    };

    return processedTranslations;
  } catch (error) {
    console.error('Error UNCAUGHT:', error.message);
  }
}

async function promptSubtitles(prompt, itemsToProcess) {
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
    console.log('promptResponse', promptResponse)
    console.log('type', typeof promptResponse)

    if (!Array.isArray(newProcessedSubtitles.translations)) {
      throw Error('Received not array for translations: ' + JSON.stringify(newProcessedSubtitles, undefined, 2))
    }

    if (newProcessedSubtitles.translations.length !== itemsToProcess.length) {
      throw Error('Subtitle prompt items length and response items length didn\'t match: ' + newProcessedSubtitles.translations.length + ' -> ' + itemsToProcess.length)
    }

    newProcessedSubtitles.translations = newProcessedSubtitles.translations.map((promptRes, index) => {
      return { promptRes, ...itemsToProcess[index] }
    })

    return newProcessedSubtitles;
  } catch (error) {
    console.error('PROMPT ERROR retrying after 3 seconds ...', error)
    await wait()
    return promptSubtitles(prompt, itemsToProcess)
  }
}

async function wait(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms || 3000)
  })
}