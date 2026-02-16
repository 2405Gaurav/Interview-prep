import { motion } from "framer-motion";
import { MessageSquare, Mail, Linkedin, Github, Globe, ExternalLink } from "lucide-react";
import MeteorBackground from "@/components/magicui/meteors";

const Contact = () => {
      const socialLinks = [
            {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/in/2405Gaurav/",
                  label: "LinkedIn",
                  username: "@2405Gaurav",
            },
            {
                  icon: Github,
                  href: "https://github.com/2405Gaurav",
                  label: "GitHub",
                  username: "@2405Gaurav",
            },
            {
                  icon: Globe,
                  href: "https://thegauravthakur.in/",
                  label: "Website",
                  username: "thegauravthakur.in",
            },
      ];

      return (
            <div className="relative min-h-screen bg-[#050505] pt-16 overflow-hidden">
                  {/* Background Effects */}
                  <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                  <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                  <MeteorBackground />

                  {/* Grain Texture */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                  <div className="relative container mx-auto px-6 py-24">
                        <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="max-w-2xl mx-auto"
                        >
                              {/* Header */}
                              <div className="text-center mb-12">
                                    <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                          className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium tracking-[0.3em] mb-6 uppercase text-gray-400 w-fit mx-auto"
                                    >
                                          <MessageSquare className="w-3 h-3" />
                                          Contact
                                    </motion.div>
                                    
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
                                          Let&apos;s Connect
                                    </h1>
                                    <p className="text-gray-400 text-base md:text-lg font-light">
                                          Feel free to reach out for collaborations or just a friendly chat
                                    </p>
                              </div>

                              {/* Email Card */}
                              <motion.a
                                    href="mailto:gauravthakur83551@gmail.com"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="block mb-8 group"
                              >
                                    <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:bg-white/[0.07]">
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                            <Mail className="w-6 h-6 text-white" />
                                                      </div>
                                                      <div>
                                                            <div className="text-sm text-gray-400 mb-1">Email</div>
                                                            <div className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                                  gauravthakur83551@gmail.com
                                                            </div>
                                                      </div>
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                                          </div>
                                    </div>
                              </motion.a>

                              {/* Social Links */}
                              <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                              >
                                    <div className="text-center mb-6">
                                          <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                                                Connect on
                                          </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          {socialLinks.map((social, index) => (
                                                <motion.a
                                                      key={index}
                                                      href={social.href}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      initial={{ opacity: 0, y: 20 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      transition={{ delay: 0.5 + index * 0.1 }}
                                                      className="group"
                                                >
                                                      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:bg-white/[0.07]">
                                                            <div className="flex flex-col items-center gap-3">
                                                                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-all duration-500">
                                                                        <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                                                  </div>
                                                                  <div className="text-center">
                                                                        <div className="text-sm font-medium text-white mb-1">
                                                                              {social.label}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                              {social.username}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </motion.a>
                                          ))}
                                    </div>
                              </motion.div>

                              {/* Footer Note */}
                              <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center mt-12"
                              >
                                    <p className="text-xs text-gray-600">
                                          Usually respond within 24 hours
                                    </p>
                              </motion.div>
                        </motion.div>
                  </div>
            </div>
      );
};

export default Contact;