import { useState } from "react";
import { Link } from "react-router-dom";
import Camera from "./Camera.jsx";
import { MicroPhone } from "../index.js";
import { mediapipeResponse } from "./mediapipeResponse.js";
import ShinyButton from "@/components/magicui/shiny-button";
import { Toaster } from "sonner";

const CameraContainer = () => {
	const [cameraStatus, setCameraStatus] = useState(
		new mediapipeResponse(false, "Analysing your stream", "info")
	);
	return (
		<div className="flex-row pt-16 h-screen">
			<div className="flex flex-row items-center justify-center min-h-[4/5] w-full">
				<div className="w-[30%] px-12 h-full flex-grow flex items-center justify-center">
					<p className="font-normal leading-relaxed mx-auto text-slate-200 lg:text-lg text-base max-w-3xl">
						Please check your camera and make sure it is
						working Properly. You&apos;ll be proctored by an
						AI model.
					</p>
				</div>
				<div className="w-[30%] px-12 h-full flex-grow flex items-center justify-center">
					<Camera
						cameraStatus={cameraStatus}
						setCameraStatus={setCameraStatus}
					/>
				</div>
				<div className="w-[30%] px-12 h-full flex-grow flex items-center justify-center">
					{cameraStatus.allGood && (
						<MicroPhone iconSize={64} />
					)}
				</div>
				<Toaster position="bottom-right" richColors />
			</div>

			{cameraStatus.allGood ? (
				<Link to="/interview">
					<div
						className={`mx-auto my-2 flex items-center justify-center `}
					>
						<ShinyButton
							text="Move Ahead"
							className="text-white bg-blue-700 hover:shadow-[rgba(7,_65,_210,_0.5)_0px_9px_30px]"
						/>
					</div>
				</Link>
			) : (
				<p className="text-center text-slate-200 text-base mx-auto my-2 flex items-center justify-center ">
					Loading mediapipe may take some time. Please wait. Recommended Browser: Chrome / Edge
				</p>
			)}
		</div>
	);
};

export default CameraContainer;
