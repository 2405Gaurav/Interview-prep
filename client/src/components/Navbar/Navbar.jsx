import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/[0.04] bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5 transition-all duration-300">
            <Terminal className="h-3.5 w-3.5 text-white/60 group-hover:text-cyan-400 transition-colors duration-300" />
          </div>
          <span className="text-sm font-medium tracking-tight text-white/70">
            interview<span className="text-white/25">Prep</span>
            <span className="text-cyan-400/60 font-mono">.AI</span>
          </span>
        </NavLink>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-white/35 hover:text-white/70 hover:bg-white/[0.03]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right: live indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-indigo-400" />
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20">Live</span>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white/40"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.04] bg-[#050505]/95 overflow-hidden"
          >
            <div className="px-6 py-3 flex flex-col gap-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-xs transition-all ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-white/35 hover:text-white/70"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;