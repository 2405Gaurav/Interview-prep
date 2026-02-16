import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";

const FileUploadForm = ({ setDetails }) => {
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

			toast.success("Resume parsed successfully!");
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
			className="max-w-2xl mx-auto px-6 pt-32 pb-8"
		>
			{/* Drag & Drop Area */}
			<div
				className={`relative border border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
					isDragging
						? "border-indigo-500/50 bg-indigo-500/5"
						: "border-white/10 hover:border-white/20 bg-white/[0.02]"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleBrowseClick}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept=".pdf,application/pdf"
					onChange={handleFileChange}
					className="hidden"
				/>

				<div className="flex flex-col items-center">
					{/* Icon */}
					<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
						<Upload className="w-5 h-5 text-gray-400" />
					</div>

					{/* Text */}
					{file ? (
						<div className="flex items-center gap-3">
							<FileText className="w-5 h-5 text-indigo-400" />
							<div className="text-left">
								<p className="text-white text-sm font-medium">
									{file.name}
								</p>
								<p className="text-gray-500 text-xs">
									{(file.size / 1024 / 1024).toFixed(2)} MB
								</p>
							</div>
						</div>
					) : (
						<>
							<p className="text-white text-base mb-1">
								Upload Resume (PDF)
							</p>
							<p className="text-gray-500 text-xs">
								Drag & drop or click to browse
							</p>
						</>
					)}
				</div>
			</div>

			{/* Upload Button */}
			{file && (
				<motion.button
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					type="button"
					onClick={handleUpload}
					disabled={isLoading}
					className={`w-full mt-4 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 rounded-lg ${
						isLoading
							? "bg-white/5 cursor-not-allowed opacity-50"
							: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
					}`}
				>
					{isLoading ? (
						<>
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
							Parsing...
						</>
					) : (
						"Parse Resume"
					)}
				</motion.button>
			)}

			{/* Separator */}
			<div className="relative flex items-center mt-6">
				<div className="flex-grow border-t border-white/10"></div>
				<span className="flex-shrink mx-4 text-gray-500 text-xl uppercase tracking-wider">
					Or
				</span>
				<div className="flex-grow border-t border-white/10"></div>
			</div>
		</motion.div>
	);
};

FileUploadForm.propTypes = {
	setDetails: PropTypes.func.isRequired,
};

export default FileUploadForm;