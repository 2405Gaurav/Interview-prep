import "regenerator-runtime/runtime";
import {
    Route,
    RouterProvider,
    createBrowserRouter,
    createRoutesFromElements,
} from "react-router-dom";
import {
    Layout,
    Hero,
    Form,
    CameraContainer,
    Interview,

    MicroPhone,

    Contact,
    Report,
} from "./components";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<Layout />}>
                <Route path="" element={<Hero />} />
                <Route path="/details" element={<Form />} />
                <Route path="/camera-checkup" element={<CameraContainer />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/about" element={<div>About</div>} />
                <Route path="/contact" element={<Contact />} />
                {/* <Route path="/ide" element={<Ide />} /> */}
                <Route path="/report" element={<Report />} />
                <Route
                    path="/test"
                    element={<MicroPhone response="Hii I am ready" />}
                />
            </Route>
        )
    );

    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;
