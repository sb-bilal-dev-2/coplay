import React, { useRef, useState, useEffect } from 'react';
import api, { BASE_SERVER_URL } from '../api';

const VideoFrameVideo = ({ time, videoSrc }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewDivRef = useRef(null);

  // Capture the current frame and draw it to the canvas
  const captureCurrentFrame = () => {
    const video = videoRef.current;
    video.crossOrigin = "anonymous";

    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');
      video.currentTime = time;

      video.onseeked = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

        setTimeout(() => {
          try {
            saveCanvasImage(canvas, videoSrc + time)
          } catch {

          }
        }, 10)
      };
    }
  };

  // Handle hover over progress slider
  // const handleSliderInput = (event) => {
  //   const hoverTime = (event.target.value / 100) * videoRef.current.duration;
  //   captureCurrentFrame(hoverTime);
  // };

  // Hide preview when mouse leaves slider

  const captureSelectedFrame = () => captureCurrentFrame(time)

  useEffect(() => {
    const video = videoRef.current;
    video.addEventListener('loadeddata', captureSelectedFrame);

    return () => {
      video.removeEventListener('loadeddata', captureSelectedFrame);
    };
  }, []);

  return (
    <div>
      <video
        crossorigin="anonymous"
        style={{ display: 'none' }}
        ref={videoRef}
        width="640"
        height="360"
        muted
        controls
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

        <div
          ref={previewDivRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          <canvas crossorigin="anonymous" ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} ></canvas>
        </div>
    </div>
  );
};

const VideoFrame = ({ time, videoSrc, title }) => {
  const [error, set_error] = useState(null);
  const savedImageUrl = `${BASE_SERVER_URL}/images/${title}${time}.jpg`
  if (!videoSrc) {
    videoSrc = BASE_SERVER_URL + "/movie?name=" + title
  }

  return !error ? 
    <img
      src={savedImageUrl}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={(error) => {
        set_error(error)
      }}
      />
    : 
    <VideoFrameVideo time={time} videoSrc={videoSrc}  />
}

export const VideoFrameForWord = ({ word }) => {
  const [firstOccurance, set_firstOccurance] = useState(null)
 
  async function request_wordOccurances(the_word) {
    try {
      const wordData = (await api().get(`/occurances_v2?lemma=${the_word}&limit=1`));
      
      console.log("word", word);
      console.log("wordData", wordData);
      if (wordData?.length) {
        if (wordData && wordData[0]) {
          set_firstOccurance(wordData[0])
        }    
      }
      
    } catch (err) {
      console.log("err", err);
    }
  };
  
  useEffect(() => {
    request_wordOccurances(word)
  }, [word])
  console.log('firstOccurance',firstOccurance)
  if (firstOccurance) {
    return <VideoFrame
      videoSrc={`${BASE_SERVER_URL}/movie?name=${firstOccurance.mediaTitle}`}
      title={firstOccurance.mediaTitle}
      time={firstOccurance.startTime / 1000}
    />
  }
}

async function saveCanvasImage(canvas, fileName) {
  try {
    // Convert canvas to base64 string, removing the data URL prefix
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Send the image data to the server
    const response = await fetch(`${BASE_SERVER_URL}/movieFiles/${fileName.split('/movie?name=')[1]}.jpg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: base64Image
      })
    });

    console.log('response img', response)
    const result = await response.json();
    if (result.success) {
      console.log('Image saved successfully');
      return true;
    } else {
      throw new Error(result.error || 'Failed to save image');
    }
  } catch (error) {
    console.error('Error saving image:', error);
    // throw error;
  }
}

export default VideoFrame;
