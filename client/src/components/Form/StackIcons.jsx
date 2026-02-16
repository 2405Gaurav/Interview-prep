import { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import StackIcon from "tech-stack-icons";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

const icons = [
  "c++",
  "java",
  "python",
  "js",
  "go",
  "rust",
  "ruby",
  "csharp",
  "git",
  "html5",
  "css3",
  "tailwindcss",
  "solidjs",
  "reactjs",
  "angular",
  "vuejs",
  "astro",
  "nuxtjs",
  "typescript",
  "nextjs2",
  "nodejs",
  "mongodb",
  "mysql",
  "postgresql",
  "mariadb",
  "spring",
  "apache",
  "redis",
  "scala",
  "jira",
  "jquery",
  "threejs",
  "framer",
  "django",
  "flask",
  "php",
  "cakephp",
  "rails",
  "solidity",
  "laravel",
  "graphql",
  "graphite",
  "android",
  "dart",
  "flutter",
  "firebase",
  "kotlin",
  "kibana",
  "swift",
  "ionic",
  "xamarin",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcloud",
  "unjs",
  "grafana",
  "pytorch",
  "analytics",
  "bash",
  "linux",
  "prisma",
  "jest",
  "webassembly",
];

const TechStackNames = [
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "Go",
  "Rust",
  "Ruby",
  "C#",
  "Git",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Solid JS",
  "React",
  "Angular",
  "Vue",
  "Astro",
  "Nuxt.js",
  "TypeScript",
  "Next.js",
  "Node.js",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "MariaDB",
  "Spring",
  "Apache",
  "Redis",
  "Scala",
  "Jira",
  "jQuery",
  "Three.js",
  "Framer",
  "Django",
  "Flask",
  "PHP",
  "CakePHP",
  "Ruby on Rails",
  "Solidity",
  "Laravel",
  "GraphQL",
  "Graphite",
  "Android",
  "Dart",
  "Flutter",
  "Firebase",
  "Kotlin",
  "Kibana",
  "Swift",
  "Ionic",
  "Xamarin",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "UnJS",
  "Grafana",
  "PyTorch",
  "Analytics",
  "Bash",
  "Linux",
  "Prisma",
  "Jest",
  "WebAssembly",
];

const StackIcons = ({ details, setDetails }) => {
  const [visibleIconsCount, setVisibleIconsCount] = useState(18);

  const updateTechStacks = (index) => {
    const techStack = TechStackNames[index];
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
  };

  const toggleVisibleIcons = (e) => {
    e.preventDefault();
    if (visibleIconsCount === 18) {
      setVisibleIconsCount(icons.length);
    } else {
      setVisibleIconsCount(18);
    }
  };

  return (
    <div className="w-full">
      {/* Tech Stack Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {icons.slice(0, visibleIconsCount).map((icon, index) => {
          const isSelected = details.techStacks.includes(TechStackNames[index]);
          
          return (
            <motion.div
              key={index}
              onClick={() => updateTechStacks(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* Selected Check Mark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center">
                <StackIcon name={icon} className="w-full h-full" />
              </div>

              {/* Tech Name */}
              <p className="text-xs text-center text-gray-300 font-medium leading-tight line-clamp-2">
                {TechStackNames[index]}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={toggleVisibleIcons}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300"
        >
          {visibleIconsCount === 18 ? (
            <>
              <span>Show More</span>
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

StackIcons.propTypes = {
  details: PropTypes.shape({
    techStacks: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  setDetails: PropTypes.func.isRequired,
};

export default StackIcons;
export { icons, TechStackNames };