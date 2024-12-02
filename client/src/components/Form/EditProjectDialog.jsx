import {
    Dialog,
    DialogTitle,
    DialogPanel,
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Button,
} from "@headlessui/react";
import React, { useState } from "react";
import { TechStackNames } from "./StackIcons";
import { toast } from "sonner";
import { Toaster } from "sonner";

const EditProjectDialog = (props) => {
    const {
        openEditDialog,
        setOpenEditDialog,
        projectToBeEdited,
        details,
        setDetails,
    } = props;

    const [project, setProject] = useState({
        id: projectToBeEdited.id,
        title: projectToBeEdited.title,
        techStacks: projectToBeEdited.techStacks,
        description: projectToBeEdited.description,
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

    const filteredTechStack =
        query === ""
            ? TechStackNames
            : TechStackNames.filter((techstack) => {
                  return techstack.toLowerCase().includes(query.toLowerCase());
              });

    const handleEdit = async () => {
        try {
            const newProjects = details.projects.map((proj) =>
                proj.id === project.id ? project : proj
            );
            await setDetails({ ...details, projects: newProjects });
            toast.success("Project updated successfully!", {
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
            await setOpenEditDialog(false);
        } catch (error) {
            toast.error("Failed to update project!", {
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
            await setOpenEditDialog(false);
        }
    };

    return (
        <>
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 overflow-y-scroll">
                    <DialogPanel className="min-w-xl space-y-4 border bg-[#111826] text-slate-100 rounded-xl px-12 py-6">
                        <div>
                            <DialogTitle className="font-bold text-lg">
                                Edit Project
                            </DialogTitle>
                            <div className="flex flex-col mt-6 min-w-[50vw]">
                                <label className="text-white">Title</label>
                                <input
                                    className="bg-[#1E2A47] text-white p-2 rounded-md mt-2"
                                    type="text"
                                    placeholder="Title"
                                    value={project.title}
                                    onChange={(e) =>
                                        setProject((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col mt-5">
                                <label className="text-white">
                                    Tech Stacks
                                </label>
                                {project.techStacks.length > 0 && (
                                    <div
                                        className={`bg-[#1E2A47] text-white p-2 rounded-md flex ${
                                            details.techStacks.length > 6
                                                ? "overflow-x-scroll"
                                                : null
                                        } min-w-[92%]`}
                                    >
                                        {project.techStacks.map(
                                            (stack, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex p-1 justify-center items-center mx-1 bg-[#111826] rounded-md transition-all"
                                                    >
                                                        <p>{stack}</p>
                                                        <svg
                                                            onClick={() =>
                                                                setProject(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        techStacks:
                                                                            prev.techStacks.filter(
                                                                                (
                                                                                    techStack
                                                                                ) =>
                                                                                    techStack !=
                                                                                    stack
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
                                            }
                                        )}
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
                                        <ComboboxOptions className="border empty:invisible max-h-52 overflow-y-scroll">
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
                            </div>
                            <div className="flex flex-col mt-5">
                                <label className="text-white">Features</label>
                                <textarea
                                    className="bg-[#1E2A47] text-white p-2 rounded-md mt-2"
                                    type="text"
                                    placeholder="Write some unique features..."
                                    value={project.description}
                                    onChange={(e) =>
                                        setProject((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setOpenEditDialog(false)}
                                    className="mt-5"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-[#2563EB] text-white p-2 rounded-md mt-5"
                                    onClick={handleEdit}
                                >
                                    Update Project
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
            <Toaster position="bottom-right" richColors />
        </>
    );
};

export default EditProjectDialog;
