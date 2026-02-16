import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Menu, X, ShieldCheck } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <nav className="fixed w-full z-[100] top-0 left-0 pt-6 px-6 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
                
                {/* Logo Section */}
                <NavLink to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
                        <Terminal className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-medium tracking-tighter text-lg">
                        interview<span className="text-gray-500">Prep.AI</span>
                    </span>
                </NavLink>

                {/* Center Navigation - Floating Glass Pill */}
                <div className="hidden md:flex items-center gap-1 bg-white/[0.03] backdrop-blur-xl border border-white/10 px-2 py-1.5 rounded-full shadow-2xl">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `px-5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                    
                    {/* Visual Separator */}
                    <div className="w-[1px] h-4 bg-white/10 mx-2" />
                    
                    <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                        Live Status
                    </div>
                </div>

                {/* Right Section - Guest Indicator */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-gray-500 group cursor-default">
                        <ShieldCheck className="h-3.5 w-3.5 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[11px] font-medium tracking-tight">Guest Mode</span>
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-24 left-6 right-6 md:hidden overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pointer-events-auto shadow-2xl"
                    >
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `px-4 py-3 rounded-xl text-sm transition-colors ${
                                            isActive
                                                ? "bg-white/5 text-white"
                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                            <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between px-4">
                                <span className="text-[11px] text-gray-500 uppercase tracking-widest">System Access</span>
                                <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-bold">
                                    <ShieldCheck className="w-3 h-3" />
                                    GUEST
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;