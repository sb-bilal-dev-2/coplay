require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { readFile } = require('fs/promises');
const path = require('path');
const cors = require('cors')
const range = require('range-parser');
const bodyParser = require('body-parser');
const fromVtt = require('subtitles-parser-vtt').fromVtt
const { initAuth, getUserIdByRequestToken } = require('./serverAuth');
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
  9090;
const { createCRUDEndpoints } = initCRUDAndDatabase(app)
const { requireAuth } = initAuth(app)

app.get("/hello_world", (req, res) => {
  res.type("text/plain");

  res.send("Welcome!");
});

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
  const videoPath = getHighestExistingQualityPathForTitle(
    req.query.name,
    req.query.quality
  );

  if (!videoPath) {
    console.error("VIDEOFILE NOT FOUND: " + req.query.name)
    // return res.status(404)
  }

  // console.log(req.query.name)
  // console.log('videoPath', videoPath)
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const rangeRequest = req.headers.range;

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

app.get("/movie_words/:mediaTitle", async (req, res) => {
  try {
    let user_id = await getUserIdByRequestToken(req);
    const { mediaTitle } = req.params;
    console.log(
      "fetching movie words for user_id: " + user_id,
      "mediaTitle: " + mediaTitle
    );
    let user;

    if (mongoose.Types.ObjectId.isValid(user_id)) {
      user = await users_model.findById(user_id)
    }
    const userWords = user?.words || [];
    let movieWords;
    try {
      console.log("mediaTitle requested", mediaTitle);
      const movieSubtitle = await subtitles_model.findOne({ mediaTitle, translateLang: { $exists: false } });

      movieWords = movieSubtitle.subtitles.reduce(
        (acc, item) => acc.concat(item.usedWords.map(the_word => ({ the_word, startTime: item.startTime }))),
        []
      );
      console.log('movieWords', movieWords)
      // movieWords = require(path.join(__dirname, 'files', 'movieFiles', `${title}.usedLemmas50kInfosList.json`))
    } catch (err) {
      console.error("Could not fetch words: ", err.code, err.message);
      return res.status(404).send(err.message);
    }
    const userWordsMap = userWords.reduce(
      (acc, item) => ((acc[item.the_word] = item), acc),
      {}
    );
    const movieWordsWithoutUserWords = movieWords.filter(
      (item) => item && !Number(item) && !userWordsMap[item.the_word]
    );
    const movieWordsUnduplicated = Object.values(
      movieWordsWithoutUserWords.reduce(
        (acc, item) => ((acc[item.the_word] = item), acc),
        {}
      )
    );
    res.status(200).send(movieWordsUnduplicated.sort((a, b) => a.startTime - b.startTime));
  } catch (err) {
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
  const { subtitleId } = req.query;
  console.log("SUBTITLES requested id", subtitleId);
  let { mediaLang = "en", translateLang, mediaId, name } = req.query;
  let subtitleInfo;
  try {
    if (subtitleId) {
      subtitleInfo = await subtitles_model.findById(subtitleId);
      console.log("SUBTITLE RESPINDING: ", subtitleInfo?._id);
    } else {
      subtitleInfo = await subtitles_model.findOne({
        mediaTitle: name,
        mediaLang,
        translateLang,
      });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
  res.send(subtitleInfo.subtitles);
});

app.get("/subtitles", async (req, res) => {
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
createFileRoute(app, "clipFiles");
createCRUDEndpoints("users");
createCRUDEndpoints("movies");
// createCRUDEndpoints('subtitles');
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
    const { path: filePath } = req.params;
    const fullPath = path.join(`./files/${folder}`, filePath);
    const { content } = req.body;

    try {
      await fsPromises.writeFile(fullPath, content);
      res.send({ success: true, message: "File saved successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  });
}

const QUALITY_OPTIONS = ["1080.ultra", "1080", "760", "480", "360", "240"];

function getHighestExistingQualityPathForTitle(title, chosenQuality) {
  if (chosenQuality) {
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
          $project: {
            _id: 0,
            id: "$subtitles.id",
            text: "$subtitles.text",
            subtitleInfoId: "$_id",
            youtubeUrl: "$youtubeUrl",
            mediaTitle: "$mediaTitle",
            mediaSrc: "$mediaSrc",
            startTime: "$subtitles.startTime",
            endTime: "$subtitles.endTime",
          },
        },
      ])
      .limit(Number(limit));
    return results;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
