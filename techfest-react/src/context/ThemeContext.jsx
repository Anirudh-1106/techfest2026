import { createContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState("light");

    function toggleTheme() {

        if (theme === "light") {

            setTheme("dark");

        } else {

            setTheme("light");

        }

    }

    return (

        <ThemeContext.Provider
            value={{
                theme: theme,
                toggleTheme: toggleTheme
            }}
        >

            {children}

        </ThemeContext.Provider>

    );

}