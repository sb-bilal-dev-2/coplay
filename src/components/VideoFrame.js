import React, { useRef, useState, useEffect } from 'react';

const VideoFrame = ({ time, videoSrc }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewDivRef = useRef(null);

  // Capture the current frame and draw it to the canvas
  const captureCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');
      video.currentTime = time;

      video.onseeked = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
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
      <video style={{ display: 'none' }} ref={videoRef} width="640" height="360" controls>
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
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} ></canvas>
        </div>
    </div>
  );

};

export default VideoFrame;
