
import React, { useState } from 'react';
import axios from 'axios';
import './YoutubeSearch.css';

function YoutubeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  function getVideoIdFromUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  }

  async function getVideoInfo(apiKey, videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching video information:', error);
    }
  }

  // Example usage:
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const videoUrl = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
  const videoId = getVideoIdFromUrl(videoUrl);

  if (videoId) {
    getVideoInfo(apiKey, videoId).then(videoInfo => {
      console.log(videoInfo);
    });
  } else {
    console.error('Invalid YouTube URL');
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 10,
        // access_token: process.env.REACT_APP_GOO,
        access_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJhZjkwZTg3YmUxNDBjMjAwMzg4OThhNmVmYTExMjgzZGFiNjAzMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyODY1ODIwNDEzMTgtdjRwMTJoY3VicThiN3Bxa2Zndm9ncHJsazg0cThvdjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyODY1ODIwNDEzMTgtdjRwMTJoY3VicThiN3Bxa2Zndm9ncHJsazg0cThvdjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc1NzAyODY5Nzk1NTM3MDMxODEiLCJlbWFpbCI6InNhaWRiaWxvbDE4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3MTkzOTIxNjIsIm5hbWUiOiJCaWxsIFNCIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0p2Y0JKN0RRYW1MbW82b3BvUlFVNTZJYnZSamlXZGo1UVgyQ0h3SEVaUVdxU2o5dHp2PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkJpbGwiLCJmYW1pbHlfbmFtZSI6IlNCIiwiaWF0IjoxNzE5MzkyNDYyLCJleHAiOjE3MTkzOTYwNjIsImp0aSI6ImE1NzMxYzk1OTI1NGZhM2ViNjE1YmQzNDJkNDNhZmEyNmY0OTBiYTIifQ.jokCqGxtKBRHN5Flx4cxbulKvKDdhXoNgpjcUOOkGg7YCUSyhyv11EpzSjjTWcCgkHone3oglHpi43hxRpQl6dn1sllpCuPxSlueysW9cqMV493MqRSO8RBFS7gmwwXqke7_3ulWeOgf4wRpjSLioh-fPfMjtLOfcj-fYswMqYU4-81T6x0Yogn_CZcYOeI-meNi0Vfrks9IrL3UF0-9-B5FZnXdZoEQcYnMEGrTGH4ROmO5nH62cu7im_dnGHM_Gcq39A25TcQSAM_7Xv0lIkmGP9uDeS78URzv6GvoCea6CTLFXLEsOXZrzm7gvAJiJXuUE-cvqx2k9WqKwEA7vA",
        // key: process.env.REACT_APP_GOOGLE_API_KEY,
        q: searchTerm
      }
    });
    setVideos(response.data.items);
  };

  return (
    <div className="YoutubeSearch">
      <h1>YouTube Video Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for videos"
        />
        <button type="submit">Search</button>
      </form>
      <div className="video-list">
        {videos.map((video) => (
          <div key={video.id.videoId} className="video-item">
            <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noopener noreferrer">
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
              <p>{video.snippet.title}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default YoutubeSearch;
