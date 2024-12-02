import React from "react";
import { motion } from "framer-motion";
import { Terminal, Linkedin, Github, Instagram, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const Footer = () => {
    const socialLinks = [
        {
            icon: Linkedin,
            href: "https://www.linkedin.com/in/rnkp755/",
            ariaLabel: "LinkedIn Profile",
        },
        {
            icon: Github,
            href: "https://github.com/rnkp755",
            ariaLabel: "GitHub Profile",
        },
        {
            icon: Instagram,
            href: "https://www.instagram.com/rnkp755/",
            ariaLabel: "Instagram Profile",
        },
        {
            icon: Globe,
            href: "https://www.raushan.info/",
            ariaLabel: "Personal Website",
        },
    ];

    return (
        <footer className="bg-gray-900 text-white py-6 border-t border-gray-800">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                {/* Logo and Platform Name */}
                <div className="flex items-center mb-4 md:mb-0">
                    <Terminal className="w-8 h-8 mr-2 text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-300">
                        TechPrep AI
                    </span>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                        <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.ariaLabel}
                            className="text-gray-400 hover:text-emerald-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <social.icon className="w-6 h-6" />
                        </motion.a>
                    ))}
                </div>

                {/* Made with Love */}
                <div className="mt-4 md:mt-0 text-sm text-gray-500">
                    Made with ❤️ by Raushan
                </div>
            </div>

            {/* Copyright and Additional Info */}
            <div className="text-center text-xs text-gray-600 mt-4">
                © {new Date().getFullYear()} TechPrep AI. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
