import { motion } from "framer-motion";
import { Terminal, Linkedin, Github, Globe } from "lucide-react";

const Footer = () => {
    const socialLinks = [
        {
            icon: Linkedin,
            href: "https://www.linkedin.com/in/2405Gaurav/",
            ariaLabel: "LinkedIn Profile",
        },
        {
            icon: Github,
            href: "https://github.com/2405Gaurav",
            ariaLabel: "GitHub Profile",
        },
        {
            icon: Globe,
            href: "https://thegauravthakur.in/",
            ariaLabel: "Personal Website",
        },
    ];

    return (
        <footer className="relative bg-[#050505] text-white py-8 border-t border-white/5">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent pointer-events-none" />
            
            <div className="relative container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                {/* Logo and Platform Name */}
                <div className="flex items-center mb-6 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md mr-3">
                        <Terminal className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        interviewPrep.ai
                    </span>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mb-6 md:mb-0">
                    {socialLinks.map((social, index) => (
                        <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.ariaLabel}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.a>
                    ))}
                </div>

                {/* Made with Love */}
            </div>

            {/* Copyright and Additional Info */}
            <div className="relative text-center text-xs text-gray-600 mt-6 pt-6 border-t border-white/5">
                <p className="font-light tracking-wide">
                    © {new Date().getFullYear()} interviewPrep.AI All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;