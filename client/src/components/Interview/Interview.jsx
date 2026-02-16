import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { mediapipeResponse } from "@/components/Camera/mediapipeResponse.js";
import Camera from "../Camera/Camera.jsx";
import { MicroPhone, Speaker, Ide } from "..";
import { 
  Code2, 
  Mic, 
  VideoIcon, 
  Terminal,
  Sparkles,
  AlertCircle
} from "lucide-react";

const LOCAL_SERVER = "http://localhost:8080";

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
    const fetchGeminiResponse = async (manualAnswer = null) => {
        try {
            const sessionId = localStorage.getItem("_id");
            if (!sessionId) {
                toast.error("Session ID missing. Redirecting...");
                setTimeout(() => navigate("/details"), 2000);
                return;
            }

            setGettingGeminiResponse(true);
            setGeminiResponse("Thinking...");

            let payload = manualAnswer !== null ? manualAnswer : userTranscript;

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
                setGeminiResponse(data.question || "No question received.");
                
                if (data.code) {
                    setCode(data.code);
                    setIdeEnabled(true);
                    setHasCodeChanged(false);
                }

                setInterviewerStatus("speaking");
                setSpeakerStatus("speaking");
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            const errMsg = error.response?.data?.message || "Failed to fetch response.";
            toast.error(errMsg);
            setGeminiResponse(`Error: ${errMsg}`);
            setInterviewerStatus("listening");
        } finally {
            setGettingGeminiResponse(false);
        }
    };

    // 4. Lifecycle: Initial Load
    useEffect(() => {
        fetchGeminiResponse(""); 
    }, []);

    // 5. Lifecycle: Handle Speaker Ending
    useEffect(() => {
        if (speakerStatus === "ended") {
            setInterviewerStatus("listening");
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
        fetchGeminiResponse(userTranscript);
        setUserTranscript("");
    };

    const handleEndInterview = async () => {
        try {
            const sessionId = localStorage.getItem("_id");
            if(sessionId) await axios.post(`${SERVER}/api/v1/end/${sessionId}`);
        } catch (e) { console.error(e); }

        localStorage.removeItem("_id");
        navigate("/report", { state: { message: "Session Ended" } });
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <Toaster position="bottom-right" richColors />

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 pt-8 pb-12">
                
                {/* Top Status Bar - Question Display */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl mb-6 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gray-400">
                            Current Question
                        </span>
                    </div>
                    
                    {gettingGeminiResponse ? (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-lg text-indigo-300 font-light">AI is thinking...</span>
                        </div>
                    ) : (
                        <p className="text-lg md:text-xl font-light leading-relaxed text-white/90">{geminiResponse}</p>
                    )}
                </motion.div>

                <div className="flex flex-col lg:flex-row w-full gap-6">
                    
                    {/* Left Column: Avatar & Camera */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`transition-all duration-500 flex flex-col gap-6 ${ideEnabled ? "lg:w-1/3" : "w-full lg:w-2/3 mx-auto"}`}
                    >
                        
                        {/* Interviewer Avatar Video */}
                        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden aspect-video shadow-2xl group">
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
                                <VideoIcon className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-medium tracking-wider uppercase text-gray-300">
                                    Interviewer
                                </span>
                            </div>

                            {/* Video Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/30 to-purple-950/30">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <VideoIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-light">Interviewer Avatar</p>
                                </div>
                            </div>

                            {/* Speaker Component */}
                            <div className="absolute bottom-4 right-4 z-10">
                                <Speaker
                                    response={interviewerStatus === "speaking" ? geminiResponse : ""}
                                    speakerStatus={speakerStatus}
                                    setSpeakerStatus={setSpeakerStatus}
                                />
                            </div>

                            {/* Status Indicator */}
                            <div className="absolute bottom-4 left-4 z-10">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
                                    <div className={`w-2 h-2 rounded-full ${
                                        interviewerStatus === "speaking" ? "bg-green-500 animate-pulse" : 
                                        interviewerStatus === "listening" ? "bg-yellow-500" : 
                                        "bg-gray-500"
                                    }`} />
                                    <span className="text-[10px] font-medium text-gray-300 capitalize">
                                        {interviewerStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Camera & Mic */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center min-h-[300px]">
                            <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <Mic className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-medium tracking-wider uppercase text-gray-300">
                                    Your Camera
                                </span>
                            </div>

                            <Camera
                                cameraStatus={cameraStatus}
                                setCameraStatus={setCameraStatus}
                            />
                            
                            <div className="mt-6 w-full">
                                {interviewerStatus === "listening" ? (
                                    <MicroPhone
                                        setUserTranscript={setUserTranscript}
                                        iconSize={40}
                                    />
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-400 font-light">
                                            {interviewerStatus === "speaking" ? "Listen to the interviewer..." : "Processing..."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: IDE (Conditional) */}
                    {ideEnabled && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:w-2/3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium tracking-wider text-gray-300">CODE EDITOR</span>
                                </div>
                                <button 
                                    onClick={() => setIdeEnabled(false)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-300"
                                >
                                    Close ✕
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
                        </motion.div>
                    )}
                </div>

                {/* Transcript Preview */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-gray-400">
                            Your Answer
                        </span>
                    </div>
                    <p className="text-base font-light text-white/80 min-h-[2rem]">
                        {userTranscript || <span className="text-gray-500">Waiting for input...</span>}
                    </p>
                </motion.div>

                {/* Control Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-4 mt-8"
                >
                    <button 
                        onClick={() => setIdeEnabled(!ideEnabled)}
                        className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out rounded-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg hover:shadow-emerald-500/50 hover:scale-105 border border-white/10"
                    >
                        <Code2 className="w-4 h-4 mr-2" />
                        {ideEnabled ? "Hide Code" : "Open Code Editor"}
                    </button>

                    <button 
                        onClick={handleSubmit}
                        disabled={gettingGeminiResponse}
                        className={`group relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 border border-white/10 ${
                            gettingGeminiResponse ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {gettingGeminiResponse ? "Sending..." : "Submit Answer"}
                    </button>

                    <button 
                        onClick={handleEndInterview}
                        className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-lg hover:shadow-red-500/50 hover:scale-105 border border-white/10"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        End Session
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Interview;