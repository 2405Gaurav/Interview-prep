import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff, RotateCcw } from "lucide-react";

const MicroPhone = (props) => {
  const {
    iconSize = 32,
    setUserTranscript = null,
    setInterviewerStatus = null,
  } = props;

  // Get the necessary functions and state from the useSpeechRecognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Ensure microphone permissions are properly set and handling errors
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Browser doesn't support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (setUserTranscript) {
      setUserTranscript(transcript);
    }
  }, [transcript]);

  // Start the speech recognition with continuous listening mode
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
    console.log("Listening started...");
  };

  // Ensure the microphone support check is done
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-2">
        <div className="flex gap-5 justify-center items-center">
          {/* Mic control: toggle between listening and not listening */}
          <div className="p-2 bg-gray-900 rounded-md cursor-pointer m-2 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px]">
            {listening ? (
              <Mic
                size={iconSize}
                color="#ffffff"
                onClick={() => {
                  SpeechRecognition.stopListening();
                  console.log("Listening stopped...");
                }}
              />
            ) : (
              <MicOff
                size={iconSize}
                color="#ffffff"
                onClick={startListening}
              />
            )}
          </div>

          {/* Reset the transcript */}
          <div
            onClick={resetTranscript}
            className="px-2 pt-2 rounded-md bg-gray-900 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px] cursor-pointer"
          >
            <div className="py-1">
              <RotateCcw size={iconSize} color="#ffffff" />
            </div>
          </div>
        </div>

        {/* Display the transcript */}
        {!setUserTranscript && (
          <p className="text-justify my-2 px-4 overflow-y-scroll capitalize text-white">
            {transcript}
          </p>
        )}
      </div>
    </div>
  );
};

export default MicroPhone;
