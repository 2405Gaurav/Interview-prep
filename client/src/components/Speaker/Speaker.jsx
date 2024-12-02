import React, { useEffect, useState } from "react";

const Speaker = ({ response, speakerStatus, setSpeakerStatus }) => {
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        if (response) {
            // Synthesize speech or handle audio file based on the response
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.onend = () => {
                setSpeakerStatus("ended");
            };

            setSpeakerStatus("speaking");
            speechSynthesis.speak(utterance);
        }

        return () => {
            // Cleanup any ongoing speech synthesis
            speechSynthesis.cancel();
        };
    }, [response, setSpeakerStatus]);

    return (
        <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-md text-white">
            <p>{speakerStatus === "speaking" ? "Speaking..." : "Ready"}</p>
        </div>
    );
};

export default Speaker;
