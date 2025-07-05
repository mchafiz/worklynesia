import { IconButton, Tooltip } from "@mui/material";
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from "@mui/icons-material";
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle theme"
      >
        {mode === "light" ? <DarkIcon /> : <LightIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
