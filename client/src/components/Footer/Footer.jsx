import { motion } from "framer-motion";
import { Terminal, Linkedin, Github, Globe } from "lucide-react";

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/2405Gaurav/", label: "LinkedIn" },
  { icon: Github,   href: "https://github.com/2405Gaurav",           label: "GitHub"   },
  { icon: Globe,    href: "https://thegauravthakur.in/",              label: "Website"  },
];

const Footer = () => (
  <footer className="relative border-t border-white/[0.04] bg-[#050505]">
    <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Terminal className="w-3.5 h-3.5 text-white/30" />
        </div>
        <span className="text-xs font-medium tracking-tight text-white/25">
          interviewPrep<span className="text-cyan-400/40 font-mono">.AI</span>
        </span>
      </div>

      {/* Copyright */}
      <p className="text-[10px] font-mono text-white/15 tracking-wider">
        © {new Date().getFullYear()} interviewPrep.AI
      </p>

      {/* Socials */}
      <div className="flex items-center gap-2">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-7 h-7 rounded-md bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200 group"
          >
            <Icon className="w-3 h-3 text-white/25 group-hover:text-white/60 transition-colors" />
          </motion.a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;