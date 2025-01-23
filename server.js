require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { readFile } = require('fs/promises');
const path = require('path');
const cors = require('cors')
const range = require('range-parser');
const bodyParser = require('body-parser');
const fromVtt = require('subtitles-parser-vtt').fromVtt
const { initAuth, getUserIdByRequestToken, getUserIfExists } = require('./serverAuth');
const initCRUDAndDatabase = require('./serverCRUD').initCRUDAndDatabase;
const fsPromises = require('fs/promises')
const ip = require('ip');
const { default: mongoose } = require('mongoose');
const { subtitles_model } = require('./schemas/subtitles');
const { promptAI } = require('./playground/openai');
const wordInfos = require('./schemas/wordInfos');
const { promptWordInfos, processTranslations } = require('./promptWordInfos');
const { gTranslate } = require('./gTranslate');
const { users_model } = require('./schemas/users');
const { wordCollections_model } = require('./schemas/wordCollections');
const { sortByLearningState } = require('./src/helper/sortByLearningState');
const { movies_model } = require('./schemas/movies');
const splitUsedWords = require('./splitUsedWords');
const { degausser, addVttToDB } = require('./parseUsedWords');
const { LEVEL_TO_OCCURRENCE_MAP } = require('./levels');
const YoutubeTranscript = require('youtube-transcript').YoutubeTranscript;
const { telegramInit } = require('./tgbot')

writeDevelopmentIPAddress();

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

const port =
  (process.argv.includes("--8080") && 8080) ||
  (process.argv.includes("--5000") && 5000) ||
  (process.argv.includes("--3000") && 3000) ||
  9090;
const { createCRUDEndpoints } = initCRUDAndDatabase(app)
const { requireAuth } = initAuth(app)
telegramInit()

app.get('/', (req, res) => res.send('hmmm...'))
app.get("/hello_world", async (req, res) => {
  // const {
  //   query,
  //   params,
  //   path,
  //   headers
  // } = req
  res.type("text/plain");
  res.status(200).send("Welcome! ");
});

app.get("/rec", async (req, res) => {
  const {
    query,
    params,
    path,
    headers
  } = req
  const mediaLang = query.mediaLang || headers["learninglanguage"]

  const user = await getUserIfExists(req)
  let results = []
  try {
    if (query.category === 'Phrases') {
      if (user) {
        // results = user.words
        const UserWordsStringified = user.words.filter((item) => item.isPhrase).map(item => item.the_word).slice(0, 20)?.join()
        let reccommended = (await promptAI(`Reccommend me 20 phrases to learn based on last 20 phrases I learned. Respond with plain yaml one phrase per line e.g. get out\ncome on\nget on). My last 20 phrases: ${UserWordsStringified}`))
        console.log('reccommended', typeof reccommended?.content, reccommended, reccommended?.content)
        reccommended = reccommended?.content?.split('\n').map((line) => line.includes('. ') && line.split('. ')[1])
        results = reccommended.map((item) => ({ the_word: item })) || []
      }
    }
    if (query.category === 'Words') {
      if (user) {
        results = user.words
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const reccommended =
          (await promptAI(`Reccommend me 20 words to learn based on last 20 words I learned. Respond with plain yaml one word per line like (e.g. hello\ncompany\nfew)). My last 20 words: ${UserWordsStringified}`))
            ?.content?.split('\n')
        results = reccommended.map((item) => ({ the_word: item })) || []
      }
    }
    if (query.category === 'Music') {
      if (user) {
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const history = user?.history?.movies
        // const reccommendedTitles =
        // (await promptAI(`Reccommend me 20 music to learn based on last 20 words I learned. Respond with plain yaml one word per line. My last 20 words: ${UserWordsStringified}`))
        //   ?.choices[0]?.message?.split('\n')

        const reccommendedVideos = await movies_model.find({ mediaLang, category: 'Music' })

        results = reccommendedVideos || []
      } else {
        const reccommendedVideos = await movies_model.find({ mediaLang, category: 'Music' })

        results = reccommendedVideos || []
      }
    }
    if (query.category === 'Series') {
      const query = await movies_model.find({ mediaLang, category: "Series" })
      console.log('query', query)
      results = query

      if (user) {
        // results = user.words
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const history = user?.history?.movies
        // const reccommendedTitles =
        //   (await promptAI(`Reccommend me 20 episode from different to learn based on last 20 words I learned. Respond with plain yaml one word per line. My last 20 words: ${UserWordsStringified}`))
        //     ?.choices[0]?.message?.split('\n')

        const reccommendedVideos = await movies_model.find({ mediaLang, category: "Series" })

        results = reccommendedVideos || []
      }
    }
    if (query.category === 'Courses') {
      const query = await movies_model.find({ mediaLang, category: "Courses" })
      console.log('query', query)
      results = query

      if (user) {
        // results = user.words
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const history = user?.history?.movies
        // const reccommendedTitles =
        //   (await promptAI(`Reccommend me 20 courses to learn based on last 20 words I learned. Respond with plain yaml one word per line. My last 20 words: ${UserWordsStringified}`))
        //     ?.choices[0]?.message?.split('\n')

        const reccommendedVideos = await movies_model.find({ mediaLang, category: 'Courses' })

        results = reccommendedVideos || []
      }
    }
    if (query.category === 'Cartoon') {
      const query = await movies_model.find({ mediaLang, category: "Cartoon" })
      console.log('query', query)
      results = query

      if (user) {
        // results = user.words
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const history = user?.history?.movies
        // const reccommendedTitles =
        //   (await promptAI(`Reccommend me 20 cartoons to learn based on last 20 words I learned. Respond with plain yaml one word per line. My last 20 words: ${UserWordsStringified}`))
        //     ?.choices[0]?.message?.split('\n')

        const reccommendedVideos = await movies_model.find({ mediaLang, category: 'Cartoon' })

        results = reccommendedVideos || []
      }
    }
    if (query.category === 'Podcast') {
      const query = await movies_model.find({ mediaLang, category: "Podcast" })
      console.log('query', query)
      results = query

      if (user) {
        // results = user.words
        // const words = wordInfos.wordInfos_model.find()
        const UserWordsStringified = user.words.map(item => item.the_word).slice(0, 20)?.join()
        const history = user?.history?.movies
        // const reccommendedTitles =
        //   (await promptAI(`Reccommend me 20 podcasts to learn based on last 20 words I learned. Respond with plain yaml one word per line. My last 20 words: ${UserWordsStringified}`))
        //     ?.choices[0]?.message?.split('\n')

        const reccommendedVideos = await movies_model.find({ mediaLang, category: 'Podcast' })

        results = reccommendedVideos || []
      }
    }
  } catch (err) {
    console.log('REC err', err)
  }
  res.status(200).send({ results });
});


// async function getYoutubeSubtitles(youtubeId) {
//   return (await fetch('https://subtitle.to/https://www.youtube.com/watch?v=' + youtubeId)).json()
// }

app.get("/youtube_video", async (req, res) => {
  const { mediaLang } = req.query;
  const ids = req.query.ids.split(',')

  if (!ids) {
    res.status(200).send("Sample request: https://api.coplay.live/api/youtube_video?mediaLang=en&ids=L0MK7qz13bU")
  }
  console.log('loop processYoutubeVideo(): ' + ids)
  const results = []
  for (let id of ids) {
    const { videoDetails } = await require("ytdl-core").getInfo('https://www.youtube.com/watch?v=' + id);
    const { category, title, description, lengthSeconds, ownerProfileUrl, isFamilySafe, embed } = videoDetails
    const videoAdjust = { category, title, description, lengthSeconds, ownerProfileUrl, isFamilySafe, youtubeUrl: embed.iframeUrl }
    results.push(videoAdjust)
  }

  res.status(200).send(results)
})

app.get('/youtube_transcript', async (req, res) => {
  const { mediaLang } = req.query;
  const ids = req.query.ids.split(',')

  if (!ids) {
    res.status(200).send("Sample request: https://api.coplay.live/api/youtube_transcript?mediaLang=en&ids=L0MK7qz13bU")
  }

  const results = []
  for (let id of ids) {
    const youtubeUrl = "https://www.youtube.com/watch?v=" + id;
    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl, { lang: mediaLang || '' });
    } catch (err) {
      return res.send('Transcript error: ' + err)
    }
    let transcriptAdjusted = {}
    const relatedMovie = await movies_model.findOne({ youtubeUrl: 'https://www.youtube.com/embed/' + id })
    if (relatedMovie) {
      transcriptAdjusted.mediaId = relatedMovie._id
      transcriptAdjusted.media = relatedMovie
      transcriptAdjusted.subtitles = transcript
      transcriptAdjusted.mediaLang = mediaLang
      transcriptAdjusted.title = mediaLang
    }

    if (req.query.parse = '1') {
      transcriptAdjusted.subtitles = transcriptAdjusted.subtitles.map((item) => {
        const degaussedText = degausser(item.text)
        return ({
          ...item,
          text: degaussedText,
          startTime: item.offset * 1000,
          endTime: (item.offset + item.duration) * 1000,
          usedWords: splitUsedWords(degaussedText)
        })
      })
    }
    results.push(transcriptAdjusted)
  }
  res.status(200).send(results)
})

app.get("/parse_subtitle", async (req, res) => {
  const { mediatitle, mediaLang, skipInsert } = req.query
  const newSubtitle = await addVttToDB(mediatitle, mediaLang, !!skipInsert)
  res.send(newSubtitle)
})

app.get("/occurances_v2", async (req, res) => {
  const word = req.query.lemma;
  let results = await findSubtitlesWithWord(word, req.headers.learninglanguage, req.query.limit);
  const WordInfosModel = mongoose.model(`wordInfos__${req.headers.learninglanguage}__s`, wordInfos.schema);

  if (!WordInfosModel) {
    return res.status(400).send('learninglanguage header is missing');
  }

  res.status(200).send(results)
})

// API endpoint to generate connection code
app.post("/api/generate-telegram-code", (req, res) => {
  try {
    const { _Id } = req.body;

    if (!_Id) {
      return res.status(400).json({ error: "userId is required" });
    }

    const telegramLink = `https://t.me/copaly_bot?start=${_Id}`;

    res.json({ telegramLink });
  } catch (error) {
    console.error("Error generating Telegram code:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

app.get('/processWordInfos', async (req, res) => {
  const { mediaLang, title, type } = req.query
  const query = { mediaLang }

  if (title) {
    query.title
  }
  let list;
  if (type !== 'movies') {
    list = (await wordCollections_model.find(query)).reduce((acc, item) => acc.concat(item.list), [])
  } else {
    list = (await subtitles_model.find(query)).reduce((acc, item) => acc.concat(item.usedWords), [])
  }

  const updatedWords = await promptWordInfos(
    list.map(item => item.the_word),
    mediaLang
  )

  res.statusCode(200).send(updatedWords)
})

app.get('/wordInfoLemma', async (req, res) => {
  let { the_word, mainLang } = req.query;
  const { learninglanguage } = req.headers;
  console.log('the_word, mainLang', the_word, mainLang, learninglanguage)
  try {
    const WordInfosModel = mongoose.model(`wordInfos__${learninglanguage}__s`, wordInfos.schema);
    const requestedWordInfos = await WordInfosModel.find({ the_word });
    console.log("requestedWordInfos", requestedWordInfos);
    const wordInfo = requestedWordInfos[0];

    if (!requestedWordInfos.length || !wordInfo) {
      res.status(404).send("Word info Not found: " + the_word);
    }

    let updatedWordInfo = wordInfo;
    if (wordInfo && wordInfo.shortDefinition) {
      if (!updatedWordInfo?.the_word_translations) {
        updatedWordInfo.the_word_translations = {};
      }
      console.log("updatedWordInfo 1", updatedWordInfo);
      if (!updatedWordInfo.the_word_translations[mainLang]) {
        updatedWordInfo.the_word_translations[mainLang] = await gTranslate(
          wordInfo.the_word,
          mainLang
        );
      }
      const updatedWordInfosKeys = (await promptWordInfos([wordInfo.the_word], learninglanguage))[0]
      console.log('updatedWordInfosKeys 10', updatedWordInfosKeys)
      Object.keys(updatedWordInfosKeys).map(updatedKey => {
        console.log('updatedKey', updatedKey, updatedWordInfosKeys[updatedKey])
        updatedWordInfo[updatedKey] = updatedWordInfosKeys[updatedKey]
      })
      console.log('updatedWordInfo 2', updatedWordInfo)
    }

    if (mainLang !== 'en' && wordInfo.shortDefinition && (!wordInfo.shortDefinition_translations || !wordInfo.shortDefinition_translations[mainLang])) {
      console.log('wordInfo.shortDefinition')

      const translationKeysMap = await processTranslations(learninglanguage, mainLang, [wordInfo])
      const translationKeys = translationKeysMap[wordInfo.the_word] //
      Object.keys(translationKeys).map((translationKey) => {
        if (!updatedWordInfo[translationKey]) {
          updatedWordInfo[translationKey] = {}
        }
        updatedWordInfo[translationKey][mainLang] = translationKeys[translationKey]
      })
      console.log('updatedWordInfo 3', updatedWordInfo)
    }

    if (
      mainLang !== "en" &&
      wordInfo.shortDefinition &&
      (!wordInfo.shortDefinition_translations ||
        !wordInfo.shortDefinition_translations[mainLang])
    ) {
      console.log("wordInfo.shortDefinition");

      const translationKeysMap = await processTranslations(
        learninglanguage,
        mainLang,
        [wordInfo]
      );
      const translationKeys = translationKeysMap[wordInfo.the_word]; //
      Object.keys(translationKeys).map((translationKey) => {
        if (!updatedWordInfo[translationKey]) {
          updatedWordInfo[translationKey] = {};
        }
        updatedWordInfo[translationKey][mainLang] =
          translationKeys[translationKey];
      });
      console.log("updatedWordInfo 3", updatedWordInfo);
    }

    if (
      wordInfo &&
      (!wordInfo.shortDefinition ||
        !wordInfo.the_word_translations ||
        !wordInfo.the_word_translations[mainLang] ||
        !wordInfo.shortDefinition_translations ||
        !wordInfo.shortDefinition_translations[mainLang])
    ) {
      await WordInfosModel.findByIdAndUpdate(wordInfo._id, updatedWordInfo);
    }
    res.status(200).send(updatedWordInfo);
  } catch (err) {
    console.log("err", err);
    res.status(500);
  }
});

app.get("/movie", (req, res) => {
  try {
    const videoPath = getHighestExistingQualityPathForTitle(
      req.query.name,
      req.query.quality
    );

    if (typeof videoPath === undefined) {
      console.error('videoPath undefined')
      return res.status(500).send('videoPath undefined')
    }
    console.log('videoPath end', videoPath)

    if (!videoPath) {
      console.error("VIDEOFILE NOT FOUND: " + req.query.name)
      // return res.status(404)
    }

    // console.log(req.query.name)
    // console.log('videoPath', videoPath)
    const videoStat = fs.statSync(videoPath || '');

    const fileSize = videoStat.size;
    const rangeRequest = req.headers.range;
    console.log('rangeRequest', rangeRequest)

    if (!fileSize) {
      return res.status(500).send('Requested File is Broken. Size: ' + fileSize)
    }

    if (rangeRequest) {
      const ranges = range(fileSize, rangeRequest);
      // console.log('ranges', ranges)
      if (ranges === -1) {
        // 416 Range Not Satisfiable
        res.status(416).send("Requested range not satisfiable");
        return;
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${ranges[0].start}-${ranges[0].end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": ranges[0].end - ranges[0].start + 1,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(videoPath, {
        start: ranges[0].start,
        end: ranges[0].end,
      }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    res.status(500).send('unhandled error')
  }
});

// Function to determine content type based on file extension
function getContentType(extension) {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
    case ".png":
      return "image/jpeg";
    case ".vtt":
      return "text/vtt";
    case ".mp3":
      return "audio/mp3";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

app.get("/movie_words/:_id", async (req, res) => {
  try {
    let user_id = await getUserIdByRequestToken(req);
    const { _id } = req.params;
    console.log('req.query', req.query)
    const { bookmark, level, sort, mediaLang } = req.query;
    console.log(
      "fetching movie words for user_id: " + user_id,
      "_id: " + _id
    );
    let user;

    if (mongoose.Types.ObjectId.isValid(user_id)) {
      user = await users_model.findById(user_id)
    }
    const userWords = user?.words || [];
    let movieWords;
    console.log('f1')
    try {
      console.log("_id requested", _id);
      const movieSubtitle = await subtitles_model.findOne({ mediaId: _id, translateLang: { $exists: false } });
      movieWords = movieSubtitle.subtitles.reduce(
        (acc, item) => acc.concat(item.usedWords.map(the_word => ({ the_word, startTime: item.startTime, endTime: item.endTime }))),
        []
      );
      // console.log('movieWords', movieWords)
      // movieWords = require(path.join(__dirname, 'files', 'movieFiles', `${title}.usedLemmas50kInfosList.json`))
      console.log('f2')
    } catch (err) {
      console.error("Could not fetch words: ", err.code, err.message);
      return res.status(404).send(err.message);
    }
    console.log('f3')

    const shouldExcludeArchive = (bookmark && !bookmark.includes('Archive'))
    const shouldExcludeActive = (bookmark && !bookmark.includes('Active'))

    const userWordsToExclude = userWords.reduce(
      (acc, item) => {
        if (shouldExcludeArchive && item.archived) {
          acc[item.the_word] = item
        }
        if (shouldExcludeActive && !item.archived) {
          acc[item.the_word] = item
        }
        return acc
      },
      {}
    );
    console.log('f4')

    const movieWordsWithoutUserWords = movieWords.filter(
      (item) => item && !Number(item) && !userWordsToExclude[item.the_word]
    );
    const REQUESTED_LEVELS_MAP = {
      Beginner: level?.includes('Beginner'),
      Intermediate: level?.includes('Intermediate'),
      Advanced: level?.includes('Advanced'),
    }
    console.log('REQUESTED_LEVELS_MAP', REQUESTED_LEVELS_MAP)
    const wordInfo_list = await mongoose.model(`wordInfos${`__${mediaLang || 'en'}__s`}`, wordInfos.schema).find({ the_word: movieWordsWithoutUserWords.map(item => item.the_word) })
    const wordInfo_map = wordInfo_list.reduce((acc, item) => ((acc[item.the_word] = item), acc), {})
    // const EN_LEVELS_OCCURRENCE_MAP = LEVEL_TO_OCCURRENCE_MAP['en']
    const movieWordsFiltered = movieWordsWithoutUserWords.filter((item) => {
      // return REQUESTED_LEVELS_MAP[wordInfo_map[item.the_word]?.level]
      const wordInfo = wordInfo_map[item.the_word]
      if (wordInfo) {
        const occurrenceCount = wordInfo_map[item.the_word]?.occuranceCount

        if (wordInfo?.level) {
          return REQUESTED_LEVELS_MAP[wordInfo.level]
        }

        let levelByOccurrence = ''
        if (occurrenceCount > 10000) {
          levelByOccurrence = 'Beginner'
        }
        if (occurrenceCount < 15000) {
          levelByOccurrence = 'Intermediate'
        }
        if (occurrenceCount < 5000) {
          levelByOccurrence = 'Advanced'
        }
        return REQUESTED_LEVELS_MAP[levelByOccurrence]
        // console.log('item.the_word', item.the_word)
        // let level = wordInfo.level
        // if (!level) {
        //   if (occurrenceCount > EN_LEVELS_OCCURRENCE_MAP.Beginner) {
        //     level = 'Beginner'
        //   } 
        //   if (occurrenceCount < EN_LEVELS_OCCURRENCE_MAP.Beginner && occurrenceCount > EN_LEVELS_OCCURRENCE_MAP.Intermediate) {
        //     level = 'Intermediate'
        //   } 
        //   if (occurrenceCount < EN_LEVELS_OCCURRENCE_MAP.Intermediate && occurrenceCount < EN_LEVELS_OCCURRENCE_MAP.Advanced) {
        //     level = 'Advanced'
        //   }
        // }
        // return REQUESTED_LEVELS_MAP[level]
      } else {
        return false
      }
    }).map(item => ({ ...item, occurrence: wordInfo_map[item.the_word].occuranceCount }))
    console.log('movieWordsFiltered', movieWordsFiltered)
    const movieWordsUnduplicated = Object.values(
      movieWordsFiltered.reduce(
        (acc, item) => ((acc[item.the_word] = item), acc),
        {}
      )
    );
    const sorted = movieWordsUnduplicated.sort((a, b) => {
      if (sort === 'Easy') {
        return b.occurrence - a.occurrence
      } else if (sort === 'Hard') {
        return a.occurrence - b.occurrence
      } else {
        a.startTime - b.startTime
      }
    })
    console.log('sort', sort, movieWordsUnduplicated)
    res.status(200).send(sorted);
  } catch (err) {
    console.log('f error', err.message)
    res.status(500).send(err.message);
  }
});

app.post("/self_words", requireAuth, async (req, res) => {
  try {
    const { language } = req.query;
    const { learninglang } = req.headers;
    const User = users_model;
    const _id = req.userId;
    const wordListKey = learninglang || language ? `${learninglang || language}_words` : "words";

    const updatedWordOrWordsArray = req.body;
    // console.log('updatedWordOrWordsArray', updatedWordOrWordsArray)
    const user = await User.findById(_id);
    if (!user) {
      res.statusCode(404).send("Requested user not found");
    }
    const updatedWordsMap = !Array.isArray(updatedWordOrWordsArray)
      ? [updatedWordOrWordsArray]
      : updatedWordOrWordsArray.reduce(
        (acc, item) => ((acc[item.the_word] = item), acc),
        {}
      );
    console.log("updatedWordsMap", updatedWordsMap);
    const userWords = user[wordListKey] || [];
    console.log("userWords.length", userWords.length);
    // console.log('words', words)
    userWords.forEach((userWord) => {
      const updatedWordMatch = updatedWordsMap[userWord.the_word];
      delete updatedWordsMap[userWord.the_word];
      if (updatedWordMatch) {
        userWord = updatedWordMatch;
      }
    });
    const update = {
      _id,
      updatedTime: Date.now(),
    };
    const addedNewWordsArray = Object.values(updatedWordsMap);
    update[wordListKey] = addedNewWordsArray.concat(userWords);
    console.log("update", update);
    // console.log('update', update)
    console.log("_id", _id);
    await User.findByIdAndUpdate(_id, update);

    res.status(200).send(update);
  } catch (err) {
    console.log("ERRORED: ", err);
    res.status(500).send(err.message);
  }
});

app.get("/self_words/:listType", requireAuth, async (req, res) => {
  const User = users_model;

  try {
    console.log("REQUEST With User: ", req.userId);

    // Here, req.user will contain the user information extracted from the token.
    // You can use this information to retrieve the user from your database.
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { listType } = req.params;

    // Return user information (you can customize what data you want to send back)
    let userWordsByType = [];
    const userWords = user.words
    console.log('userWords', userWords)

    const userLists = sortByLearningState(userWords)
    userWordsByType = userLists[listType + 'List']

    res.status(200).json(userWordsByType);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

app.get("/subtitles_v2", async (req, res) => {
  const { subtitleId, mediaTitle, translateLang } = req.query;
  console.log("SUBTITLES requested id", subtitleId);
  let subtitleInfo;
  try {
    const query = {}

    if (!translateLang) {
      query.translateLang = { $exists: false }
    }

    if (subtitleId) {
      query._id = subtitleId
    }

    if (mediaTitle) {
      query.mediaTitle = mediaTitle
    }

    console.log('query', query)
    subtitleInfo = await subtitles_model.findOne(query);
    res.send(subtitleInfo.subtitles);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/subtitles_v1", async (req, res) => {
  const mediaLang = "en";
  const defaultTranslateLanguage = "ru";
  try {
    let { locale, name, version } = req.query;
    if (!locale) {
      locale = mediaLang;
    }
    let subtitlesVttPath = path.join(
      __dirname,
      "files",
      "movieFiles",
      `${name}.${locale || mediaLang}.vtt`
    );
    if (locale !== mediaLang) {
      subtitlesVttPath = path.join(
        __dirname,
        "files",
        "movieFiles",
        `${name}.${locale || defaultTranslateLanguage}.subtitles.json`
      );
    }
    console.log("subtitlesVttPath", subtitlesVttPath);
    let subtitlesVtt;
    try {
      if (subtitlesVttPath.indexOf(".vtt") !== -1) {
        console.log("HEY");
        subtitlesVtt = await readFile(subtitlesVttPath, "utf8");
        // console.log('SBT VTT: ', subtitlesVtt)

        subtitlesVtt = fromVtt(subtitlesVtt, "ms");
        // console.log('SBT VTT: ', subtitlesVtt)
      } else {
        console.log("HEY 2");

        subtitlesVtt = await readFile(subtitlesVttPath);
      }
    } catch (err) {
      res.status(404).send("");
    }
    res.send(subtitlesVtt);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} at IP: ${ip.address()}`);
});
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/coplay.live/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/coplay.live/fullchain.pem'),
// };

// const port2 = process.argv[3] || 3001
// https.createServer(options, app).listen(port2, () => {
//   console.log('HTTPS Server running on port port2');
// });

createFileRoute(app, "movieFiles");
createFileRoute(app, "images");
createFileRoute(app, "clipFiles");
createCRUDEndpoints("users");
createCRUDEndpoints("movies");
createCRUDEndpoints("playList");
createCRUDEndpoints('subtitles');
// createCRUDEndpoints('clips');
// createCRUDEndpoints('quizzes');
// createCRUDEndpoints('words');
createCRUDEndpoints('wordCollections');
createCRUDEndpoints('wordInfos');
// createCRUDEndpoints('occurances');


// createCRUDEndpoints('favorites', {
//   middleware: requireAuth,
//   excludeKeys: [""],
// });
// createCRUDEndpoints('movies');
// createCRUDEndpoints('cramming');
// createCRUDEndpoints('words');
// createCRUDEndpoints('shorts');

function createFileRoute(app, folder) {
  app.get(`/${folder}/:path*`, async (req, res) => {
    const { path: filePath } = req.params;
    const fullPath = path.join(`./files/${folder}`, filePath);

    try {
      const fileContent = await fsPromises.readFile(fullPath);

      // Determine the file type based on the extension
      const fileExtension = path.extname(fullPath).toLowerCase();
      const contentType = getContentType(fileExtension);

      res.set("Content-Type", contentType);
      res.send(fileContent);
    } catch (error) {
      res.status(404).send({ error: "File not found" });
    }
  });

  // Define a route for handling POST requests
  app.post(`/${folder}/:path*`, async (req, res) => {
    // const { path: filePath } = req.params;
    // const fullPath = path.join(`./files/${folder}`, filePath);
    // const { content } = req.body;

    // try {
    //   await fsPromises.writeFile(fullPath, content);
    //   res.send({ success: true, message: "File saved successfully" });
    // } catch (error) {
    //   res.status(500).send({ error: "Internal server error" });
    // }
    const { folder } = req.params;
    const { path: filePath } = req.params;
    const fullPath = path.join(`./files/images`, filePath);
    const { content } = req.body;
    const userAgent = req.headers['User-Agent']
    try {
      // Create the directory if it doesn't exist
      if (userAgent.includes('Safari')) {
        return res.status(200).send('Cannot save from safari')
      }

      if (fs.existsSync(fullPath)) {
        return res.status(400).send('File already exists at: ' + fullPath)
      }


      await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });

      // Convert base64 to buffer and save
      const imageBuffer = Buffer.from(content, 'base64');
      await fsPromises.writeFile(fullPath, imageBuffer);

      res.send({ success: true, message: "Image saved successfully" });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).send({ error: "Internal server error" });
    }

  });
}

const QUALITY_OPTIONS = ["1080.ultra", "1080", "760", "480", "360", "240"];

function getHighestExistingQualityPathForTitle(title, chosenQuality) {
  if (chosenQuality) {
    console.log('chosenQuality', chosenQuality)
    return path.join(
      __dirname,
      "files",
      "movieFiles",
      `${title}.${chosenQuality}.mp4`
    );
  }

  for (let index = 0; index < QUALITY_OPTIONS.length; index++) {
    const videoPath = path.join(
      __dirname,
      "files",
      "movieFiles",
      `${title}.${QUALITY_OPTIONS[index]}.mp4`
    );

    if (fs.existsSync(videoPath)) {
      return videoPath;
    }
  }
  const defaultQuality = path.join(
    __dirname,
    "files",
    "movieFiles",
    `/${title}.mp4`
  );
  // console.log('defaultQuality', defaultQuality)
  if (fs.existsSync(defaultQuality)) {
    // console.log('returning defaultQuality')
    return defaultQuality;
  }
}

function writeDevelopmentIPAddress() {
  const IPJS = `
export const IP_ADDRESS = '${ip.address()}'
// GENERATED BY server.js at root
`;

  if (!fs.existsSync("./src/ip.local.js")) {
    fs.writeFileSync("./src/ip.local.js", IPJS);
  }

  if (fs.readFileSync("./src/ip.local.js", "utf-8") !== IPJS) {
    fs.writeFileSync("./src/ip.local.js", IPJS);
  }
}

async function findSubtitlesWithWord(word, mediaLang = "en", limit = 10) {
  try {
    const results = await subtitles_model
      .aggregate([
        { $unwind: "$subtitles" },
        { $match: { "subtitles.usedWords": word, mediaLang } },
        {
          $addFields: {
            mediaIdObject: { $toObjectId: "$mediaId" }, // Convert mediaId string to ObjectId
          },
        },
        {
          $lookup: {
            from: "movies", // The name of the movies collection in MongoDB
            localField: "mediaIdObject", // Field in subtitles_model that matches a field in movies
            foreignField: "_id", // Field in movies collection to join on
            as: "movieDetails", // The name of the field to store the joined data
          },
        },
        {
          $project: {
            _id: 0,
            id: "$subtitles.id",
            text: "$subtitles.text",
            subtitleInfoId: "$_id",
            youtubeUrl: { $arrayElemAt: ["$movieDetails.youtubeUrl", 0] }, // Accessing first matched movie
            vkVideoEmbed: { $arrayElemAt: ["$movieDetails.vkVideoEmbed", 0] },
            mediaLabel: { $arrayElemAt: ["$movieDetails.mediaLabel", 0] },
            mediaId: "$mediaId",
            mediaSrc: "$mediaSrc",
            startTime: "$subtitles.startTime",
            endTime: "$subtitles.endTime",
          },
        },
      ])
      .limit(Number(limit));
    console.log("OCCURR", results.filter(item => item.mediaTitle === 'frozen'))
    return results;
  } catch (err) {
    console.error(err);
    throw err;
  }
}