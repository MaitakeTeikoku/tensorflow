import React, { useRef, useEffect, useState, useMemo } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveViewRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const mediaSupported = useMemo(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  useEffect(() => {
    // Load the COCO-SSD model
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
    });

    // Get available cameras
    if (mediaSupported) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      });
    }
  }, [mediaSupported]);

  const enableCam = async () => {
    if (!model || !videoRef.current || !selectedCamera) return;

    const constraints: MediaStreamConstraints = {
      video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const predictWebcam = async () => {
    if (!model || !videoRef.current || !liveViewRef.current) return;

    // Clear previous highlights
    while (liveViewRef.current.firstChild) {
      liveViewRef.current.removeChild(liveViewRef.current.firstChild);
    }

    const predictions = await model.detect(videoRef.current);

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

        liveViewRef.current?.appendChild(highlighter);
        liveViewRef.current?.appendChild(p);
      }
    });

    // Request next frame
    requestAnimationFrame(predictWebcam);
  };

  return (
    <div>
      <div ref={liveViewRef} className="camView">
        {cameras.length > 0 && (
          <select
            value={selectedCamera || ""}
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId}`}
              </option>
            ))}
          </select>
        )}
        <button onClick={enableCam} disabled={!mediaSupported || !selectedCamera}>
          Enable Webcam
        </button>
        <video ref={videoRef} autoPlay muted width="640" height="480"></video>
      </div>
    </div>
  );
};

export default App;
