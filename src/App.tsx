import React, { useRef, useEffect, useState, useMemo } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveViewRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const mediaSupported = useMemo(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
    });

    // Get available devices and filter out video devices (cameras)
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const videoDevices = deviceList.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId); // Default to the first camera
      }
    });
  }, []);

  const enableCam = async () => {
    if (!model || !videoRef.current || !selectedDevice) return;

    const constraints = {
      video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.current.srcObject = stream;
    videoRef.current.addEventListener("loadeddata", predictWebcam);
  };

  const predictWebcam = async () => {
    if (!model || !videoRef.current || !liveViewRef.current) return;
  
    const predictions = await model.detect(videoRef.current);
  
    // Remove previous highlights before drawing new ones
    const liveView = liveViewRef.current;
    while (liveView.firstChild) {
      liveView.removeChild(liveView.firstChild);
    }
  
    // Draw new predictions
    predictions.forEach((prediction) => {
      if (prediction.score > 0.66) {
        const p = document.createElement("p");
        p.innerText = `${prediction.class} - with ${Math.round(
          prediction.score * 100
        )}% confidence.`;
        p.style.marginLeft = `${prediction.bbox[0]}px`;
        p.style.marginTop = `${prediction.bbox[1] - 10}px`;
        p.style.width = `${prediction.bbox[2]}px`;
  
        const highlighter = document.createElement("div");
        highlighter.className = "highlighter";
        highlighter.style.left = `${prediction.bbox[0]}px`;
        highlighter.style.top = `${prediction.bbox[1]}px`;
        highlighter.style.width = `${prediction.bbox[2]}px`;
        highlighter.style.height = `${prediction.bbox[3]}px`;
  
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
      }
    });
  
    requestAnimationFrame(predictWebcam);
  };
  

  return (
    <div>
      <div ref={liveViewRef} className="camView">
        {devices.length > 0 && (
          <select
            id="cameraSelect"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        )}
        <button onClick={enableCam} disabled={!mediaSupported}>
          Enable Webcam
        </button>

        <video ref={videoRef} autoPlay muted width="640" height="480"></video>
      </div>
    </div>
  );
};

export default App;
