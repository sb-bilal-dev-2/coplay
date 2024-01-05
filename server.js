const express = require('express');
const fs = require('fs');
const { readFile } = require('fs/promises');
const path = require('path');
const cors = require('cors')
const range = require('range-parser');
const bodyParser = require('body-parser');
const initCRUD = require('./serverCRUD').initCRUD;

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));
app.get('/hello_world', (req, res) => {
  res.type( 'text/plain' )

  res.send('Welcome!')
})
app.get('/movie', (req, res) => {
  const videoPath = path.join(__dirname, 'public', 'movies', `${req.query.name}/${req.query.quality || 'hd'}.mp4`)

  console.log(req.query.name)
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const rangeRequest = req.headers.range;

  if (rangeRequest) {
    const ranges = range(fileSize, rangeRequest);

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

app.get('/subtitles', async (req, res) => {
  try {
    const subtitlesVttPath = path.join(__dirname, 'public', 'movies', `${req.query.name}/${req.query.locale || 'en'}.vtt`)
    let subtitlesVtt;
    try {
      subtitlesVtt = await readFile(subtitlesVttPath);
    } catch (err) {
      res.status(404).send('')
    }
    res.send(subtitlesVtt)
  } catch (err) {
    res.status(500).send('')
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { createCRUDEndpoints } = initCRUD(app)
createCRUDEndpoints('words');
// createCRUDEndpoints('users');
// createCRUDEndpoints('favorites');
// createCRUDEndpoints('movies');
// createCRUDEndpoints('cramming');
// createCRUDEndpoints('words');
// createCRUDEndpoints('shorts');