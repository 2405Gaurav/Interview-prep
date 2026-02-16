import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { 
  Play, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Layers, 
  Zap
} from "lucide-react";
import Sparkles from "@/components/magicui/sparkles-text";
import { NavLink } from "react-router-dom";

// Floating Interaction Nodes - Customized for Interview Prep
const TechNode = ({ icon: Icon, title, value, position, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 1.2, ease: "easeOut" }}
    className={`absolute hidden lg:flex items-center gap-3 ${position} group cursor-default`}
  >
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-indigo-500/50 transition-all duration-500">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </div>
      {/* Decorative connecting line */}
      <div className="absolute top-1/2 left-full w-12 h-[1px] bg-gradient-to-r from-white/10 to-transparent -translate-y-1/2" />
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{title}</span>
      <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">{value}</span>
    </div>
  </motion.div>
);

TechNode.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
};

// Custom Button Component
const Button = ({ children }) => (
  <button className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-out rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105">
    <span className="relative z-10 flex items-center gap-2">
      {children}
      <motion.span
        className="inline-block"
        initial={{ x: 0 }}
        whileHover={{ x: 5 }}
        transition={{ duration: 0.3 }}
      >
        →
      </motion.span>
    </span>
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
};

const InterviewPrep = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- BACKGROUND ARCHITECTURE --- */}
      {/* Dynamic Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      
      {/* Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />

      {/* --- HERO CONTENT --- */}
      <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col items-center justify-center text-center">
        
        {/* Play / Demo Trigger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer group">
            <Play className="w-3 h-3 text-white fill-white group-hover:scale-110 transition-transform" />
          </div>
        </motion.div>

        {/* Brand Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium tracking-[0.3em] mb-8 uppercase text-gray-400"
        >
          <Terminal className="w-3 h-3" />
          interviewPrep.ai
        </motion.div>

        {/* Main Title - High End Gradient */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
            <Sparkles
                className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
                text="Engineering Interviews,"
            />
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mt-[-15px] text-white/90">
                refined by Intelligence.
            </h2>
        </motion.div>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-base md:text-lg max-w-xl mt-8 mb-12 font-light leading-relaxed"
        >
          Simulate high-pressure technical rounds with our specialized AI. 
          Real-time feedback, zero friction, immediate growth.
        </motion.p>

        {/* Action Section - The "No Login" flow */}
        <div className="flex flex-col items-center gap-6">
          <NavLink to="/details">
            <Button>
              Let&apos;s Begin
            </Button>
          </NavLink>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>No authentication required. Be our guest.</span>
          </div>
        </div>

        {/* Bottom Status / Scroll Indicator */}
        <div className="absolute bottom-10 left-10 hidden md:flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest">
           <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
             <span className="text-[10px] animate-bounce">↓</span>
           </div>
           Recommended: Chrome / Edge
        </div>
      </div>

      {/* --- DECORATIVE TECH NODES --- */}
      <TechNode icon={Cpu} title="System Design" value="Distributed" position="top-[20%] left-[12%]" delay={0.7} />
      <TechNode icon={Code2} title="Frontend" value="React / Next.js" position="top-[30%] right-[15%]" delay={0.9} />
      <TechNode icon={Layers} title="Backend" value="Go / Node.js" position="bottom-[30%] left-[10%]" delay={1.1} />
      <TechNode icon={Zap} title="Algorithms" value="Optimization" position="bottom-[20%] right-[12%]" delay={1.3} />

      {/* --- TECH STACK FOOTER --- */}
      <div className="absolute bottom-0 w-full py-10 border-t border-white/5 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-6xl mx-auto flex justify-center items-center gap-x-12 md:gap-x-20 px-6 opacity-30 grayscale pointer-events-none">
          <span className="text-sm font-bold tracking-tighter">TYPESCRIPT</span>
          <span className="text-sm font-bold tracking-tighter">PYTHON</span>
          <span className="text-sm font-bold tracking-tighter">REACT</span>
          <span className="text-sm font-bold tracking-tighter">GO-LANG</span>
          <span className="text-sm font-bold tracking-tighter">DOCKER</span>
          <span className="text-sm font-bold tracking-tighter">AZURE</span>
        </div>
      </div>

    </div>
  );
};

export default InterviewPrep;