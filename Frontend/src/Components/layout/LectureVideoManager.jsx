import React, { useRef, useState, useEffect } from "react";

const LectureVideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const savedVideos = JSON.parse(localStorage.getItem("lectureVideos")) || [];
    setVideos(savedVideos);
  }, []);

  const saveVideo = (videoBlob) => {
    const videoUrl = URL.createObjectURL(videoBlob);
    const updatedVideos = [...videos, videoUrl];
    setVideos(updatedVideos);
    localStorage.setItem("lectureVideos", JSON.stringify(updatedVideos));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.includes("video")) {
      const fileUrl = URL.createObjectURL(file);
      const updatedVideos = [...videos, fileUrl];
      setVideos(updatedVideos);
      localStorage.setItem("lectureVideos", JSON.stringify(updatedVideos));
    }
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      recordedChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks.current, { type: "video/webm" });
        saveVideo(videoBlob);
        setStream(null);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Lecture Video Manager</h2>

      <input type="file" accept="video/*" onChange={handleFileUpload} />

      <div>
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop Recording
          </button>
        )}
      </div>

      {recording && (
        <video ref={videoRef} autoPlay muted className="w-64 border rounded" />
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Saved Videos</h3>
        <div className="grid grid-cols-2 gap-4">
          {videos.map((videoUrl, index) => (
            <video key={index} controls className="w-full border rounded">
              <source src={videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureVideoManager;
