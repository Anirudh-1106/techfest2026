import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";

import "./App.css";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import { ThemeContext } from "./context/ThemeContext";

function App() {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={theme}>
            <BrowserRouter>
                <Navbar />

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
            </BrowserRouter>
        </div>
    );
}

export default App;