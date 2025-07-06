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
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/layout/Layout";
import AppInitializer from "./components/AppInitializer";
import PublicRoute from "./components/PublicRoute";
import useAuthStore from "./store/authStore";
import { useShallow } from "zustand/react/shallow";
import AttendancePage from "./pages/AttendancePage";
import HistoryAttendancePage from "./pages/HistoryAttendancePage";
import EmployeesPage from "./pages/EmployeesPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuthPrivate, loading } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      checkAuthPrivate: state.checkAuthPrivate,
      loading: state.loading,
    }))
  );

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      checkAuthPrivate();
    }
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      role: state.role,
      loading: state.loading,
    }))
  );

  // if (loading) {
  //   return (
  //     <Box
  //       minHeight="100vh"
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />; // atau tampilkan 403 Page
  }

  return children;
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
                {/* Public Route */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <RoleBasedRoute allowedRoles={["admin", "user"]}>
                        <HomePage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <RoleBasedRoute allowedRoles={["admin", "user"]}>
                        <ProfilePage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/attendance"
                    element={
                      <RoleBasedRoute allowedRoles={["admin", "user"]}>
                        <AttendancePage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/history-attendance"
                    element={
                      <RoleBasedRoute allowedRoles={["admin", "user"]}>
                        <HistoryAttendancePage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="employees"
                    element={
                      <RoleBasedRoute allowedRoles={["admin"]}>
                        <EmployeesPage />
                      </RoleBasedRoute>
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
