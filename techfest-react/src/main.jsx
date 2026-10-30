import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";


createRoot(document.getElementById("root")).render(

    <StrictMode>

        <ThemeProvider>

            <AuthProvider>

                <CartProvider>

                    <App />

                </CartProvider>

            </AuthProvider>

        </ThemeProvider>

    </StrictMode>

);