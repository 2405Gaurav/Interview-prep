import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Mic, MicOff, RotateCcw } from "lucide-react";

const MicroPhone = ({
  iconSize = 32,
  setUserTranscript = null,
  // setInterviewerStatus, // Removed because it was unused in your logic
}) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [browserSupport, setBrowserSupport] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Browser doesn't support speech recognition.");
      setBrowserSupport(false);
      return;
    }

    // Create recognition instance
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Set up event handlers
    recognition.onstart = () => {
      setListening(true);
      console.log("Listening started...");
    };

    recognition.onend = () => {
      setListening(false);
      console.log("Listening stopped...");
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscriptChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptChunk += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      if (finalTranscriptChunk) {
        // We use functional state update to ensure we don't lose previous text
        setTranscript(prev => prev + finalTranscriptChunk);
      }
      
      // Optional: If you want to show real-time interim results, 
      // you would handle interimTranscript here. 
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Sync with parent component
  useEffect(() => {
    if (setUserTranscript) {
      setUserTranscript(transcript);
    }
  }, [transcript, setUserTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    if (recognitionRef.current && listening) {
        // Optional: restart recognition to clear internal buffer
        recognitionRef.current.stop(); 
        // Note: onend will trigger, and you might need to manually restart if continuous listening is desired immediately
    }
  };

  if (!browserSupport) {
    return <span>Browser doesn&apos;t support speech recognition.</span>;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-2">
        <div className="flex gap-5 justify-center items-center">
          {/* Mic control */}
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
          
          {/* Reset control */}
          <div
            onClick={resetTranscript}
            className="px-2 pt-2 rounded-md bg-gray-900 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px] cursor-pointer"
          >
            <div className="py-1">
              <RotateCcw size={iconSize} color="#ffffff" />
            </div>
          </div>
        </div>

        {/* Display transcript only if parent isn't handling it */}
        {!setUserTranscript && (
          <p className="text-justify my-2 px-4 overflow-y-scroll capitalize text-white">
            {transcript}
          </p>
        )}
      </div>
    </div>
  );
};

// Define PropTypes
MicroPhone.propTypes = {
  iconSize: PropTypes.number,
  setUserTranscript: PropTypes.func,
  setInterviewerStatus: PropTypes.func, // Kept in propTypes as optional if you decide to use it later
};

export default MicroPhone;