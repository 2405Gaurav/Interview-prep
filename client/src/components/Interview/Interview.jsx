import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LOCAL_SERVER } from "@/constant.js";
import { Toaster } from "sonner";
import { mediapipeResponse } from "@/components/Camera/mediapipeResponse.js";
import Interviewer from "@/assets/interviewer_1.mp4";
import Camera from "../Camera/Camera.jsx";
import { MicroPhone, Speaker, Ide } from "..";
import ShinyButton from "@/components/magicui/shiny-button";

const Interview = () => {
    const SERVER = useMemo(
        () => import.meta.env.VITE_SERVER || LOCAL_SERVER,
        []
    );
    const videoRef = useRef(null);
    const [gettingGeminiResponse, setGettingGeminiResponse] = useState(false);
    const [geminiResponse, setGeminiResponse] = useState(
        "Looking for a response..."
    );
    const [cameraStatus, setCameraStatus] = useState(
        new mediapipeResponse(false, "Analysing your stream", "info")
    );
    const [interviewerStatus, setInterviewerStatus] = useState("waiting");
    const [speakerStatus, setSpeakerStatus] = useState("");
    const [userTranscript, setUserTranscript] = useState("");
    const [ideEnabled, setIdeEnabled] = useState(false);
    const [code, setCode] = useState("");
    const [hasCodeChanged, setHasCodeChanged] = useState(false);

    const navigate = useNavigate();

    const fetchGeminiResponse = async () => {
        // if (hasFetchedRef.current) return;
        // hasFetchedRef.current = true;

        try {
            const sessionId = localStorage.getItem("_id");
            if (!sessionId) {
                navigate("/details", {
                    state: {
                        message:
                            "Please go through all the required processes before starting an interview session",
                    },
                });
                return;
            }
            setGettingGeminiResponse(true);
            setGeminiResponse("Looking for a response...");
            console.log("User Transcript: ", userTranscript);
            let payload = "";
            if (userTranscript !== "") {
                payload = userTranscript;
            }
            if (hasCodeChanged) {
                payload += "\n" + code;
            }
            console.log("Payload: ", payload);
            const formData = new FormData();
            formData.append("answer", payload);

            const response = await axios.post(
                `${SERVER}/api/v1/ask-to-gemini/${sessionId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response.data?.data);
            const msg = response.data?.data || "Error fetching Gemini Response";
            setGeminiResponse(msg.question);
            if (msg.code) {
                setCode(msg.code);
                setIdeEnabled(true);
            }
            setInterviewerStatus("speaking");
        }catch (error) {
    setGeminiResponse(
        error?.response?.data?.message || 
        error.message || 
        "Error fetching Gemini Response"
    );
}
        finally {
            setGettingGeminiResponse(false);
        }
    };

    const endInterview = async () => {
        localStorage.removeItem("_id");
        navigate("/report", {
            state: {
                message:
                    "Interview session ended. You can now view your report",
            },
        });
        return;
    };

    useEffect(() => {
        fetchGeminiResponse();
    }, []);

    useEffect(() => {
        if (speakerStatus === "ended") {
            setInterviewerStatus("listening");
        }
    }, [speakerStatus]);

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            if (interviewerStatus === "speaking") {
                video.play();
            } else {
                video.pause();
            }
        }
    }, [interviewerStatus]);

    const handleSubmit = async () => {
        setInterviewerStatus("analyzing");
        await fetchGeminiResponse();
        setUserTranscript("");
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-800 text-white px-4 pt-20 pb-12">
            {/* API Response Section */}
            <div className="w-full max-h-24 overflow-y-auto bg-gray-900 p-4 rounded-md mb-4 text-left text-base">
                {!gettingGeminiResponse &&
                geminiResponse !== "Looking for a response..." ? (
                    <p>{geminiResponse}</p>
                ) : (
                    <p>Fetching Gemini Response...</p>
                )}
                <Toaster position="bottom-right" richColors />
            </div>

            <div className="flex min-w-full">
                {/* Video and Camera Section */}
                <div
                    className={`${
                        ideEnabled ? "flex-col w-1/4 mr-4" : "flex w-full"
                    } justify-center items-center gap-4 flex-grow transition-all duration-500`}
                >
                    {/* Video Section */}
                    <div
                        className={`flex-col items-center justify-center ${
                            ideEnabled ? "w-full py-4" : "w-1/2 py-8 h-[70vh]"
                        } bg-gray-700 rounded-lg px-4 `}
                    >
                        {interviewerStatus !== "waiting" ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full rounded-md"
                                    src={Interviewer}
                                    preload="metadata"
                                    muted
                                />
                                {interviewerStatus === "speaking" &&
                                    geminiResponse && (
                                        <Speaker
                                            key={geminiResponse}
                                            response={geminiResponse}
                                            speakerStatus={speakerStatus}
                                            setSpeakerStatus={setSpeakerStatus}
                                        />
                                    )}
                            </>
                        ) : (
                            <div
                                role="status"
                                className="flex items-center justify-center h-40"
                            >
                                <span>Loading...</span>
                            </div>
                        )}
                    </div>

                    {/* Camera Section */}
                    <div
                        className={`flex flex-col items-center justify-center ${
                            ideEnabled ? "w-full mt-4" : "max-w-1/2 h-[70vh]"
                        } bg-gray-700 rounded-lg px-4 py-0 flex-grow `}
                    >
                        <Camera
                            cameraStatus={cameraStatus}
                            setCameraStatus={setCameraStatus}
                            marginY={16}
                        />
                        {/* Microphone Section */}
                        {interviewerStatus === "listening" && (
                            <div className="w-full flex justify-around">
                                <MicroPhone
                                    setUserTranscript={setUserTranscript}
                                    setInterviewerStatus={setInterviewerStatus}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {ideEnabled && (
                    <div className="w-3/4 bg-gray-700 rounded-lg p-4">
                        <Ide
                            code={code}
                            setCode={setCode}
                            hasCodeChanged={hasCodeChanged}
                            setHasCodeChanged={setHasCodeChanged}
                        />
                    </div>
                )}
            </div>
            <div className="flex w-full flex-wrap mt-4 justify-around">
                <div onClick={() => setIdeEnabled(!ideEnabled)}>
                    <ShinyButton
                        text={`${ideEnabled ? "Close IDE" : "Launch IDE"}`}
                        className="text-white bg-green-700 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px]"
                    />
                </div>
                <div onClick={() => handleSubmit()}>
                    <ShinyButton
                        text="Submit Response"
                        className="text-white bg-blue-700 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px]"
                    />
                </div>
                <div onClick={() => endInterview()}>
                    <ShinyButton
                        text="End Interview"
                        className="text-white bg-violet-700 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px]"
                    />
                </div>
            </div>
            {/* User Transcript Section */}
            {userTranscript && (
                <div className="w-full max-h-24 overflow-y-auto bg-gray-900 p-4 rounded-md mt-4">
                    {userTranscript}
                </div>
            )}
        </div>
    );
};

export default Interview;
