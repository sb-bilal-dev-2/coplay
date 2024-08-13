const express = require('express');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const srtParser = require('subtitle');
require('dotenv').config();

const app = express();

const CLIENT_ID = '286582041318-sp4i63fq3jsulvnkikrgrpk7145t8dmo.apps.googleusercontent.com' || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = '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' || process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://coplay.live:4545/oauth2callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set up the YouTube API client
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl']
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Authentication successful! You can now use the API.');
});

app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Search for videos
    const searchResponse = await youtube.search.list({
      part: 'id,snippet',
      q: query,
      type: 'video',
      videoCaption: 'closedCaption',
      maxResults: 5
    });

    const results = [];

    for (const item of searchResponse.data.items) {
      const videoId = item.id.videoId;

      // Get caption tracks for the video
      const captionResponse = await youtube.captions.list({
        part: 'snippet',
        videoId: videoId
      });

      const captionTrack = captionResponse.data.items.find(
        track => track.snippet.language === 'en'
      );

      if (captionTrack) {
        // Download the actual subtitle content
        const subtitleResponse = await youtube.captions.download({
          id: captionTrack.id,
          tfmt: 'srt'
        });

        // Parse the subtitle content
        const parsedSubtitles = srtParser.parse(subtitleResponse.data);

        // Search for the query in subtitles
        const matches = parsedSubtitles.filter(sub => 
          sub.text.toLowerCase().includes(query.toLowerCase())
        );

        results.push({
          videoId,
          title: item.snippet.title,
          matches: matches.map(match => ({
            text: match.text,
            start: match.start,
            end: match.end
          }))
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

const PORT = process.env.PORT || 4545;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

