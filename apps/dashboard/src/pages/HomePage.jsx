// src/pages/HomePage.jsx
import { Typography } from "@mui/material";
import useAuthStore from "../store/authStore";
import { useShallow } from "zustand/react/shallow";

const HomePage = () => {
  const { role } = useAuthStore(
    useShallow((state) => ({
      role: state.role,
    }))
  );
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Dashboard
      </Typography>
      <Typography paragraph>
        This is your dashboard. You can navigate using the sidebar menu.
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        Your Role: {role}
      </Typography>
    </>
  );
};

export default HomePage;
