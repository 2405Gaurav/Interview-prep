import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { mediapipeResponse } from "@/components/Camera/mediapipeResponse.js";
import Camera from "../Camera/Camera.jsx";
import { MicroPhone, Speaker, Ide } from "..";
import {
  Code2, Mic, Video, Terminal, Sparkles,
  AlertCircle, Activity, ChevronRight, Cpu, Radio,
} from "lucide-react";

const LOCAL_SERVER = "http://localhost:8080";

const PulsingDot = ({ color = "bg-emerald-400", size = "w-2 h-2" }) => (
  <span className={`relative flex ${size}`}>
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
    <span className={`relative inline-flex rounded-full ${size} ${color}`} />
  </span>
);
PulsingDot.propTypes = { color: PropTypes.string, size: PropTypes.string };

const StatusBadge = ({ status }) => {
  const map = {
    speaking:  { dot: "bg-emerald-400", label: "Speaking",  ring: "border-emerald-400/30 bg-emerald-400/5"  },
    listening: { dot: "bg-amber-400",   label: "Listening", ring: "border-amber-400/30  bg-amber-400/5"     },
    analyzing: { dot: "bg-cyan-400",    label: "Analyzing", ring: "border-cyan-400/30   bg-cyan-400/5"      },
    waiting:   { dot: "bg-gray-500",    label: "Standby",   ring: "border-white/10      bg-white/5"         },
  };
  const s = map[status] || map.waiting;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase ${s.ring}`}>
      <PulsingDot color={s.dot} size="w-1.5 h-1.5" />
      <span className="text-white/60">{s.label}</span>
    </div>
  );
};
StatusBadge.propTypes = { status: PropTypes.string };

const SectionLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-3.5 h-3.5 text-cyan-400/70" />
    <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/30">{label}</span>
    <div className="flex-1 h-px bg-white/5" />
  </div>
);
SectionLabel.propTypes = { icon: PropTypes.elementType.isRequired, label: PropTypes.string.isRequired };

const Scanlines = () => (
  <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
    style={{
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)",
      backgroundSize: "100% 3px",
    }} />
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Interview = () => {
  const SERVER = useMemo(() => import.meta.env.VITE_SERVER || LOCAL_SERVER, []);
  const navigate = useNavigate();

  const [gettingGeminiResponse, setGettingGeminiResponse] = useState(false);
  const [geminiResponse, setGeminiResponse]               = useState("");
  const [interviewerStatus, setInterviewerStatus]         = useState("waiting");
  const [speakerStatus, setSpeakerStatus]                 = useState("idle");
  const [userTranscript, setUserTranscript]               = useState("");
  const [aiTranscriptHistory, setAiTranscriptHistory]     = useState([]);
  const [userTranscriptHistory, setUserTranscriptHistory] = useState([]);
  const [ideEnabled, setIdeEnabled]                       = useState(false);
  const [code, setCode]                                   = useState("// Write your code here...");
  const [hasCodeChanged, setHasCodeChanged]               = useState(false);
  const [cameraStatus, setCameraStatus] = useState(new mediapipeResponse(false, "Analysing your stream", "info"));

  const aiScrollRef   = useRef(null);
  const userScrollRef = useRef(null);

  useEffect(() => {
    aiScrollRef.current?.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [aiTranscriptHistory]);

  useEffect(() => {
    userScrollRef.current?.scrollTo({ top: userScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [userTranscriptHistory]);

  const fetchGeminiResponse = useCallback(async (manualAnswer = null) => {
    try {
      const sessionId = localStorage.getItem("_id");
      if (!sessionId) {
        toast.error("Session ID missing. Redirecting...");
        setTimeout(() => navigate("/details"), 2000);
        return;
      }
      setGettingGeminiResponse(true);
      let payload = manualAnswer !== null ? manualAnswer : userTranscript;
      if (hasCodeChanged && code) payload += `\n\n[CODE_SUBMISSION]\n${code}`;
      if (payload.trim()) setUserTranscriptHistory((h) => [...h, payload.trim()]);

      const formData = new FormData();
      formData.append("answer", payload);
      const response = await axios.post(`${SERVER}/api/v1/ask-to-gemini/${sessionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data?.data;
      if (data) {
        const question = data.question || "No question received.";
        setGeminiResponse(question);
        setAiTranscriptHistory((h) => [...h, question]);
        if (data.code) { setCode(data.code); setIdeEnabled(true); setHasCodeChanged(false); }
        setInterviewerStatus("speaking");
        setSpeakerStatus("speaking");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch response.");
      setInterviewerStatus("listening");
    } finally {
      setGettingGeminiResponse(false);
    }
  }, [SERVER, navigate, userTranscript, hasCodeChanged, code]);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchGeminiResponse("");
  }, [fetchGeminiResponse]);

  useEffect(() => {
    if (speakerStatus === "ended") setInterviewerStatus("listening");
  }, [speakerStatus]);

  const handleSubmit = () => {
    if (!userTranscript && !hasCodeChanged) {
      toast.warning("Please say something or write code before submitting.");
      return;
    }
    setInterviewerStatus("analyzing");
    fetchGeminiResponse(userTranscript);
    setUserTranscript("");
  };

  const handleEndInterview = async () => {
    try {
      const sessionId = localStorage.getItem("_id");
      if (sessionId) await axios.post(`${SERVER}/api/v1/end/${sessionId}`);
    } catch (e) { console.error(e); }
    localStorage.removeItem("_id");
    navigate("/report", { state: { message: "Session Ended" } });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };
  const stagger = { show: { transition: { staggerChildren: 0.08 } } };

  return (
    /*
     * KEY FIX: Use calc(100vh - 49px) to account for the sticky navbar height.
     * overflow-hidden on the root + flex-col on the inner container ensures
     * the control bar is always pinned at the bottom without any scroll.
     */
    <div
      className="relative bg-[#080c10] text-white font-sans overflow-hidden"
      style={{ height: "calc(100vh - 49px)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace !important; }
        .scroll-thin::-webkit-scrollbar       { width: 3px; }
        .scroll-thin::-webkit-scrollbar-track { background: transparent; }
        .scroll-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        .corner-accent::before, .corner-accent::after {
          content: ''; position: absolute; width: 10px; height: 10px;
          border-color: rgba(34,211,238,0.4); border-style: solid;
        }
        .corner-accent::before { top: 0; left: 0; border-width: 1px 0 0 1px; }
        .corner-accent::after  { bottom: 0; right: 0; border-width: 0 1px 1px 0; }
      `}</style>

      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <Scanlines />
      <Toaster position="bottom-right" richColors />

      {/* ── FULL-HEIGHT FLEX COLUMN — nothing scrolls, sections size themselves ── */}
      <div className="relative z-10 flex flex-col h-full p-3 gap-3">

        {/* 1 ── QUESTION BAR (flex-shrink-0) */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex-shrink-0">
          <div className="relative corner-accent rounded-xl border border-white/6 bg-[#0d1117]/90 backdrop-blur-md px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-400/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 mb-1">Current Question</p>
                <AnimatePresence mode="wait">
                  {gettingGeminiResponse ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      {[0,1,2].map((i) => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                          animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }}
                          transition={{ duration: 0.8, delay: i*0.15, repeat: Infinity }} />
                      ))}
                      <span className="text-sm font-mono text-cyan-400/60">AI is formulating...</span>
                    </motion.div>
                  ) : (
                    <motion.p key={geminiResponse}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-display leading-relaxed text-white/80">
                      {geminiResponse || <span className="text-white/20 font-mono text-xs">Initialising session...</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {geminiResponse && !gettingGeminiResponse && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-white/15" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 2 ── VIDEO ROW (fixed height so it never crowds out the control bar) */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="flex gap-3 flex-shrink-0" style={{ height: "27vh" }}>

          {/* AI Interviewer */}
          <motion.div variants={fadeUp} className="flex-1 relative corner-accent rounded-xl border border-white/6 bg-[#0d1117] overflow-hidden">
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/8 backdrop-blur-md">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">AI Interviewer</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-950/30 via-[#0d1117] to-indigo-950/30">
              <motion.div
                animate={interviewerStatus === "speaking" ? { scale: [1,1.04,1], transition: { repeat: Infinity, duration: 1.8 } } : {}}
                className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-400/15 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400/40" />
                </div>
                <span className="text-[10px] font-mono text-white/20">neural interviewer</span>
              </motion.div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <Speaker response={interviewerStatus === "speaking" ? geminiResponse : ""} speakerStatus={speakerStatus} setSpeakerStatus={setSpeakerStatus} />
            </div>
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <StatusBadge status={interviewerStatus} />
            </div>
            <AnimatePresence>
              {interviewerStatus === "speaking" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-x-0 bottom-0 h-1 flex gap-px overflow-hidden">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <motion.div key={i} className="flex-1 bg-cyan-400/60 origin-bottom"
                      animate={{ scaleY: [0.2, Math.random()*0.8+0.2, 0.2] }}
                      transition={{ duration: 0.4+Math.random()*0.4, repeat: Infinity, delay: Math.random()*0.3 }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* User Camera */}
          <motion.div variants={fadeUp} className="flex-1 relative corner-accent rounded-xl border border-white/6 bg-[#0d1117] overflow-hidden">
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/8 backdrop-blur-md">
              <Video className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">You</span>
            </div>
            <div className="absolute inset-0">
              <Camera cameraStatus={cameraStatus} setCameraStatus={setCameraStatus} />
            </div>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10">
              {interviewerStatus === "listening" ? (
                <MicroPhone setUserTranscript={setUserTranscript} iconSize={28} />
              ) : (
                <div className="px-3 py-1.5 rounded-full bg-black/60 border border-white/8 backdrop-blur-md">
                  <p className="text-[10px] font-mono text-white/30">
                    {interviewerStatus === "speaking" ? "Listen..." : "Processing..."}
                  </p>
                </div>
              )}
            </div>
            {interviewerStatus === "listening" && userTranscript && (
              <div className="absolute bottom-2.5 left-2.5 z-10">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <PulsingDot color="bg-emerald-400" size="w-1.5 h-1.5" />
                  <span className="text-[10px] font-mono text-emerald-400/70">Live</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* 3 ── TRANSCRIPT ROW (flex-1 → absorbs all leftover vertical space) */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="flex gap-3 flex-1 min-h-0">

          {/* AI Transcript */}
          <motion.div variants={fadeUp} className="flex-1 flex flex-col rounded-xl border border-white/6 bg-[#0d1117]/80 backdrop-blur-md overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-white/5 flex-shrink-0">
              <SectionLabel icon={Activity} label="Interviewer Transcript" />
            </div>
            <div ref={aiScrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-3 space-y-3">
              <AnimatePresence initial={false}>
                {aiTranscriptHistory.length === 0 ? (
                  <p className="text-xs font-mono text-white/15">No questions yet...</p>
                ) : (
                  aiTranscriptHistory.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex gap-2.5">
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-cyan-400">{i+1}</span>
                      </div>
                      <p className="text-xs font-display text-white/60 leading-relaxed">{msg}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* User Transcript */}
          <motion.div variants={fadeUp} className="flex-1 flex flex-col rounded-xl border border-white/6 bg-[#0d1117]/80 backdrop-blur-md overflow-hidden">
            <div className="px-4 pt-3 pb-2 border-b border-white/5 flex-shrink-0">
              <SectionLabel icon={Mic} label="Your Answers" />
            </div>
            <div ref={userScrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-3 space-y-3">
              <AnimatePresence>
                {userTranscript && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5 items-start">
                    <PulsingDot color="bg-emerald-400" size="w-1.5 h-1.5 mt-1.5" />
                    <p className="text-xs font-mono text-emerald-400/70 leading-relaxed italic">{userTranscript}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {userTranscriptHistory.length === 0 && !userTranscript ? (
                  <p className="text-xs font-mono text-white/15">Waiting for your response...</p>
                ) : (
                  [...userTranscriptHistory].reverse().map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex gap-2.5">
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-emerald-400">{userTranscriptHistory.length - i}</span>
                      </div>
                      <p className="text-xs font-display text-white/50 leading-relaxed">{msg}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* 4 ── CONTROL BAR (flex-shrink-0 — always visible at bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-white/6 bg-[#0d1117]/90 backdrop-blur-md"
        >
          <button
            onClick={() => setIdeEnabled((v) => !v)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200 text-xs font-mono text-white/50 hover:text-white/80"
          >
            <Code2 className="w-3.5 h-3.5" />
            {ideEnabled ? "Hide IDE" : "Open IDE"}
          </button>

          <motion.button
            onClick={handleSubmit}
            disabled={gettingGeminiResponse}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="relative flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-sm font-display text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #0e7490 0%, #312e81 100%)", boxShadow: "0 0 24px rgba(14,116,144,0.35)" }}
          >
            <motion.div className="absolute inset-0 bg-white/5"
              animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              style={{ width: "50%", skewX: "-20deg" }} />
            <Sparkles className="w-4 h-4 text-cyan-300 relative z-10" />
            <span className="relative z-10">{gettingGeminiResponse ? "Processing..." : "Submit Answer"}</span>
          </motion.button>

          <motion.button
            onClick={handleEndInterview}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 text-xs font-mono text-red-400/70 hover:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            End Session
          </motion.button>
        </motion.div>
      </div>

      {/* IDE OVERLAY */}
      <AnimatePresence>
        {ideEnabled && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 bottom-[68px] top-[30%] z-30 rounded-xl border border-cyan-400/15 bg-[#0a0f15] overflow-hidden shadow-2xl"
            style={{ boxShadow: "0 -20px 60px rgba(14,116,144,0.15)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400/60" />
                <span className="text-xs font-mono text-white/30 tracking-widest uppercase">Code Editor</span>
              </div>
              <button onClick={() => setIdeEnabled(false)}
                className="text-[10px] font-mono px-2.5 py-1 rounded border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15 transition-all">
                close ✕
              </button>
            </div>
            <Ide code={code} setCode={setCode} hasCodeChanged={hasCodeChanged} setHasCodeChanged={setHasCodeChanged} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;