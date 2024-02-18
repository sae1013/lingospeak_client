"use client";
import React, { useState, useRef } from "react";
import { axios } from "../utils/AxiosInstances";
function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("이 브라우저는 접근이 지원되지 않습니다");
      return;
    }
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      if (mediaRecorderRef.current == null)
        throw Error("mediaRecorder객체가 없습니다.");

      mediaRecorderRef.current.start();
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3", //; codecs=opus
        });
        submitRecordedFile(audioBlob);
      };
      mediaRecorderRef.current!.onstop = () => {
        setIsRecording(false);
        audioChunksRef.current = []; // flush Audio
      };

      setIsRecording(true);
    } catch (error) {
      console.error("음성 녹음중 에러", error);
    }
  };

  const submitRecordedFile = async (audioBlob: Blob) => {
    try {
      const response = await handleRequest(audioBlob);
      setAudioUrl(response.data.data);
    } catch (error) {}
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // 레코드파일 서버에 전달
  const handleRequest = async (audioBlob: any) => {
    const formData = new FormData();
    formData.append("audioFile", audioBlob);
    const response = await axios.post(
      "http://127.0.0.1:5000/api/audiochat/completion",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  };

  return (
    <>
      <button
        className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        onClick={startRecording}
        disabled={isRecording}
      >
        녹음시작
      </button>
      <button
        className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        onClick={stopRecording}
        disabled={!isRecording}
      >
        녹음완료
      </button>

      {audioUrl && !isRecording && (
        <>
          <audio src={audioUrl} controls autoPlay></audio>
          {/* <button
            onClick={submitRecordedFile}
            className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            음성파일 서버로 전송
          </button> */}
        </>
      )}
    </>
  );
}

export default VoiceRecorder;
