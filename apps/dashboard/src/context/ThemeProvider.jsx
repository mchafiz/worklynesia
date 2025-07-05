import { useState, useEffect, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { getTheme } from "../theme/theme";
import ThemeContext from "./ThemeContext";

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Load saved theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setMode(savedTheme);
  }, []);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("theme", newMode);
      return newMode;
    });
  };

  // Update the theme only if the mode changes
  const theme = useMemo(() => getTheme(mode), [mode]);
  const contextValue = useMemo(
    () => ({ theme, mode, toggleColorMode }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
