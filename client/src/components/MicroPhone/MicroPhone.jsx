import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, RotateCcw } from "lucide-react";

const MicroPhone = (props) => {
  const {
    iconSize = 32,
    setUserTranscript = null,
    setInterviewerStatus = null,
  } = props;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [browserSupport, setBrowserSupport] = useState(true);
  
  const recognitionRef = useRef(null);

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check browser support
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.warn("Browser doesn't support speech recognition.");
      setBrowserSupport(false);
      return;
    }

    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    // Set up event handlers
    recognitionRef.current.onstart = () => {
      setListening(true);
      console.log("Listening started...");
    };

    recognitionRef.current.onend = () => {
      setListening(false);
      console.log("Listening stopped...");
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update parent component with transcript when it changes
  useEffect(() => {
    if (setUserTranscript) {
      setUserTranscript(transcript);
    }
  }, [transcript, setUserTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Handle the case where recognition is already started
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  if (!browserSupport) {
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
                onClick={stopListening}
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