import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CircleChevronDown, Pencil, TrashIcon, Terminal, X } from "lucide-react";
import StackIcons from "./StackIcons";
import ProjectForm from "./ProjectForm";
import DeleteDialog from "./DeleteDialog";
import EditProjectDialog from "./EditProjectDialog";
import FileUploadForm from "./file-upload.jsx";
import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import { TechStackNames } from "./StackIcons";
import { LOCAL_SERVER } from "@/constant.js";
import axios from "axios";
import { Toaster, toast } from "sonner";

// Define a Details class
class Details {
	constructor(
		userType = "guest",
		name = "",
		techStacks = [],
		experience = "Fresher",
		projects = []
	) {
		this.userType = userType;
		this.name = name;
		this.techStacks = techStacks;
		this.experience = experience;
		this.projects = projects;
	}
}

const Form = () => {
	const SERVER = import.meta.env.VITE_SERVER || LOCAL_SERVER;

	const [details, setDetails] = useState(new Details());

	const [projectForms, setProjectForms] = useState([{ id: 1 }]);

	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	const [query, setQuery] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const location = useLocation();
	const message = location.state?.message;
	const navigate = useNavigate();

	const handleFormSubmit = (e) => {
		e.preventDefault();
		const payload = {
			UserType: details.userType,
			Name: details.name,
			TechStacks: details.techStacks,
			Experience: details.experience,
			Projects: details.projects,
		};
		console.log(payload);
		if (
			payload.Name.trim() === "" ||
			payload.TechStacks.length === 0 ||
			payload.Experience.trim() === "" ||
			payload.Projects.length === 0
		) {
			toast.error("Please fill all the fields!");
			return;
		}
		setIsSubmitting(true);
		axios
			.post(`${SERVER}/api/v1/session`, payload)
			.then(function (response) {
				console.log(response);
				localStorage.setItem("_id", response.data.data);
				navigate("/camera-checkup");
			})
			.catch(function (error) {
				console.log(error);
				toast.error(error.response.data.message);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	const addTechStack = (techStack) => {
		if (!techStack || techStack.trim() === "") return;
		if (details.techStacks.includes(techStack)) {
			setDetails((prevDetails) => ({
				...prevDetails,
				techStacks: prevDetails.techStacks.filter(
					(stack) => stack !== techStack
				),
			}));
		} else {
			setDetails((prevDetails) => ({
				...prevDetails,
				techStacks: [...prevDetails.techStacks, techStack],
			}));
		}
		setQuery("");
	};

	const filteredTechStack =
		query === ""
			? TechStackNames
			: TechStackNames.filter((techstack) => {
					return techstack
						.toLowerCase()
						.includes(query.toLowerCase());
		});

	return (
		<div className="relative min-h-screen mt-10 bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
			{/* --- BACKGROUND ARCHITECTURE --- */}
			{/* Dynamic Glows */}
			<div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
			<div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
			
			{/* Grain Texture Overlay */}
			<div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />

			{message &&
				toast["error"](message, {
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
				})}
			
			<FileUploadForm
				details={details}
				setDetails={setDetails}
				projectForms={projectForms}
				setProjectForms={setProjectForms}
			/>

			{/* --- FORM CONTENT --- */}
			<div className="relative z-10 container mx-auto px-6 py-15">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-3xl mx-auto"
				>
					{/* Header */}
					<div className="text-center mb-12">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium tracking-[0.3em] mb-6 uppercase text-gray-400 w-fit mx-auto"
						>
							<Terminal className="w-3 h-3" />
							Getting Started
						</motion.div>
						
						<h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
							Tell Us About Yourself
						</h1>
						<p className="text-gray-400 text-base md:text-lg font-light">
							Help us tailor your interview experience
						</p>
					</div>

					<form onSubmit={(e) => handleFormSubmit(e)} className="space-y-8">
						{/* Name Field */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<label className="block text-sm font-medium text-gray-300 mb-3">
								Full Name
							</label>
							<input
								className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-300"
								type="text"
								placeholder="Enter your name"
								value={details.name}
								onChange={(e) =>
									setDetails((prevDetails) => ({
										...prevDetails,
										name: e.target.value,
									}))
								}
							/>
						</motion.div>

						{/* Tech Stacks Field */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							<label className="block text-sm font-medium text-gray-300 mb-3">
								Tech Stack
							</label>
							<p className="text-xs text-gray-500 mb-3">
								Select all technologies you&apos;re comfortable with
							</p>
							
							{/* Selected Tech Stacks */}
							{details.techStacks.length !== 0 && (
								<div className="flex flex-wrap gap-2 mb-3">
									{details.techStacks.map((techStack, index) => (
										<div
											key={index}
											className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-full text-sm group hover:border-indigo-500/50 transition-all"
										>
											<span className="text-gray-200">{techStack}</span>
											<button
												type="button"
												onClick={() =>
													setDetails((prevDetails) => ({
														...prevDetails,
														techStacks: prevDetails.techStacks.filter(
															(stack) => stack !== techStack
														),
													}))
												}
												className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
											>
												<X className="w-3 h-3 text-gray-400 group-hover:text-red-400" />
											</button>
										</div>
									))}
								</div>
							)}

							{/* Combobox */}
							<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
								<Combobox
									as="div"
									value={query}
									onChange={addTechStack}
								>
									<ComboboxInput
										className="w-full bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500"
										aria-label="Tech Stacks"
										onChange={(event) =>
											setQuery(event.target.value)
										}
										value={query}
										placeholder="Search or add tech stacks..."
									/>
									<ComboboxOptions className="border-t border-white/10 max-h-52 overflow-y-auto bg-white/5 backdrop-blur-md">
										{filteredTechStack.map((techStack, index) => (
											<ComboboxOption
												key={index}
												value={techStack}
												className="px-4 py-2 cursor-pointer hover:bg-indigo-600/20 transition-colors text-gray-300"
											>
												{techStack}
											</ComboboxOption>
										))}
									</ComboboxOptions>
								</Combobox>
							</div>

							{/* Stack Icons */}
							<div className="flex flex-wrap mt-4 gap-3 items-center justify-center">
								<StackIcons
									details={details}
									setDetails={setDetails}
								/>
							</div>
						</motion.div>

						{/* Experience Level */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<label className="block text-sm font-medium text-gray-300 mb-3">
								Experience Level
							</label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{[
									{ id: "fresher", label: "Fresher", value: "Fresher" },
									{ id: "intermediate", label: "0-2 Years", value: "0-2 Years" },
									{ id: "experienced", label: "2+ Years", value: "2+ Years" }
								].map((option, index) => (
									<div
										key={option.id}
										className="relative"
									>
										<input
											id={option.id}
											type="radio"
											name="experience"
											value={option.value}
											defaultChecked={index === 0}
											onChange={(e) =>
												setDetails((prevDetails) => ({
													...prevDetails,
													experience: e.target.value,
												}))
											}
											className="peer sr-only"
										/>
										<label
											htmlFor={option.id}
											className="flex items-center justify-center px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl cursor-pointer peer-checked:border-indigo-500/50 peer-checked:bg-gradient-to-r peer-checked:from-indigo-600/20 peer-checked:to-purple-600/20 hover:border-white/20 transition-all duration-300"
										>
											<span className="text-sm font-medium text-gray-300 peer-checked:text-white">
												{option.label}
											</span>
										</label>
									</div>
								))}
							</div>
						</motion.div>

						{/* Projects Section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
						>
							<label className="block text-sm font-medium text-gray-300 mb-3">
								Projects
							</label>
							<p className="text-xs text-gray-500 mb-4">
								Add your best projects to showcase your skills
							</p>

							{/* Project List */}
							<div className="space-y-3">
								{details.projects.map((project) => (
									<div key={project.id}>
										<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-indigo-500/30 transition-all duration-300 group">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<h3 className="text-base font-semibold text-white truncate mb-1">
														{project.title}
													</h3>
													<p className="text-sm text-gray-400 line-clamp-2 mb-3">
														{project.description}
													</p>
													
													{/* Tech Stacks */}
													<div className="flex flex-wrap gap-1">
														{project.techStacks.map((techStack, index) => (
															<span
																key={index}
																className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400 uppercase tracking-wider"
															>
																{techStack}
															</span>
														))}
													</div>
												</div>

												{/* Actions Menu */}
												<Menu as="div" className="relative">
													<MenuButton className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-colors">
														Options
														<CircleChevronDown className="w-3 h-3" />
													</MenuButton>
													<MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-white/10 bg-[#050505]/95 backdrop-blur-md p-1 shadow-xl z-50">
														<MenuItem>
															<button
																className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
																onClick={() => setOpenEditDialog(true)}
															>
																<Pencil className="w-4 h-4" />
																Edit
															</button>
														</MenuItem>
														<div className="h-px bg-white/5 my-1" />
														<MenuItem>
															<button
																className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
																onClick={() => setOpenDeleteDialog(true)}
															>
																<TrashIcon className="w-4 h-4" />
																Delete
															</button>
														</MenuItem>
													</MenuItems>
												</Menu>
											</div>
										</div>

										<DeleteDialog
											openDeleteDialog={openDeleteDialog}
											setOpenDeleteDialog={setOpenDeleteDialog}
											project={project}
											setDetails={setDetails}
										/>
										<EditProjectDialog
											openEditDialog={openEditDialog}
											setOpenEditDialog={setOpenEditDialog}
											projectToBeEdited={project}
											details={details}
											setDetails={setDetails}
										/>
									</div>
								))}
							</div>

							{/* Add Project Form */}
							<ProjectForm
								details={details}
								setDetails={setDetails}
								projectForms={projectForms}
								setProjectForms={setProjectForms}
							/>
						</motion.div>

						{/* Submit Button */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
						>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative w-full inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-out rounded-xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								<span className="relative z-10 flex items-center gap-2">
									{isSubmitting ? (
										<>
											<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											Processing...
										</>
									) : (
										<>
											Continue to Interview
											<motion.span
												className="inline-block"
												initial={{ x: 0 }}
												whileHover={{ x: 5 }}
												transition={{ duration: 0.3 }}
											>
												→
											</motion.span>
										</>
									)}
								</span>
								{/* Animated gradient background */}
								<div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</button>
						</motion.div>
					</form>
				</motion.div>
			</div>

			<Toaster position="bottom-right" richColors />
		</div>
	);
};

export default Form;