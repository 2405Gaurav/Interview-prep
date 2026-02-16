import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { LOCAL_SERVER } from "@/constant.js"; // Ensure this path is correct
const LOCAL_SERVER = "http://localhost:8080"; // Temporary fallback
import { Toaster, toast } from "sonner";
import { mediapipeResponse } from "@/components/Camera/mediapipeResponse.js";
// import Interviewer from "@/assets/interviewer_1.mp4"; // Ensure asset exists
import Camera from "../Camera/Camera.jsx";
import { MicroPhone, Speaker, Ide } from ".."; // Ensure these exports exist
import ShinyButton from "@/components/magicui/shiny-button";

const Interview = () => {
    // 1. Server URL Definition
    const SERVER = useMemo(
        () => import.meta.env.VITE_SERVER || LOCAL_SERVER,
        []
    );

    // 2. State Management
    const videoRef = useRef(null);
    const [gettingGeminiResponse, setGettingGeminiResponse] = useState(false);
    const [geminiResponse, setGeminiResponse] = useState("Looking for a response...");
    
    // Status: waiting -> speaking -> listening -> analyzing
    const [interviewerStatus, setInterviewerStatus] = useState("waiting"); 
    const [speakerStatus, setSpeakerStatus] = useState("idle");

    const [userTranscript, setUserTranscript] = useState("");
    const [ideEnabled, setIdeEnabled] = useState(false);
    const [code, setCode] = useState("// Write your code here...");
    const [hasCodeChanged, setHasCodeChanged] = useState(false);

    const [cameraStatus, setCameraStatus] = useState(
        new mediapipeResponse(false, "Analysing your stream", "info")
    );

    const navigate = useNavigate();

    // 3. Main API Call Function
    // Added 'manualAnswer' parameter to allow direct submission
    const fetchGeminiResponse = async (manualAnswer = null) => {
        try {
            const sessionId = localStorage.getItem("_id");
            if (!sessionId) {
                toast.error("Session ID missing. Redirecting...");
                setTimeout(() => navigate("/details"), 2000);
                return;
            }

            setGettingGeminiResponse(true);
            setGeminiResponse("Thinking..."); // UX improvement

            // Construct Payload
            // Use manualAnswer if provided (for submit), otherwise use state (for first load/updates)
            let payload = manualAnswer !== null ? manualAnswer : userTranscript;

            // Append code if the user modified it
            if (hasCodeChanged && code) {
                payload += `\n\n[CODE_SUBMISSION]\n${code}`;
            }

            console.log("Sending Payload to Gemini:", payload);

            const formData = new FormData();
            formData.append("answer", payload);

            const response = await axios.post(
                `${SERVER}/api/v1/ask-to-gemini/${sessionId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("Gemini Response Data:", response.data);
            
            const data = response.data?.data;
            if (data) {
                // Update Question
                setGeminiResponse(data.question || "No question received.");
                
                // Handle Code from AI (if AI gives code)
                if (data.code) {
                    setCode(data.code);
                    setIdeEnabled(true);
                    setHasCodeChanged(false); // Reset change flag since it's new AI code
                }

                // Start Speaking
                setInterviewerStatus("speaking");
                setSpeakerStatus("speaking"); // Trigger Speaker component
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            const errMsg = error.response?.data?.message || "Failed to fetch response.";
            toast.error(errMsg);
            setGeminiResponse(`Error: ${errMsg}`);
            setInterviewerStatus("listening"); // Fallback so user can try again
        } finally {
            setGettingGeminiResponse(false);
        }
    };

    // 4. Lifecycle: Initial Load (Start Interview)
    useEffect(() => {
        // We pass "" explicitly to indicate starting the session
        // The backend should handle empty answer for "NotStarted" status
        fetchGeminiResponse(""); 
    }, []);

    // 5. Lifecycle: Handle Speaker Ending
    useEffect(() => {
        if (speakerStatus === "ended") {
            setInterviewerStatus("listening");
            // Video should pause via the other useEffect
        }
    }, [speakerStatus]);

    // 6. Lifecycle: Control Video Playback
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            if (interviewerStatus === "speaking") {
                video.play().catch(e => console.log("Video play error:", e));
                video.loop = true;
            } else {
                video.pause();
            }
        }
    }, [interviewerStatus]);

    // 7. Handlers
    const handleSubmit = () => {
        if (!userTranscript && !hasCodeChanged) {
            toast.warning("Please say something or write code before submitting.");
            return;
        }
        
        setInterviewerStatus("analyzing");
        // Pass the current transcript directly to avoid state race conditions
        fetchGeminiResponse(userTranscript);
        setUserTranscript(""); // Clear for next turn
    };

    const handleEndInterview = async () => {
        // Call backend to mark session as ended (optional but recommended)
        try {
            const sessionId = localStorage.getItem("_id");
            if(sessionId) await axios.post(`${SERVER}/api/v1/end/${sessionId}`);
        } catch (e) { console.error(e); }

        localStorage.removeItem("_id");
        navigate("/report", { state: { message: "Session Ended" } });
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-800 text-white px-4 pt-20 pb-12">
            <Toaster position="bottom-right" richColors />

            {/* Top Status Bar / Question Display */}
            <div className="w-full bg-gray-900 p-4 rounded-md mb-4 text-left text-lg font-medium border border-gray-700 min-h-[60px]">
                {gettingGeminiResponse ? (
                    <span className="animate-pulse text-yellow-400">AI is thinking...</span>
                ) : (
                    <p>{geminiResponse}</p>
                )}
            </div>

            <div className="flex w-full gap-4">
                
                {/* Left Column: Avatar & Camera */}
                <div className={`transition-all duration-500 flex flex-col gap-4 ${ideEnabled ? "w-1/3" : "w-full md:w-2/3 mx-auto"}`}>
                    
                    {/* Interviewer Avatar Video */}
                    <div className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video shadow-lg">
                        {/* 
                          Note: Ensure 'Interviewer' video source is valid. 
                          If missing, it will show black. 
                        */}
                        {/* <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            src={Interviewer} 
                            muted
                            playsInline
                        /> */}
                        
                        {/* Placeholder for missing video asset during dev */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                             <p className="text-gray-400">Interviewer Avatar</p>
                        </div>

                        {/* Speaker Component (Hidden logic, handles audio) */}
                        <div className="absolute bottom-2 right-2">
                            <Speaker
                                response={interviewerStatus === "speaking" ? geminiResponse : ""}
                                speakerStatus={speakerStatus}
                                setSpeakerStatus={setSpeakerStatus}
                            />
                        </div>
                    </div>

                    {/* User Camera & Mic */}
                    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center min-h-[300px]">
                        <Camera
                            cameraStatus={cameraStatus}
                            setCameraStatus={setCameraStatus}
                        />
                        
                        <div className="mt-4 w-full">
                            {interviewerStatus === "listening" ? (
                                <MicroPhone
                                    setUserTranscript={setUserTranscript}
                                    iconSize={40}
                                />
                            ) : (
                                <div className="text-center text-gray-400 py-2">
                                    {interviewerStatus === "speaking" ? "Listen to the interviewer..." : "Processing..."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: IDE (Conditional) */}
                {ideEnabled && (
                    <div className="w-2/3 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                        <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-mono text-gray-300">Code Editor</span>
                            <button 
                                onClick={() => setIdeEnabled(false)}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Close X
                            </button>
                        </div>
                        <div className="flex-grow">
                             <Ide
                                code={code}
                                setCode={setCode}
                                hasCodeChanged={hasCodeChanged}
                                setHasCodeChanged={setHasCodeChanged}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Transcript Preview (Debugging / User Confidence) */}
            <div className="w-full mt-4 p-3 bg-gray-700/50 rounded text-sm text-gray-300 min-h-[3rem]">
                <span className="font-bold text-gray-400 mr-2">Your Answer:</span>
                {userTranscript || "..."}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 mt-8">
                <div onClick={() => setIdeEnabled(!ideEnabled)}>
                    <ShinyButton
                        text={ideEnabled ? "Hide Code" : "Open Code Editor"}
                        className="bg-emerald-600"
                    />
                </div>

                <div onClick={handleSubmit}>
                    <ShinyButton
                        text={gettingGeminiResponse ? "Sending..." : "Submit Answer"}
                        className={`${gettingGeminiResponse ? "opacity-50 cursor-not-allowed" : ""} bg-blue-600`}
                    />
                </div>

                <div onClick={handleEndInterview}>
                    <ShinyButton
                        text="End Session"
                        className="bg-red-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default Interview;