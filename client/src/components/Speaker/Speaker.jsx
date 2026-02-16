import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Speaker = ({ response, speakerStatus, setSpeakerStatus }) => {
    // We use useRef instead of useState for the utterance to prevent 
    // the "garbage collection" bug in Chrome where audio stops early.
    const utteranceRef = useRef(null);

    useEffect(() => {
        if (!response) return;

        // 1. Cancel any current speaking to avoid overlaps
        window.speechSynthesis.cancel();

        // 2. Create the utterance configuration
        const utterance = new SpeechSynthesisUtterance(response);
        utteranceRef.current = utterance;

        // 3. Event Listeners
        utterance.onstart = () => {
            setSpeakerStatus("speaking");
        };

        utterance.onend = () => {
            setSpeakerStatus("ended");
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error", event);
            setSpeakerStatus("error");
        };

        // 4. Voice Loading Strategy
        const speak = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to select a natural sounding Google voice if available
            const preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("en")) || voices[0];
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        };

        // Handle async voice loading (common in Chrome)
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speak;
        } else {
            speak();
        }

        // Cleanup: Stop speaking if component unmounts or response changes
        return () => {
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [response, setSpeakerStatus]);

    return (
        <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-md text-white">
            <div className="flex items-center gap-2">
                {speakerStatus === "speaking" ? (
                    <span className="animate-pulse text-green-400">● Speaking...</span>
                ) : (
                    <span className="text-gray-400">Ready</span>
                )}
            </div>
        </div>
    );
};

// Define PropTypes to fix eslint validation errors
Speaker.propTypes = {
    response: PropTypes.string, // response is optional (can be null/empty)
    speakerStatus: PropTypes.string.isRequired,
    setSpeakerStatus: PropTypes.func.isRequired,
};

export default Speaker;