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
  const [isVideoReady, setIsVideoReady] = useState(false);

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

    setIsWebcamActive(false);
    setIsVideoReady(false);
    setPredictions([]);

    const constraints = {
      video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const handleVideoReady = () => {
    if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
      setIsVideoReady(true);
      setIsWebcamActive(true);
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const predictWebcam = async () => {
      if (!model || !videoRef.current || !isWebcamActive || !isVideoReady) return;

      try {
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          console.log("Video dimensions not ready yet");
          animationFrameId = requestAnimationFrame(predictWebcam);
          return;
        }

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
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(predictWebcam);
        }, 1000);
      }
    };

    if (isWebcamActive && isVideoReady) {
      predictWebcam();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [model, isWebcamActive, isVideoReady]);

  const Highlight: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
    const [x, y, width, height] = prediction.bbox;
    
    return (
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y - 22}px`, // 位置を少し上に調整
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#000',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {prediction.class} - {Math.round(prediction.score * 100)}%
        </div>
        <div
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: '2px solid #ff0000',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            zIndex: 5,
          }}
        />
      </div>
    );
  };

  return (
    <div className="container">
      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        {devices.length > 0 && (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 20,
            }}
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
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 20,
          }}
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          onLoadedData={handleVideoReady}
          onLoadedMetadata={handleVideoReady}
        />
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {isVideoReady && predictions.map((prediction, index) => (
            <Highlight key={`${prediction.class}-${index}`} prediction={prediction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;