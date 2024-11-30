import React from "react";
import { Outlet } from "react-router";
import { Navbar, Footer } from "./index.js";
const Layout = () => {
    return (
        <div className="bg-[radial-gradient(circle_at_50%_-20%,#3730a3,#312e81,#1f2937)] overflow-x-hidden">
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default Layout;
