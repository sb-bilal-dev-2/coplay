import React, { useRef, useState, useEffect } from 'react';
import { BASE_SERVER_URL } from '../api';

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

        // setTimeout(() => {
          saveCanvasImage(canvas, videoSrc + time)
        // }, 3000)
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
      <video crossorigin="anonymous" style={{ display: 'none' }} ref={videoRef} width="640" height="360" controls>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

        <div
          ref={previewDivRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '1px solid #ccc'
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
    throw error;
  }
}

export default VideoFrame;
