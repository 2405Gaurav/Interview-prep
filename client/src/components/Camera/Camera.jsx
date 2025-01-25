import React, { useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
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
		// Function to load local script dynamically
		const loadScript = (src) => {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = src;
				script.onload = resolve;
				script.onerror = () =>
					reject(
						new Error(`Failed to load script: ${src}`)
					);
				document.body.appendChild(script);
			});
		};

		const loadScripts = async () => {
			try {
				// Load face_mesh.js
				await loadScript("/mediapipe/face_mesh/face_mesh.js");
				console.log("FaceMesh loaded:", window.FaceMesh);

				// Load camera_utils.js
				await loadScript(
					"/mediapipe/camera_utils/camera_utils.js"
				);
				console.log("Camera Utils loaded:", window.Camera);

				// Load drawing_utils.js
				await loadScript(
					"/mediapipe/drawing_utils/drawing_utils.js"
				);
				console.log(
					"Drawing Utils loaded:",
					window.drawConnectors
				);

				// Initialize FaceMesh
				const faceMesh = new window.FaceMesh({
					locateFile: (file) =>
						`/mediapipe/face_mesh/${file}`,
				});

				faceMesh.setOptions({
					minDetectionConfidence: 0.5,
					minTrackingConfidence: 0.5,
					runningMode: "video",
					refineLandmarks: true,
				});

				faceMesh.onResults(onResults);

				// Initialize Camera
				if (webcamRef.current && webcamRef.current.video) {
					const camera = new window.Camera(
						webcamRef.current.video,
						{
							onFrame: async () => {
								await faceMesh.send({
									image: webcamRef.current
										.video,
								});
							},
							width: 640,
							height: 360,
						}
					);
					camera.start();
				}
			} catch (err) {
				console.error(
					"Failed to initialize Mediapipe components:",
					err
				);
			}
		};

		loadScripts();

		// Cleanup scripts
		return () => {
			const scripts = [
				'script[src="/mediapipe/face_mesh/face_mesh.js"]',
				'script[src="/mediapipe/camera_utils/camera_utils.js"]',
				'script[src="/mediapipe/drawing_utils/drawing_utils.js"]',
			];
			scripts.forEach((selector) => {
				const script = document.querySelector(selector);
				if (script) document.body.removeChild(script);
			});
		};
	}, []);

	const onResults = (results) => {
		const videoWidth = webcamRef.current.video.videoWidth;
		const videoHeight = webcamRef.current.video.videoHeight;

		// Set canvas width
		canvasRef.current.width = videoWidth;
		canvasRef.current.height = videoHeight;

		const canvasElement = canvasRef.current;
		const canvasCtx = canvasElement.getContext("2d");
		canvasCtx.save();
		canvasCtx.clearRect(
			0,
			0,
			canvasElement.width,
			canvasElement.height
		);
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

				// Use local `drawConnectors` from drawing_utils.js
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_TESSELATION,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_RIGHT_EYE,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_RIGHT_EYEBROW,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_LEFT_EYE,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_LEFT_EYEBROW,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
				window.drawConnectors(
					canvasCtx,
					landmarks,
					window.FACEMESH_LIPS,
					{ color: "#Cd9e7b", lineWidth: 0.1 }
				);
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
				new mediapipeResponse(
					false,
					"No face detected!!",
					"error"
				)
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
