import React, { useRef, useEffect, useState, useMemo } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

interface Prediction {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const mediaSupported = useMemo(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
    });

    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const videoDevices = deviceList.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    });
  }, []);

  const enableCam = async () => {
    if (!model || !videoRef.current || !selectedDevice) return;

    const constraints = {
      video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setIsWebcamActive(true);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const predictWebcam = async () => {
      if (!model || !videoRef.current || !isWebcamActive) return;

      try {
        const newPredictions = await model.detect(videoRef.current);
        setPredictions(
          newPredictions
            .filter((pred) => pred.score > 0.66)
            .map((pred) => ({
              bbox: pred.bbox as [number, number, number, number],
              class: pred.class,
              score: pred.score,
            }))
        );
        animationFrameId = requestAnimationFrame(predictWebcam);
      } catch (error) {
        console.error("Error during prediction:", error);
      }
    };

    if (isWebcamActive) {
      predictWebcam();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [model, isWebcamActive]);

  const Highlight: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
    const [x, y, width, height] = prediction.bbox;
    
    return (
      <>
        <p
          style={{
            marginLeft: x,
            marginTop: y - 10,
            width,
            position: "absolute",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {prediction.class} - with {Math.round(prediction.score * 100)}% confidence
        </p>
        <div
          className="highlighter"
          style={{
            left: x,
            top: y,
            width,
            height,
            position: "absolute",
            border: "2px solid #ff0000",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            zIndex: 1,
          }}
        />
      </>
    );
  };

  return (
    <div className="container">
      <div className="camView" style={{ position: "relative" }}>
        {devices.length > 0 && (
          <select
            id="cameraSelect"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="camera-select"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={enableCam}
          disabled={!mediaSupported}
          className="enable-button"
        >
          Enable Webcam
        </button>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
          onLoadedData={() => setIsWebcamActive(true)}
        />
        
        {predictions.map((prediction, index) => (
          <Highlight key={`${prediction.class}-${index}`} prediction={prediction} />
        ))}
      </div>
    </div>
  );
};

export default App;