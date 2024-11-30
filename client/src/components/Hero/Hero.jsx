import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Brain, Terminal, ArrowRight, GitBranch } from "lucide-react";
import { ButtonGlow } from "@/components/magicui/button-glow";
import Sparkles from "@/components/magicui/sparkles-text";
import MeteorBackground from "@/components/magicui/meteors";
import { NavLink } from "react-router-dom";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-indigo-500/50 transition-colors"
    >
        <div className="flex justify-center mb-4">
            <Icon className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const Hero = () => {
    return (
        <AnimatePresence>
            <div className="relative min-h-screen bg-gray-900 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3730a3,#312e81,#1f2937)]" />
                <MeteorBackground />

                {/* Content */}
                <div className="relative container mx-auto px-6 pt-32 pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Terminal className="w-6 h-6 text-indigo-400" />
                            <span className="text-indigo-400 font-medium">
                                TechPrep AI
                            </span>
                        </div>

                        <Sparkles
                            className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text text-white bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 "
                            text="Master Yor Tech Interview With AI"
                        />

                        <p className="text-lg md:text-xl text-gray-300 mb-12 mx-auto max-w-2xl">
                            Practice technical interviews with our advanced AI
                            interviewer. Choose your tech stack, showcase your
                            projects, and get detailed feedback in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center">
                            <NavLink to="/details">
                                <ButtonGlow>
                                    Continue as Guest
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </ButtonGlow>
                            </NavLink>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                            >
                                Sign In
                            </motion.button>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <FeatureCard
                                icon={Code2}
                                title="Live Coding"
                                description="Built-in code editor with real-time execution and syntax highlighting."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={Brain}
                                title="AI Feedback"
                                description="Get instant analysis and personalized improvement suggestions."
                                delay={0.4}
                            />
                            <FeatureCard
                                icon={GitBranch}
                                title="Project Review"
                                description="Share your projects for comprehensive technical evaluation."
                                delay={0.6}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default Hero;
