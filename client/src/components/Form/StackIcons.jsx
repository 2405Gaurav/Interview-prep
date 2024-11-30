import React, { useState } from "react";
import StackIcon from "tech-stack-icons";

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

const StackIcons = (props) => {
  const { details, setDetails } = props;
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

  const [visibleIconsCount, setVisibleIconsCount] = useState(18);
  const toggleVisibleIcons = (e) => {
    e.preventDefault();
    if (visibleIconsCount === 18) {
      setVisibleIconsCount(icons.length);
    } else {
      setVisibleIconsCount(18);
    }
  };

  return (
    <div className="flex-cols">
      <div className="flex flex-wrap items-center justify-around">
        {icons.slice(0, visibleIconsCount).map((icon, index) => {
          return (
            <div
              key={index}
              onClick={() => updateTechStacks(index)}
              className="flex-col m-1 bg-slate-100 p-2 rounded-lg cursor-pointer hover:scale-105 hover:ring-4 ring-blue-500 ring-inset transition-all"
            >
              {details.techStacks.includes(TechStackNames[index]) && (
                <div className="float-start mr-[-2rem]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="green"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
              )}
              <StackIcon name={icon} className="" />
              <p className="text-black font-bold text-center text-md">
                {TechStackNames[index]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center mt-2">
        {visibleIconsCount === 18 ? (
          <div
            className="flex justify-center items-center cursor-pointer px-2"
            onClick={toggleVisibleIcons}
          >
            <div className="text-white mt-2">View More</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              strokeWidth={1.0}
              stroke="white"
              className="size-5 ml-2 overflow-visible"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
              />
            </svg>
          </div>
        ) : (
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={toggleVisibleIcons}
          >
            <span className="text-white mt-2">Collapse</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              strokeWidth={1.5}
              stroke="white"
              className="size-5 ml-2 overflow-visible"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 18.75-7.5-7.5-7.5 7.5m15-6-7.5-7.5-7.5 7.5"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default StackIcons;
export { icons, TechStackNames };
