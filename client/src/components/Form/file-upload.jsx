import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { LOCAL_SERVER } from "@/constant.js";

const FileUploadForm = ({
	details,
	setDetails,
	projectForms,
	setProjectForms,
}) => {
	const SERVER = import.meta.env.VITE_SERVER || LOCAL_SERVER;
	const [file, setFile] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef(null);

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.type === "application/pdf") {
			setFile(droppedFile);
		} else {
			toast.error("Please upload a PDF file only");
		}
	};

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile && selectedFile.type === "application/pdf") {
			setFile(selectedFile);
		} else {
			toast.error("Please upload a PDF file only");
		}
	};

	const handleUpload = async () => {
		if (!file) {
			toast.error("Please select a PDF file first");
			return;
		}

		setIsLoading(true);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await axios.post(
				`https://techprep-resume-analyzer.vercel.app/upload`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			toast.success("File uploaded successfully!");
			console.log("Upload response:", response.data.result);

			// Reset file after successful upload
			setFile(null);
			setStates(response.data.result);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error.response?.data?.message || "Failed to upload file"
			);
		} finally {
			setIsLoading(false);
		}
	};

    const setStates = (response) => {
        setDetails((prev) => ({
            ...prev,
			name: response.name || "",
			techStacks: response.techStacks || [],
			experience: response.experience || "",
		}));
        response.projects.map((project, index) => {
            setDetails(prev => ({
                ...prev,
                projects: [...prev.projects, {
                    id: index + 1,
                    title: project.title || "",
                    techStacks: project.techStacks || [],
                    description: project.description || "",
                }]
            }))
        });
    };

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="mx-[5%] md:mx-[25%] py-8">
			<div className="bg-[#111826] rounded-lg p-6">
				{/* Drag & Drop Area */}
				<div
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
						isDragging
							? "border-blue-500 bg-blue-500/10"
							: "border-gray-600 hover:border-gray-500"
					}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,application/pdf"
						onChange={handleFileChange}
						className="hidden"
					/>

					<div className="flex flex-col items-center justify-center">
						<svg
							className="w-16 h-16 text-gray-400 mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>

						<p className="text-white text-lg mb-2">
							Drag & drop your resume here
						</p>
						<p className="text-gray-400 text-sm mb-4">or</p>
						<button
							type="button"
							onClick={handleBrowseClick}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
						>
							Browse Files
						</button>

						{file && (
							<div className="mt-4 p-3 bg-[#1E2A47] rounded-md">
								<p className="text-white text-sm">
									Selected:{" "}
									<span className="font-semibold">
										{file.name}
									</span>
								</p>
								<p className="text-gray-400 text-xs mt-1">
									{(file.size / 1024 / 1024).toFixed(2)} MB
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Upload Button */}
				<button
					type="button"
					onClick={handleUpload}
					disabled={!file || isLoading}
					className={`w-full mt-6 py-3 rounded-md text-white font-semibold transition-all ${
						!file || isLoading
							? "bg-gray-600 cursor-not-allowed"
							: "bg-green-600 hover:bg-green-700"
					}`}
				>
					{isLoading ? (
						<div className="flex items-center justify-center">
							<svg
								className="animate-spin h-5 w-5 mr-3"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Uploading...
						</div>
					) : (
						"Parse PDF"
					)}
				</button>
			</div>

			{/* Separator with OR */}
			<div className="relative flex items-center py-6">
				<div className="flex-grow border-t border-gray-600"></div>
				<span className="flex-shrink mx-4 text-gray-400 font-semibold">
					OR
				</span>
				<div className="flex-grow border-t border-gray-600"></div>
			</div>
		</div>
	);
};

export default FileUploadForm;
