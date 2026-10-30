import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext, lazy, Suspense } from "react";

import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import { ThemeContext } from "./context/ThemeContext";

// Other pages are split into separate files and only downloaded when visited
const Events = lazy(() => import("./pages/Events"));
const Registration = lazy(() => import("./pages/Registration"));
const Login = lazy(() => import("./pages/Login"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={theme}>
            <BrowserRouter>
                <Navbar />

                <Suspense fallback={<p className="loading-msg">Loading...</p>}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>

                <Footer />
            </BrowserRouter>
        </div>
    );
}

export default App;