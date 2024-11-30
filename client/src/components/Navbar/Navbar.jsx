import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Menu, X } from "lucide-react";
import { ButtonGlow } from "@/components/magicui/button-glow";

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center gap-2">
                            <Terminal className="h-6 w-6 text-indigo-400" />
                            <span className="text-white font-semibold">
                                TechPrep AI
                            </span>
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `text-sm ${
                                            isActive
                                                ? "text-indigo-400"
                                                : "text-gray-300 hover:text-white"
                                        } transition-colors`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                            <ButtonGlow className="ml-4">Sign In</ButtonGlow>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-400 hover:text-white"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <motion.div
                initial={false}
                animate={isOpen ? { height: "auto" } : { height: 0 }}
                className="md:hidden overflow-hidden bg-gray-800"
            >
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-base ${
                                    isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                    <ButtonGlow className="w-full mt-4">Sign In</ButtonGlow>
                </div>
            </motion.div>
        </nav>
    );
};

export default Navbar;
