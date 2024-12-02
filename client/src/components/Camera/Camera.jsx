import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { detectUnfairMeans } from "./mediapipe.js";
import { mediapipeResponse } from "./mediapipeResponse.js";
import throttle from "lodash.throttle";
import { toast } from "sonner";

const Camera = ({ cameraStatus, setCameraStatus, marginY = 50 }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    let camera = null;

    // const [cameraStatus, setCameraStatus] = useState(new mediapipeResponse(false, "Analysing your stream", "info"));

    const handleCameraStatus = useCallback(
        throttle((status) => {
            setCameraStatus((prevStatus) => {
                // Only update the state if the new status is different
                if (!prevStatus.isEqual(status)) {
                    return status;
                }
                return prevStatus;
            });
        }, 1000),
        []
    );

    useEffect(() => {
        toast[cameraStatus.label](cameraStatus.message, {
            action: {
                label: "Dismiss",
                onClick: () => {
                    // Handle the click
                },
            },
            style: {
                border: "2px solid #708090",
                background: "#6082B6",
            },
        });
    }, [cameraStatus]);

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });

        faceMesh.setOptions({
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            runningMode: "video",
            refineLandmarks: true,
        });

        faceMesh.onResults(onResults);

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    await faceMesh.send({ image: webcamRef.current.video });
                },
                width: 640,
                height: 360,
            });
            camera.start();
        }
    }, []);

    const onResults = (results) => {
        // const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(
            results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height
        );
        if (results.multiFaceLandmarks?.length === 1) {
            for (const landmarks of results.multiFaceLandmarks) {
                const result = detectUnfairMeans(landmarks);
                handleCameraStatus(result);
                drawConnectors(
                    canvasCtx,
                    landmarks,
                    Facemesh.FACEMESH_TESSELATION,
                    {
                        color: "#Cd9e7b",
                        lineWidth: 0.1,
                    }
                );
                drawConnectors(
                    canvasCtx,
                    landmarks,
                    Facemesh.FACEMESH_RIGHT_EYE,
                    {
                        color: "#Cd9e7b",
                        lineWidth: 0.1,
                    }
                );
                drawConnectors(
                    canvasCtx,
                    landmarks,
                    Facemesh.FACEMESH_RIGHT_EYEBROW,
                    {
                        color: "#Cd9e7b",
                        lineWidth: 0.1,
                    }
                );
                drawConnectors(
                    canvasCtx,
                    landmarks,
                    Facemesh.FACEMESH_LEFT_EYE,
                    {
                        color: "#Cd9e7b",
                        lineWidth: 0.1,
                    }
                );
                drawConnectors(
                    canvasCtx,
                    landmarks,
                    Facemesh.FACEMESH_LEFT_EYEBROW,
                    {
                        color: "#Cd9e7b",
                        lineWidth: 0.1,
                    }
                );
                drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
                    color: "#Cd9e7b",
                    lineWidth: 0.1,
                });
            }
        } else if (results.multiFaceLandmarks?.length > 1) {
            console.log("Multiple faces detected!!");
            handleCameraStatus(
                new mediapipeResponse(
                    false,
                    "Multiple faces detected!!",
                    "error"
                )
            );
        } else {
            console.log("No face detected!!");
            handleCameraStatus(
                new mediapipeResponse(false, "No face detected!!", "error")
            );
        }
        canvasCtx.restore();
    };

    return (
        <div>
            <Webcam
                audio={true}
                ref={webcamRef}
                style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: marginY,
                    marginBottom: marginY,
                    borderRadius: 20,
                    width: "100%",
                    display: "none",
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: marginY,
                    marginBottom: marginY,
                    borderRadius: 20,
                    width: "100%",
                    display: "block",
                    outline: `2px solid ${
                        cameraStatus.allGood ? "#008000" : "#ff0000"
                    } `,
                    transition: "outline 0.5s ease",
                    outlineOffset: "2px",
                }}
            />
        </div>
    );
};

export default Camera;
