import React from "react";
import "./WebcamCapture.css";
import Webcam from "react-webcam";

const WebcamCapture = () => {
  return (
    <div className="WebcamCapture">
      <WebcamDeviceCapture />
    </div>
  );
};

const WebcamDeviceCapture = () => {
  const [devices, setDevices] = React.useState([]);

  const handleDevices = React.useCallback(
    (mediaDevices) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);
  console.log("device.label", devices);
  return (
    <>
      {devices.map((device, key) => (
        <div>
          <Webcam
            audio={false}
            videoConstraints={{ deviceId: device.deviceId }}
          />
          <p className="text-white">{device.label || `Device ${key + 1}`}</p>
        </div>
      ))}
    </>
  );
};

export default WebcamCapture;
