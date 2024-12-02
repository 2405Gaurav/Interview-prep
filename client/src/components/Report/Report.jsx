import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Briefcase,
    Code2,
    MessageSquare,
    Clock,
    Timer,
    CircleHelp,
    Download,
} from "lucide-react";
import { ProjectCard } from "./ProjectCart";
import { QuestionCard } from "./QuestionCard";
import axios from "axios";
import { LOCAL_SERVER } from "@/constant.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Report = () => {
    const SERVER = import.meta.env.VITE_SERVER || LOCAL_SERVER;

    const [fetching, setFetching] = useState(false);
    const [report, setReport] = useState({
        name: "",
        experience: "",
        techStacks: [],
        projects: [],
        questions: [],
        ratings: [],
        reviews: [
            {
                positive: [],
                negative: [],
                improvements: [],
            },
        ],
        startTime: "",
        endTime: "",
        totalTime: 0,
        totalQuestions: 0,
    });

    const navigate = useNavigate();
    const ReportRef = useRef();

    const downloadPDF = async () => {
        const element = ReportRef.current;

        // Capture the component as an image
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        // Create a PDF and add the captured image
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${report.name || localStorage.getItem("_id")}_report.pdf`);
    };

    function parseReviews(reviews) {
        return reviews.map((review) => {
            // Extract positive points
            const positiveMatch = review.match(/<Positive>(.*?)<\/Positive>/);
            const positivePoints =
                positiveMatch && positiveMatch[1]
                    ? [positiveMatch[1].trim()]
                    : ["No specific positive feedback"];

            // Extract negative points
            const negativeMatch = review.match(/<Negative>(.*?)<\/Negative>/);
            const negativePoints =
                negativeMatch && negativeMatch[1]
                    ? [negativeMatch[1].trim()]
                    : ["No specific negative feedback"];

            // Extract improvement points
            const improvementsMatch = review.match(
                /<Improvements>(.*?)<\/Improvements>/
            );
            const improvementPoints =
                improvementsMatch && improvementsMatch[1]
                    ? [improvementsMatch[1].trim()]
                    : ["No specific improvement suggestions"];

            return {
                positive: positivePoints,
                negative: negativePoints,
                improvements: improvementPoints,
            };
        });
    }

    function formatTime(isoString) {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }

    const fetchReport = async () => {
        try {
            setFetching(true);
            const sessionId = localStorage.getItem("_id");
            if (!sessionId) {
                navigate("/details", {
                    state: {
                        message:
                            "Please go through all the required processes before generating a report",
                    },
                });
                return;
            }
            const response = await axios.post(
                `${SERVER}/api/v1/end/${sessionId}`
            );
            const extractedResponse = response.data?.data;

            const extractedData = {
                name: extractedResponse?.session?.name || "",
                experience: extractedResponse?.session?.experience || "",
                techStacks: extractedResponse?.session?.techStacks || [],
                projects: extractedResponse?.session?.projects || [],
                questions: extractedResponse?.questions?.question || [],
                ratings: extractedResponse?.questions?.rating || [],
                reviews: parseReviews(
                    extractedResponse?.questions?.review || []
                ),
                startTime: formatTime(extractedResponse?.session?.createdAt),
                endTime: formatTime(extractedResponse?.session?.updatedAt),
            };

            extractedData.totalTime =
                extractedResponse?.session?.createdAt &&
                extractedResponse?.session?.updatedAt
                    ? Math.floor(
                          (new Date(extractedResponse.session.updatedAt) -
                              new Date(extractedResponse.session.createdAt)) /
                              (1000 * 60)
                      )
                    : 0;
            extractedData.totalQuestions = Math.min(
                extractedData.questions?.length || 0,
                extractedData.ratings?.length || 0,
                extractedData.reviews?.length || 0
            );

            setReport(extractedData);
        } catch {
            setReport("Error fetching report");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div
            className="min-h-screen bg-gray-900 text-white p-8"
            ref={ReportRef}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-12">
                    <div className="flex items-center gap-4 mb-4">
                        <User className="w-8 h-8 text-blue-400" />
                        <h1 className="text-3xl font-bold">{report.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-2 items-center w-1/2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 font-semibold">
                                Interview started on: {report.startTime}
                            </span>
                        </div>
                        <div className="flex gap-2 items-center w-1/2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 font-semibold">
                                Interview ended on: {report.endTime}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-2 items-center w-1/2">
                            <Timer className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 font-semibold">
                                Total time taken: {report.totalTime} minutes
                            </span>
                        </div>
                        <div className="flex gap-2 items-center w-1/2">
                            <CircleHelp className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 font-semibold">
                                Total questions answered:{" "}
                                {report.totalQuestions}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 font-semibold">
                                Experience: {report.experience}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Code2 className="w-5 h-5 text-blue-400" />
                            {report.techStacks.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-700 text-blue-300 rounded-md text-sm  font-semibold"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {report.projects.map((project, index) => (
                            <ProjectCard key={index} project={project} />
                        ))}
                    </div>
                </section>

                {/* Questions and Reviews Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-semibold">
                            Interview Assessment
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {report.questions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                question={question}
                                rating={report.ratings[index] || "No rating"}
                                review={
                                    report.reviews[index] || {
                                        positive: ["Nothing Found"],
                                        negative: ["Nothing Found"],
                                        improvements: ["Nothing Found"],
                                    }
                                }
                                index={index}
                            />
                        ))}
                    </div>
                </section>
                <div
                    className="fixed bottom-5 right-5 flex items-center justify-center w-12 h-12 text-gray-500 bg-blue-500 rounded-full shadow-lg cursor-pointer"
                    role="action"
                    onClick={downloadPDF}
                >
                    <Download className="w-6 h-6 text-white" />
                </div>
            </motion.div>
        </div>
    );
};

export default Report;
