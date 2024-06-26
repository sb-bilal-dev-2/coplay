require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const { readFile } = require('fs/promises');
const path = require('path');
const cors = require('cors')
const range = require('range-parser');
const bodyParser = require('body-parser');
const fromVtt = require('subtitles-parser-vtt').fromVtt
const { initAuth, getUserIdByRequestToken } = require('./serverAuth');
const { translateVtt } = require('./translateVtt');
const initCRUDAndDatabase = require('./serverCRUD').initCRUDAndDatabase;
const fsPromises = require('fs/promises')
const ip = require('ip');
const { default: mongoose } = require('mongoose');
const { subtitles_model } = require('./schemas/subtitles');

// console.log(ip.address())
writeDevelopmentIPAddress()

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));


const { createCRUDEndpoints, models } = initCRUDAndDatabase(app)
const { requireAuth } = initAuth(app)

const port = process.argv[2] || 3001;

app.get('/hello_world', (req, res) => {
  res.type('text/plain')

  res.send('Welcome!')
})
app.get('/movie', (req, res) => {
  const videoPath = getHighestExistingQualityPathForTitle(req.query.name, req.query.quality)
  console.log(req.query.name)
  console.log('videoPath', videoPath)
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const rangeRequest = req.headers.range;

  if (rangeRequest) {
    const ranges = range(fileSize, rangeRequest);
    console.log('ranges', ranges)
    if (ranges === -1) {
      // 416 Range Not Satisfiable
      res.status(416).send('Requested range not satisfiable');
      return;
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${ranges[0].start}-${ranges[0].end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': ranges[0].end - ranges[0].start + 1,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath, { start: ranges[0].start, end: ranges[0].end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath).pipe(res);
  }
});

// Function to determine content type based on file extension
function getContentType(extension) {
  switch (extension) {
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'image/jpeg';
    case '.vtt':
      return 'text/vtt';
    case '.mp3':
      return 'audio/mp3';
    case '.mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
}


// app.get('/translate', async (req, res) => {
//   try {
//     const { locale, name } = req.query;
//     const baseURL = 'cloud.digital/subtitles/';
//     const engVtt = baseURL + 'en';
//     const translationVttTree = await translateVtt(locale, name);
//     const newTranslation = await (new Model(translationVttTree)).save();
//     await newTranslation.save();
//     newData = new Model(engVtt);
//     await newData.save();

//     res.status(200).send();
//   } catch(err) {

//   }
// })
app.get('/movie_words/:parsedSubtitleId', async (req, res) => {
  try {
    let user_id = await getUserIdByRequestToken(req)
    const { parsedSubtitleId } = req.params;
    console.log('fetching movie words for user_id: ' + user_id, 'parsedSubtitleId: ' + parsedSubtitleId)
    let user;

    if (mongoose.Types.ObjectId.isValid(user_id)) {
      user = await models.users.findById(user_id)
    }
    const userWords = user?.words || []
    let movieWords
    try {
      movieWords = (await subtitles_model.findById(parsedSubtitleId).select({ usedLemmas: 1 })).usedLemmas
      console.log('movieWords?.length', movieWords?.length)
      // movieWords = require(path.join(__dirname, 'files', 'movieFiles', `${title}.usedLemmas50kInfosList.json`))
    } catch (err) {
      return res.status(404).send(err.message)
    }
    const userWordsMap = {}; userWords.forEach(item => { userWordsMap[item.lemma] = item });
    const movieWordsWithoutUserWords = movieWords.filter(item => item && !userWordsMap[item.lemma])

    res.status(200).send(movieWordsWithoutUserWords)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.post('/self_words', requireAuth, async (req, res) => {
  try {
    const { language } = req.query;
    const User = models.users;
    const _id = req.userId;
    const updatedWords = req.body
    // console.log('updatedWords', updatedWords)
    const user = await User.findById(_id)
    const userWords = user?.words || []
    const userWordsMap = {};
    userWords.forEach(item => { userWordsMap[item.lemma] = item })
    console.log('userWordsMap', userWordsMap)
    updatedWords.forEach(item => {
      if (userWordsMap[item.lemma]) {
        Object.keys(item).forEach(key => {
          userWordsMap[item.lemma][key] = item[key]
        })
      } else {
        userWordsMap[item.lemma] = item;
      }
    })
    const words = Object.keys(userWordsMap).map(key => userWordsMap[key]);
    // console.log('words', words)
    const update = {
      _id,
      updatedTime: Date.now()
    }
    const key = language ? `${language}_words` : 'words';
    update[key] = words;
    // console.log('update', update)
    console.log('_id', _id)
    await User.findByIdAndUpdate(_id, update)

    res.status(200).send(update)
  } catch (err) {
    console.log('ERRORED: ', err)
    res.status(500).send(err.message)
  }
})

app.get('/subtitles_v2', async (req, res) => {
  const { subtitleId } = req.query
  console.log('SUBTITLES requested id', subtitleId)
  let { mediaLang = 'en', translateLang, mediaId, name } = req.query;
  let subtitleInfo;
  try {
    if (subtitleId) {
      subtitleInfo = await subtitles_model.findById(subtitleId)
      console.log('SUBTITLE RESPINDING: ', subtitleInfo?._id)
    } else {
      subtitleInfo = await subtitles_model.findOne({ mediaTitle: name, mediaLang, translateLang })
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
  res.send(subtitleInfo.subtitles)
})

app.get('/subtitles', async (req, res) => {
  const mediaLang = 'en';
  const defaultTranslateLanguage = 'ru'
  try {
    let { locale, name, version } = req.query;
    if (!locale) {
      locale = mediaLang
    }
    let subtitlesVttPath = path.join(__dirname, 'files', 'movieFiles', `${name}.${locale || mediaLang}.vtt`)
    if (locale !== mediaLang) {
      subtitlesVttPath = path.join(__dirname, 'files', 'movieFiles', `${name}.${locale || defaultTranslateLanguage}.subtitles.json`)
    }
    console.log('subtitlesVttPath', subtitlesVttPath)
    // if (!fs.existsSync(subtitlesVttPath) && version === 'translate') {
    //   await translateVtt(locale, name)
    // }
    let subtitlesVtt;
    try {
      if (subtitlesVttPath.indexOf('.vtt') !== -1) {
        console.log('HEY')
        subtitlesVtt = await readFile(subtitlesVttPath, 'utf8');
        // console.log('SBT VTT: ', subtitlesVtt)

        subtitlesVtt = fromVtt(subtitlesVtt, 'ms')
        // console.log('SBT VTT: ', subtitlesVtt)
      } else {
        console.log('HEY 2')

        subtitlesVtt = await readFile(subtitlesVttPath);
      }
    } catch (err) {
      res.status(404).send('')
    }
    res.send(subtitlesVtt)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

// app.listen(port, () => {
//   console.log(`Server is running on port ${port} at IP: ${ip.address()}`);
// });
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/coplay.live/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/coplay.live/fullchain.pem'),
};

const port2 = process.argv[3] || 3001
https.createServer(options, app).listen(port2, () => {
  console.log('HTTPS Server running on port port2');
});


createFileRoute(app, 'movieFiles')
createFileRoute(app, 'clipFiles')
createCRUDEndpoints('users');
createCRUDEndpoints('movies');
// createCRUDEndpoints('subtitles');
createCRUDEndpoints('clips');
createCRUDEndpoints('quizzes');
// createCRUDEndpoints('words');
createCRUDEndpoints('wordCollections');
createCRUDEndpoints('wordInfos');
createCRUDEndpoints('occurances');


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
      console.log('fullPath', fullPath)

      // Determine the file type based on the extension
      const fileExtension = path.extname(fullPath).toLowerCase();
      const contentType = getContentType(fileExtension);

      res.set('Content-Type', contentType);
      res.send(fileContent);
    } catch (error) {
      res.status(404).send({ error: 'File not found' });
    }
  });

  // Define a route for handling POST requests
  app.post(`/${folder}/:path*`, async (req, res) => {
    const { path: filePath } = req.params;
    const fullPath = path.join(`./files/${folder}`, filePath);
    const { content } = req.body;

    try {
      await fsPromises.writeFile(fullPath, content);
      res.send({ success: true, message: 'File saved successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
}

const QUALITY_OPTIONS = ['1080.ultra', '1080', '760', '480', '360', '240'];

function getHighestExistingQualityPathForTitle(title, chosenQuality) {
  if (chosenQuality) {
    return path.join(__dirname, 'files', 'movieFiles', `${title}.${chosenQuality}.mp4`)
  }

  for (let index = 0; index < QUALITY_OPTIONS.length; index++) {
    const videoPath = path.join(__dirname, 'files', 'movieFiles', `${title}.${QUALITY_OPTIONS[index]}.mp4`)
    if (fs.existsSync(videoPath)) {
      return videoPath
    }
  }
}

function writeDevelopmentIPAddress() {
  const IPJS = `
export const IP_ADDRESS = '${ip.address()}'
// GENERATED BY server.js at root
`

  if (!fs.existsSync('./src/ip.local.js')) {
    fs.writeFileSync('./src/ip.local.js', IPJS)
  }

  if (fs.readFileSync('./src/ip.local.js', 'utf-8') !== IPJS) {
    fs.writeFileSync('./src/ip.local.js', IPJS)
  }
}

