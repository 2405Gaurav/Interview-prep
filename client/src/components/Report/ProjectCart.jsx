import { motion } from "framer-motion";
import { Code2, Briefcase } from "lucide-react";

export const ProjectCard = ({ project }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">
                    {project.title}
                </h3>
            </div>
            <p className="text-gray-300 mb-4">{project.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <Code2 className="w-4 h-4 text-blue-400" />
                {project.techStacks.map((tech, index) => (
                    <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-blue-300 rounded-md text-sm"
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};
