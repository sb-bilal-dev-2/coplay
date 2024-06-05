const fs = require('fs');
const path = require('path');
const { fromVtt } = require('subtitles-parser-vtt');
const OpenAI = require('openai');
const { subtitles_model } = require('./schemas/subtitles');
const { gTranslate } = require('./gTranslate');
require('dotenv').config();
const openai = new OpenAI({ key: process.env.OPENAI_API_KEY });

// const subtitlesModel = require('./schemas/subtitles').model;
// const moviesModel = require('./schemas/movies').model;

// const promptres = JSON.parse(fs.readFileSync('./openaisubtitlepromptprocess.json', 'utf-8'))
// console.log(promptres.processedTranslations.length);
// const subtitlePath = path.join(__dirname, 'files', 'movieFiles', `${'kung_fu_panda_3'}.${'en'}.vtt`);
// const subtitlesVtt = fs.readFileSync(subtitlePath, 'utf-8');
// const subtitles = fromVtt(subtitlesVtt, 'ms');
// console.log(subtitles.length);

// fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify(newpromptres))

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

Movie Context: name Frozen, genre: musical, medieval, fairytale, fantasy.

e.g.SAMPLE INPUT JSON. PS: give attention to "translateLanguage" in the REAL INPUT JSON

{
  "subtitleLines": [
    "Do you want to build a snowman?",
    "The cold never bothered me anyway.",
    "Let it go, let it go, can't hold it back anymore.",
    "Nope.",
  ],
  "mediaLang": "en"
  "translateLanguage": "ru",
}
e.g. SAMPLE OUTPUT JSON

{
  "translations": [
    {
      "translation": "Хочешь построить снеговика?",
      "highlightedOriginalText": ["snowman"],
      "highlightedTranslation": ["снеговика"],
    },
    {
      "translation": "Холод меня никогда не беспокоил.",
      "highlightedOriginalText": ["cold", "bothered"],
      "highlightedTranslation": ["Холод", "беспокоил"],
    },
    {
      "translation": "Отпусти, отпусти, больше не могу сдерживать.",
      "highlightedOriginalText": ["Let it go", "hold it back"],
      "highlightedTranslation": ["Отпусти", "сдерживать"],
    },
    {
      "translation": "Нет.",
    }
  ]
}
REAL INPUT JSON
`;
// prepareSubtitles();
const ELIGIBLE_CHAT_GPT_TRANSLATIONS = ['ru', 'tr', 'kr', 'cn']

async function prepareSubtitles(
  contentFolder = './files/movieFiles',
  mediaInfo,
  translateLanguage = '',
  subtitles,
) {
  const isPromptingOpenAI = ELIGIBLE_CHAT_GPT_TRANSLATIONS.includes(translateLanguage)
  if (!mediaInfo) {
    console.error('mediaInfo missing at prepareSubtitles')
  }
  console.log('STARTING...')
  try {
    const subtitlesVttPath = path.join(contentFolder, `${mediaInfo?.mediaTitle}.${mediaInfo?.mediaLang || 'en'}.vtt`);


    if (!subtitles) {
      console.log('mediaInfo.parsedSubtitleId', mediaInfo.parsedSubtitleId)
      subtitles = (await subtitles_model.findById(mediaInfo.parsedSubtitleId)).subtitles
      // let subtitlesVtt = fs.readFileSync(subtitlesVttPath, 'utf-8');
      // subtitles = fromVtt(subtitlesVtt, 'ms');
      console.log('NO SUBTITLES at', mediaInfo?.mediaTitle)
    }

    const inputPrompt = {
      mediaLang: mediaInfo?.mediaLang || 'en',
      translateLanguage
    };
    let processedTranslations = []
    let itemsToProcess = []

    let count = 0
    console.log('subtitles - ' + mediaInfo?.mediaTitle, subtitles?.length);
    let index = -1
    for (const item of subtitles) {
      index++;

      const text = item.text.replaceAll('\n', "<br>")
      itemsToProcess.push({ text, ...item })
      count++;
      const isLastItem = index === subtitles.length - 1;
      if (count > 10 || isLastItem) {
        count = 0
        try {
          inputPrompt.subtitleLines = itemsToProcess.map(item => item.text);
          let newProcessedSubtitles
          if (isPromptingOpenAI) {
            newProcessedSubtitles = await promptSubtitlesOpenAi(inputPrompt, itemsToProcess);
          } else {
            newProcessedSubtitles = await processGoogleTranslations(inputPrompt, itemsToProcess)
          }
          // const newProcessedSubtitles =  itemsToProcess.map(item => ({ translation: item.text, highlighted: [], highlightedTranslation: [] }))
          itemsToProcess = [item]

          if (processedTranslations.length) {
            newProcessedSubtitles.shift() // remove first item, as it just served as a context for translation
          }
          processedTranslations.push(...newProcessedSubtitles)
          // fs.writeFileSync('./openaisubtitlepromptprocess.json', JSON.stringify(processedTranslations))
          const temp_file_save_path = `${contentFolder}/${mediaInfo?.title}.${translateLanguage}.temp.subtitles.json`
          fs.writeFileSync(temp_file_save_path, JSON.stringify(processedTranslations))
          console.log('processedTranslations.length:', processedTranslations.length + ` of ${subtitles.length}`)
          // }
          if (isLastItem) {
            const newSubtitle = await subtitles_model.create({
              mediaTitle,
              title: translateLanguage,
              mediaLang: mediaInfo.mediaLang,
              translateLang: translateLanguage,
              mediaId: mediaInfo.mediaId,
              subtitles: processedTranslations
            })
            await movies_model.findByIdAndUpdate(mediaInfo._id, { $push: { subtitleInfos: newSubtitle } })
            return newSubtitle?._id;
          }
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

async function processGoogleTranslations(prompt, itemsToProcess) {
  const promptText = itemsToProcess.map(item => {
    const currentText = item.taglessText || item.text
    return currentText
  }).join(' + ')

  const response = await gTranslate(
    promptText,
    { to: prompt.translateLanguage, from: prompt.mediaLang })
  const resArr = response.split(' + ')

  if (resArr.length !== itemsToProcess.length) {
    throw Error(`TRANSLATE: item count did not match, requested: ${itemsToProcess.length} and response: ${resArr.length}`)
  }
  return resArr.map((translation, index) => {
    const requestedItem = itemsToProcess[index];
    return ({
      translation,
      text: requestedItem.text,
      id: requestedItem.id,
      startTime: requestedItem.startTime,
      endTime: requestedItem.endTime
    })
  })
}

async function promptSubtitlesOpenAi(prompt, itemsToProcess) {
  try {
    console.log('prompt', JSON.stringify(prompt, undefined, 2))
    const chatCompletion = await openai.chat.completions.create({
      response_format: { "type": "json_object" },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: INITIAL_USER_PROMPT + JSON.stringify(prompt) },
      ],
      model: 'gpt-3.5-turbo',
      // model: 'gpt-4o', // https://platform.openai.com/docs/models
    });

    console.log('res', chatCompletion)
    console.log('choices[0].message.content', chatCompletion.choices[0].message.content)

    const promptResponse = chatCompletion.choices[0].message.content;
    let newProcessedSubtitles = JSON.parse(promptResponse)?.translations;
    console.log('promptResponse', promptResponse)
    console.log('type', typeof promptResponse)

    if (!Array.isArray(newProcessedSubtitles)) {
      throw Error('Received not array for translations: ' + JSON.stringify(newProcessedSubtitles, undefined, 2))
    }

    if (newProcessedSubtitles.length !== itemsToProcess.length) {
      throw Error('Subtitle prompt items length and response items length didn\'t match: ' + newProcessedSubtitles.length + ' -> ' + itemsToProcess.length)
    }

    newProcessedSubtitles = newProcessedSubtitles.map((promptRes, index) => {
      const requestedItem = itemsToProcess[index];
      return {
        translation: promptRes.translation,
        highlighted: promptRes.highlightedOriginalText,
        highlightedTranslation: promptRes.highlightedTranslation,
        text: requestedItem.text,
        id: requestedItem.id,
        startTime: requestedItem.startTime,
        endTime: requestedItem.endTime
      }
    })

    return newProcessedSubtitles;
  } catch (error) {
    console.error('PROMPT ERROR retrying after 3 seconds ...', error)
    await wait()
    return promptSubtitlesOpenAi(prompt, itemsToProcess)
  }
}

async function wait(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms || 3000)
  })
}

module.exports = {
  prepareSubtitles
}