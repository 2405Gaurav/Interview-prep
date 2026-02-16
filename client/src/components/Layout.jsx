import { Outlet } from "react-router";
import { Navbar, Footer } from "./index.js";

const Layout = () => {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
            {/* --- BACKGROUND ARCHITECTURE --- */}
            {/* Dynamic Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s] pointer-events-none" />
            
            {/* Grain Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[1]" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;