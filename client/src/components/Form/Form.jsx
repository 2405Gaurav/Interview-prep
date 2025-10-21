import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CircleChevronDown, Pencil, TrashIcon } from "lucide-react";
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

// Define a Project class
class Project {
	constructor(id, title = "", techStacks = [], description = "") {
		this.id = id;
		this.title = title;
		this.techStacks = techStacks;
		this.description = description;
	}
}

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
		<div className="bg-[#111826] pt-16 pb-4">
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
			<form
				className="mx-[5%] md:mx-[25%] py-2"
				onSubmit={(e) => handleFormSubmit(e)}
			>
				<div className="flex flex-col justify-start min-h-[100vh]">
					<h1 className="text-3xl text-white font-bold text-center">
						Please enter few details
					</h1>
					<div className="flex flex-col mt-5">
						<label className="text-white">Name</label>
						<input
							className="bg-[#1E2A47] text-white p-2 rounded-md mt-2"
							type="text"
							placeholder="Name"
							value={details.name}
							onChange={(e) =>
								setDetails((prevDetails) => ({
									...prevDetails,
									name: e.target.value,
								}))
							}
						/>
					</div>
					<div className="flex flex-col mt-5">
						<label className="text-white">Tech Stacks</label>
						<p className="text-sm leading-6 text-gray-400">
							Please select all tech stacks you are comfortable
							with. You can also add custom tech stacks.
						</p>
						{details.techStacks.length != 0 && (
							<div
								className={`bg-[#1E2A47] text-white p-2 rounded-md flex ${
									details.techStacks.length > 6
										? "overflow-x-scroll"
										: null
								} min-w-[100%]`}
							>
								{details.techStacks.map((techStack, index) => {
									return (
										<div
											key={index}
											className="flex p-1 justify-center items-center mx-1 bg-[#111826] rounded-md transition-all"
										>
											<p>{techStack}</p>
											<svg
												onClick={() =>
													setDetails(
														(prevDetails) => ({
															...prevDetails,
															techStacks:
																prevDetails.techStacks.filter(
																	(stack) =>
																		stack !==
																		techStack
																),
														})
													)
												}
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={2.0}
												stroke="red"
												className="size-5 justify-center cursor-pointer ml-1"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
												/>
											</svg>
										</div>
									);
								})}
							</div>
						)}
						<div className="bg-[#1E2A47] text-white p-2 rounded-md mt-2">
							<Combobox
								as="div"
								value={query}
								onChange={addTechStack}
							>
								<ComboboxInput
									className={`bg-[#1E2A47] text-white h-[2.25rem] min-w-full border-white m-[-0.30rem] p-2`}
									aria-label="Tech Stacks"
									onChange={(event) =>
										setQuery(event.target.value)
									}
									value={query}
									placeholder="Search tech stacks..."
								/>
								<ComboboxOptions className="mt-[0.30rem] border empty:invisible max-h-52 overflow-y-scroll">
									{filteredTechStack.map(
										(techStack, index) => (
											<ComboboxOption
												key={index}
												value={techStack}
												className="data-[focus]:bg-blue-500 data-[focus]:text-slate-900 cursor-pointer"
											>
												{techStack}
											</ComboboxOption>
										)
									)}
								</ComboboxOptions>
							</Combobox>
						</div>
						<div className="flex flex-wrap mt-2 items-center justify-around">
							<StackIcons
								details={details}
								setDetails={setDetails}
							/>
						</div>
					</div>
					<div className="flex flex-col mt-5">
						<legend className="text-white">Experience</legend>
						<div className="flex justify-start gap-3 mt-2">
							<div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700 cursor-pointer">
								<input
									id="bordered-radio-1"
									type="radio"
									value=""
									name="bordered-radio"
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
									defaultChecked
								/>
								<label
									htmlFor="bordered-radio-1"
									className="text-white mx-4 py-4 cursor-pointer"
								>
									Fresher
								</label>
							</div>
							<div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700 cursor-pointer">
								<input
									id="bordered-radio-2"
									type="radio"
									value=""
									name="bordered-radio"
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
								/>
								<label
									htmlFor="bordered-radio-2"
									className="text-white mx-4 py-4 cursor-pointer"
								>
									0-2 Years
								</label>
							</div>
							<div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700 cursor-pointer">
								<input
									id="bordered-radio-3"
									type="radio"
									value=""
									name="bordered-radio"
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
								/>
								<label
									htmlFor="bordered-radio-3"
									className="text-white mx-4 py-4 cursor-pointer"
								>
									2+ Years
								</label>
							</div>
						</div>
					</div>
					<div className="flex flex-col mt-5">
						<legend className="text-white">Projects</legend>
						<p className="text-sm leading-6 text-gray-400">
							Please add few best projects of yours. This will
							help us to understand your skills better.
						</p>
						{details.projects.map((project) => (
							<div key={project.id}>
								<div className="flex items-center justify-between bg-[#1E2A47] rounded-md mt-5 px-2 py-1 gap-2">
									<div className="flex-col w-[90%] pr-2">
										<p className="text-slate-200 truncate">
											<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r to-emerald-500 from-sky-400">
												{project.title} |{" "}
											</span>
											{project.description}
										</p>

										<legend
											className={`${
												project.techStacks.length > 8
													? "overflow-x-scroll"
													: null
											} mt-2 mb-1`}
										>
											{project.techStacks.map(
												(techStack, index) => (
													<span
														key={index}
														className="mr-1 bg-[#111826] text-white text-xs px-2 py-1 rounded-md"
													>
														{techStack}
													</span>
												)
											)}
										</legend>
									</div>
									<div className="w-[10%] flex justify-end">
										<Menu as="div">
											<MenuButton className="inline-flex items-center gap-2 rounded-md bg-[#111826] py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-[#111826]/6 data-[open]:bg-[#1E2A47] data-[focus]:outline-1 data-[focus]:outline-white">
												Options
												<CircleChevronDown className="size-4 fill-white/10" />
											</MenuButton>
											<MenuItems
												transition
												anchor="bottom end"
												className="w-52 origin-top-right rounded-xl border border-white/5 bg-[#1E2A47] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
											>
												<MenuItem>
													<button
														className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
														onClick={() =>
															setOpenEditDialog(
																true
															)
														}
													>
														<Pencil className="size-4 fill-white/30" />
														Edit
													</button>
												</MenuItem>
												<div className="my-1 h-px bg-white/5" />
												<MenuItem>
													<button
														className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
														onClick={() =>
															setOpenDeleteDialog(
																true
															)
														}
													>
														<TrashIcon className="size-4 fill-white/30" />
														Delete
													</button>
												</MenuItem>
											</MenuItems>
										</Menu>
									</div>
									<DeleteDialog
										openDeleteDialog={openDeleteDialog}
										setOpenDeleteDialog={
											setOpenDeleteDialog
										}
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
							</div>
						))}
						<ProjectForm
							details={details}
							setDetails={setDetails}
							projectForms={projectForms}
							setProjectForms={setProjectForms}
						/>
					</div>
				</div>
				<button
					className="bg-[#2563EB] text-white p-2 rounded-md min-w-full mt-4 cursor-pointer text-center"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting
						? "Please wait while we take you to the dashboard"
						: "Submit"}
				</button>
			</form>
			<Toaster position="bottom-right" richColors />
		</div>
	);
};

export default Form;
