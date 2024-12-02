import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Button,
} from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { TechStackNames } from "./StackIcons";
import { toast } from "sonner";
import { Toaster } from "sonner";

const ProjectForm = (props) => {
    const { details, setDetails, projectForms, setProjectForms } = props;

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
            toast.success("Project added successfully!", {
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
        } catch (error) {
            toast.error(error.message || "Failed to add project!", {
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
        }
    };

    useEffect(() => {
        console.log(details);
    }, [details]);

    return (
        <>
            <div className="flex flex-col mt-6">
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
                <label className="text-white">Tech Stacks</label>
                {project.techStacks.length > 0 && (
                    <div
                        className={`bg-[#1E2A47] text-white p-2 rounded-md flex ${
                            details.techStacks.length > 6
                                ? "overflow-x-scroll"
                                : null
                        } min-w-[92%]`}
                    >
                        {project.techStacks.map((stack, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex p-1 justify-center items-center mx-1 bg-[#111826] rounded-md transition-all"
                                >
                                    <p>{stack}</p>
                                    <svg
                                        onClick={() =>
                                            setProject((prev) => ({
                                                ...prev,
                                                techStacks:
                                                    prev.techStacks.filter(
                                                        (techStack) =>
                                                            techStack != stack
                                                    ),
                                            }))
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
                    <Combobox as="div" value={query} onChange={addTechStack}>
                        <ComboboxInput
                            className={`bg-[#1E2A47] text-white h-[2.25rem] min-w-full border-white m-[-0.30rem] p-2`}
                            aria-label="Tech Stacks"
                            onChange={(event) => setQuery(event.target.value)}
                            value={query}
                            placeholder="Search tech stacks..."
                        />
                        <ComboboxOptions className="border empty:invisible max-h-96 overflow-y-scroll">
                            {filteredTechStack.map((techStack, index) => (
                                <ComboboxOption
                                    key={index}
                                    value={techStack}
                                    className="data-[focus]:bg-blue-500 data-[focus]:text-slate-900 cursor-pointer"
                                >
                                    {techStack}
                                </ComboboxOption>
                            ))}
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
            <Button
                className="bg-[#30539f] text-white p-2 rounded-md mt-3 self-end w-[40%]"
                onClick={addProjectForm}
            >
                Add Project
            </Button>
            <Toaster position="bottom-right" richColors />
        </>
    );
};

export default ProjectForm;
