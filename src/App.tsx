import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveViewRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [children, setChildren] = useState<HTMLElement[]>([]);

  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
    });
  }, []);

  const enableCam = async () => {
    if (!model || !videoRef.current) return;

    const constraints = { video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.current.srcObject = stream;
    //videoRef.current.addEventListener("loadeddata", predictWebcam);
  };

  const predictWebcam = async () => {
    if (!model || !videoRef.current || !liveViewRef.current) return;

    const predictions = await model.detect(videoRef.current);

    // Remove previous highlights
    children.forEach((child) => liveViewRef.current?.removeChild(child));
    setChildren([]);

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
        setChildren((prev) => [...prev, highlighter, p]);
      }
    });

    requestAnimationFrame(predictWebcam);
  };

  return (
    <div>
      <h1>Object Detection with TensorFlow.js</h1>
      <p>Enable the webcam and hold objects in front of it for detection.</p>
      <div ref={liveViewRef} className="camView">
        <button onClick={enableCam}>Enable Webcam</button>
        <video ref={videoRef} autoPlay muted width="640" height="480"></video>
      </div>
    </div>
  );
};

export default App;
