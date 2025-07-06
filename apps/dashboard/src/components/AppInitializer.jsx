// src/components/AppInitializer.jsx
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import useAuthStore from "../store/authStore";

const AppInitializer = ({ children }) => {
  const { checkAuthPrivate } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAuthPrivate();
      setIsChecking(false);
    };
    verify();
  }, []);

  if (isChecking) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export default AppInitializer;
