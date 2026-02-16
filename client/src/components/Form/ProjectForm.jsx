import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { TechStackNames } from "./StackIcons";
import { toast, Toaster } from "sonner";
import { Plus, X } from "lucide-react";

const ProjectForm = ({ details, setDetails, projectForms, setProjectForms }) => {
	const [project, setProject] = useState({
		id: projectForms.length,
		title: "",
		techStacks: [],
		description: "",
	});

	const [query, setQuery] = useState("");

	const addTechStack = (techStack) => {
		if (!techStack || techStack.trim() === "") return;
		setProject((prev) => ({
			...prev,
			techStacks: [...prev.techStacks, techStack],
		}));
		setQuery("");
	};

	const removeTechStack = (stackToRemove) => {
		setProject((prev) => ({
			...prev,
			techStacks: prev.techStacks.filter(
				(techStack) => techStack !== stackToRemove
			),
		}));
	};

	const filteredTechStack =
		query === ""
			? TechStackNames
			: TechStackNames.filter((techstack) => {
					return techstack.toLowerCase().includes(query.toLowerCase());
			});

	const addProjectForm = async (e) => {
		try {
			e.preventDefault();
			if (
				project.title.trim() === "" ||
				project.description.trim() === "" ||
				project.techStacks.length === 0
			) {
				throw new Error("Please fill all the fields!");
			}
			setDetails((prev) => ({
				...prev,
				projects: [...prev.projects, project],
			}));
			setProjectForms((prev) => [
				...prev,
				{ id: projectForms.length + 1 },
			]);
			setProject({
				id: projectForms.length + 1,
				title: "",
				techStacks: [],
				description: "",
			});
			console.log(project);
			toast.success("Project added successfully!");
		} catch (error) {
			toast.error(error.message || "Failed to add project!");
		}
	};

	useEffect(() => {
		console.log(details);
	}, [details]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
		>
			{/* Header */}
			<div className="flex items-center gap-2 mb-6">
				<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
					<Plus className="w-4 h-4 text-indigo-400" />
				</div>
				<h3 className="text-lg font-semibold text-white">Add New Project</h3>
			</div>

			{/* Title Field */}
			<div className="mb-5">
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Project Title
				</label>
				<input
					className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-300"
					type="text"
					placeholder="e.g., E-commerce Platform"
					value={project.title}
					onChange={(e) =>
						setProject((prev) => ({
							...prev,
							title: e.target.value,
						}))
					}
				/>
			</div>

			{/* Tech Stacks Field */}
			<div className="mb-5">
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Technologies Used
				</label>

				{/* Selected Tech Stacks */}
				{project.techStacks.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-3">
						{project.techStacks.map((stack, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-full text-sm group hover:border-indigo-500/50 transition-all"
							>
								<span className="text-gray-200">{stack}</span>
								<button
									type="button"
									onClick={() => removeTechStack(stack)}
									className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
								>
									<X className="w-3 h-3 text-gray-400 group-hover:text-red-400" />
								</button>
							</motion.div>
						))}
					</div>
				)}

				{/* Combobox */}
				<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
					<Combobox as="div" value={query} onChange={addTechStack}>
						<ComboboxInput
							className="w-full bg-transparent text-white px-4 py-2.5 focus:outline-none placeholder-gray-500"
							aria-label="Tech Stacks"
							onChange={(event) => setQuery(event.target.value)}
							value={query}
							placeholder="Search and add tech stacks..."
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
			</div>

			{/* Description/Features Field */}
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Key Features & Description
				</label>
				<textarea
					className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-300 min-h-[100px] resize-y"
					placeholder="Describe the project's main features and your contributions..."
					value={project.description}
					onChange={(e) =>
						setProject((prev) => ({
							...prev,
							description: e.target.value,
						}))
					}
				/>
			</div>

			{/* Add Project Button */}
			<motion.button
				type="button"
				onClick={addProjectForm}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				className="group relative w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out rounded-lg overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50"
			>
				<span className="relative z-10 flex items-center gap-2">
					<Plus className="w-4 h-4" />
					Add Project
				</span>
				{/* Animated gradient background */}
				<div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</motion.button>

			<Toaster position="bottom-right" richColors />
		</motion.div>
	);
};

ProjectForm.propTypes = {
	details: PropTypes.shape({
		projects: PropTypes.array,
	}).isRequired,
	setDetails: PropTypes.func.isRequired,
	projectForms: PropTypes.array.isRequired,
	setProjectForms: PropTypes.func.isRequired,
};

export default ProjectForm;