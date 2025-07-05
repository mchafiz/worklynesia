// src/App.jsx
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import CustomThemeProvider from "./context/ThemeProvider";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import useAuthStore from "./store/authStore";
import Layout from "./components/layout/Layout";
import { useShallow } from "zustand/react/shallow";
import PublicRoute from "./components/PublicRoute";
import ProfilePage from "./pages/PorfilePage";
import AppInitializer from "./components/AppInitializer";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth, loading } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      checkAuth: state.checkAuth,
      loading: state.loading,
    }))
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <Router>
            <AppInitializer>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<HomePage />} />

                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute allowedRoles={["user", "admin"]}>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </AppInitializer>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </SnackbarProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
