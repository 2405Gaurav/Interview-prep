import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { LOCAL_SERVER } from "@/constant.js";
import { Upload, FileText, Check } from "lucide-react";

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
			}));
		});
	};

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-3xl mx-auto px-6 pt-32 pb-12"
		>
			<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
				{/* Header */}
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold text-white mb-2">
						Quick Start with Resume
					</h2>
					<p className="text-sm text-gray-400">
						Upload your resume to auto-fill your details
					</p>
				</div>

				{/* Drag & Drop Area */}
				<div
					className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
						isDragging
							? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
							: "border-white/20 hover:border-indigo-500/50 bg-white/[0.02]"
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
						{/* Upload Icon */}
						<motion.div
							className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-6"
							animate={{
								scale: isDragging ? 1.1 : 1,
							}}
							transition={{ duration: 0.2 }}
						>
							<Upload className="w-8 h-8 text-indigo-400" />
						</motion.div>

						{/* Text */}
						<p className="text-white text-lg font-medium mb-2">
							Drag & drop your resume here
						</p>
						<p className="text-gray-400 text-sm mb-6">
							PDF files only, max 10MB
						</p>

						{/* Browse Button */}
						<button
							type="button"
							onClick={handleBrowseClick}
							className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300"
						>
							Browse Files
						</button>

						{/* Selected File Display */}
						{file && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-6 w-full max-w-md"
							>
								<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl">
									<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
										<FileText className="w-5 h-5 text-indigo-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-white text-sm font-medium truncate">
											{file.name}
										</p>
										<p className="text-gray-400 text-xs mt-0.5">
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
									<div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
										<Check className="w-4 h-4 text-green-400" />
									</div>
								</div>
							</motion.div>
						)}
					</div>
				</div>

				{/* Upload Button */}
				<motion.button
					type="button"
					onClick={handleUpload}
					disabled={!file || isLoading}
					whileHover={{ scale: file && !isLoading ? 1.02 : 1 }}
					whileTap={{ scale: file && !isLoading ? 0.98 : 1 }}
					className={`group relative w-full mt-6 inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-out rounded-xl overflow-hidden ${
						!file || isLoading
							? "bg-white/5 cursor-not-allowed opacity-50"
							: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50"
					}`}
				>
					<span className="relative z-10 flex items-center gap-2">
						{isLoading ? (
							<>
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Analyzing Resume...
							</>
						) : (
							<>
								<Upload className="w-5 h-5" />
								Parse Resume
							</>
						)}
					</span>
					{/* Animated gradient background */}
					{file && !isLoading && (
						<div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					)}
				</motion.button>

				{/* Help Text */}
				<p className="text-center text-xs text-gray-500 mt-4">
					Your resume will be analyzed to extract your name, skills, experience, and projects
				</p>
			</div>

			{/* Separator with OR */}
			<div className="relative flex items-center py-12">
				<div className="flex-grow border-t border-white/10"></div>
				<span className="flex-shrink mx-6 text-gray-400 text-sm font-medium uppercase tracking-wider">
					Or Enter Manually
				</span>
				<div className="flex-grow border-t border-white/10"></div>
			</div>
		</motion.div>
	);
};

FileUploadForm.propTypes = {
	details: PropTypes.object.isRequired,
	setDetails: PropTypes.func.isRequired,
	projectForms: PropTypes.array.isRequired,
	setProjectForms: PropTypes.func.isRequired,
};

export default FileUploadForm;