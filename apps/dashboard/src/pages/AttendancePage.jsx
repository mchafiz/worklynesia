import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  IconButton,
  Fade,
  Zoom,
  Slide,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  GpsFixed as GpsFixedIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  MyLocation as MyLocationIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorOutlineIcon,
  LocationOff as LocationOffIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { useAttendanceStore } from "../store/attendanceStore";
import { useShallow } from "zustand/react/shallow";
import { format, differenceInHours, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const API_BASE_URL = "http://localhost:3000/api";

export default function AttendancePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const {
    checkIn,
    checkOut,
    isCheckedIn,
    loading,
    setLoading,
    setIsCheckedIn,
    getCurrentUserAttendance,
    currentAttendance,
  } = useAttendanceStore(
    useShallow((state) => ({
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      isCheckedIn: state.isCheckedIn,
      loading: state.loading,
      setLoading: state.setLoading,
      setIsCheckedIn: state.setIsCheckedIn,
      getCurrentUserAttendance: state.getCurrentUserAttendance,
      currentAttendance: state.currentAttendance,
    }))
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formattedDate = format(currentTime, "EEEE, MMMM d, yyyy");
  const formattedTime = format(currentTime, "hh:mm:ss a");

  // Calculate work duration if checked in
  const workDuration = currentAttendance?.checkInAt
    ? differenceInHours(new Date(), parseISO(currentAttendance.checkInAt))
    : 0;

  useEffect(() => {
    const fetchCurrentUserAttendance = async () => {
      try {
        await getCurrentUserAttendance();
      } catch (err) {
        console.error("Error fetching current user attendance:", err);
      }
    };
    fetchCurrentUserAttendance();
  }, []);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setIsRefreshing(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          // update the value of userlocation variable
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          setAddress(data.display_name || "Location details not available");
          setLocation({ lat: latitude, lng: longitude });
        },
        // if there was an error getting the users location
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } catch (err) {
      console.error("Location error:", err);
      if (err.code === 1) {
        setShowPermissionDialog(true);
      } else {
        setError("Unable to retrieve your location. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, [retryCount]);

  const handleRetry = () => {
    setShowPermissionDialog(false);
    setError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  const handleRefreshLocation = () => {
    getLocation();
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await checkIn({
        address,
        lat: location?.lat,
        lng: location?.lng,
      });

      setIsCheckedIn(true);
      showSnackbar("Successfully checked in!", "success");
    } catch (err) {
      showSnackbar(err.message || "Failed to check in", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await checkOut({
        address,
        lat: location?.lat,
        lng: location?.lng,
      });

      setIsCheckedIn(false);
      showSnackbar("Successfully checked out!", "success");
    } catch (err) {
      showSnackbar(err.message || "Failed to check out", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const LoadingScreen = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
      p={3}
    >
      <Fade in={true} timeout={1000}>
        <Box textAlign="center">
          <CircularProgress
            size={isMobile ? 60 : 80}
            thickness={2}
            color="primary"
            sx={{ mb: 3 }}
          />
          <Typography variant="h5" gutterBottom>
            {isRefreshing ? "Updating Location..." : "Getting Your Location"}
          </Typography>
          <Typography variant="body1" color="textSecondary" maxWidth="500px">
            {isRefreshing
              ? "Please wait while we update your location..."
              : "Please wait while we access your device's location. This helps us verify your attendance."}
          </Typography>
          <Box
            mt={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <AccessTimeIcon color="primary" />
            <Typography variant="body1" color="text.primary">
              {formattedTime}
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );

  const ErrorScreen = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      p={3}
      textAlign="center"
    >
      <Zoom in={true} style={{ transitionDelay: "100ms" }}>
        <Box>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Location Access Required
          </Typography>
          <Typography color="textSecondary" paragraph>
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please make sure you've granted location permissions to this site.
          </Typography>
          <Box
            mt={4}
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
            >
              Refresh Page
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
              startIcon={<GpsFixedIcon />}
            >
              Try Again
            </Button>
          </Box>
        </Box>
      </Zoom>
    </Box>
  );

  const PermissionDialog = () => (
    <Dialog
      open={showPermissionDialog}
      onClose={() => {}}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOffIcon color="error" />
          <span>Location Permission Required</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" p={2}>
          <InfoOutlinedIcon
            color="info"
            sx={{ fontSize: 60, mb: 2, opacity: 0.8 }}
          />
          <DialogContentText align="center">
            To check in, we need access to your location. Please follow these
            steps:
          </DialogContentText>

          <Box mt={3} width="100%" maxWidth="400px">
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                On Desktop (Chrome/Edge):
              </Typography>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>Click the lock icon in the address bar</li>
                <li>Set "Location" to "Allow"</li>
                <li>Refresh the page</li>
              </ol>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                On Mobile:
              </Typography>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>Open your device Settings</li>
                <li>Go to Site Settings</li>
                <li>Enable Location permission</li>
                <li>Return and refresh the page</li>
              </ol>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={() => window.location.reload()}
          variant={isMobile ? "outlined" : "text"}
          fullWidth={isMobile}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRetry}
          variant="contained"
          color="primary"
          fullWidth={isMobile}
          startIcon={<GpsFixedIcon />}
        >
          Retry
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && !isRefreshing) {
    return <LoadingScreen />;
  }

  if (error && !showPermissionDialog) {
    return <ErrorScreen />;
  }

  if (showPermissionDialog) {
    return <PermissionDialog />;
  }

  const renderMap = () => (
    <Box
      sx={{
        height: isMobile ? "250px" : "350px",
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        position: "relative",
        "& .leaflet-container": {
          height: "100%",
          width: "100%",
        },
      }}
    >
      {location ? (
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={18}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          zoomAnimation={true}
          fadeAnimation={true}
          whenCreated={(map) => {
            // Disable map zoom with mouse scroll
            map.scrollWheelZoom.disable();
            // Fix map sizing
            setTimeout(() => map.invalidateSize(), 0);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>Your current location</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          bgcolor="action.hover"
          color="text.secondary"
          p={2}
          textAlign="center"
        >
          <LocationOffIcon fontSize="large" sx={{ mb: 1, opacity: 0.7 }} />
          <Typography>Location not available</Typography>
        </Box>
      )}

      <IconButton
        onClick={handleRefreshLocation}
        size="large"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[4],
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        disabled={isRefreshing}
      >
        <RefreshIcon color={isRefreshing ? "disabled" : "primary"} />
      </IconButton>
    </Box>
  );

  const renderLocationInfo = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <LocationOnIcon color="primary" />
        <Typography variant="subtitle2" color="text.secondary">
          Your Current Location
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
          mb: 2,
        }}
      >
        <Typography variant="body2">
          {address || "Location not available"}
        </Typography>
      </Paper>
    </Box>
  );

  const renderCheckInStatus = () => (
    <Box mt={3}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="subtitle2" color="text.secondary">
          ATTENDANCE STATUS
        </Typography>
        <Chip
          label={isCheckedIn ? "CHECKED IN" : "NOT CHECKED IN"}
          color={isCheckedIn ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      </Box>

      {isCheckedIn ? (
        <Box>
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            color="success.main"
            mb={2}
            p={2}
            bgcolor="success.50"
            borderRadius={2}
          >
            <CheckCircleOutlineIcon />
            <Box>
              <Typography variant="subtitle1">You're checked in</Typography>
              <Typography variant="caption" display="block">
                Working for {workDuration}{" "}
                {workDuration === 1 ? "hour" : "hours"}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleCheckOut}
            color="error"
            startIcon={<GpsFixedIcon />}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {loading ? "Processing..." : "Check Out"}
          </Button>
        </Box>
      ) : (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleCheckIn}
          color="primary"
          disabled={!location || loading}
          startIcon={<GpsFixedIcon />}
          sx={{
            py: 2,
            borderRadius: 2,
            fontWeight: "bold",
            textTransform: "none",
            fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(24, 144, 255, 0.4)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(24, 144, 255, 0.5)",
            },
          }}
        >
          {loading ? "Processing..." : "Check In Now"}
        </Button>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Slide direction="down" in={true} timeout={500}>
        <Box mb={4} textAlign="center">
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            gutterBottom
            sx={{
              color: isCheckedIn ? "success.main" : "primary.main",
              fontWeight: "bold",
              letterSpacing: "-0.5px",
            }}
          >
            {isCheckedIn ? "You're Checked In" : "Daily Check-In"}
          </Typography>

          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
            gap={isMobile ? 1 : 3}
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon
                color="primary"
                fontSize={isMobile ? "small" : "medium"}
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="div"
                sx={{
                  color: isCheckedIn ? "success.main" : "primary.main",
                  fontWeight: "500",
                }}
              >
                {formattedTime}
              </Typography>
            </Box>

            <Box
              display={isMobile ? "none" : "block"}
              width="1px"
              height="24px"
              bgcolor="divider"
            />

            <Typography
              variant={isMobile ? "body2" : "subtitle1"}
              color={isCheckedIn ? "success.main" : "primary.main"}
              sx={{
                opacity: 0.9,
                display: isMobile ? "none" : "block",
              }}
            >
              {formattedDate}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: isMobile ? "block" : "none" }}
          >
            {formattedDate}
          </Typography>
        </Box>
      </Slide>

      <Box flex={1} display="flex" flexDirection="column">
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={isCheckedIn ? 8 : 6} lg={isCheckedIn ? 7 : 5}>
            <Fade in={true} timeout={800}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    background: isCheckedIn
                      ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: "white",
                    p: { xs: 2, sm: 3 },
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    position="absolute"
                    right={-40}
                    top={-40}
                    width={200}
                    height={200}
                    borderRadius="50%"
                    bgcolor="rgba(255,255,255,0.1)"
                  />
                  <Box position="relative" zIndex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <MyLocationIcon fontSize="large" />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {isCheckedIn ? "You're Checked In" : "Check In Now"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.9, mt: 0.5 }}
                        >
                          {isCheckedIn
                            ? `Checked in at ${currentAttendance?.checkInAt ? format(parseISO(currentAttendance.checkInAt), "h:mm a") : ""}`
                            : "Your current location will be recorded"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
                  {renderMap()}
                  <Box mt={3}>
                    {renderLocationInfo()}
                    <Divider sx={{ my: 3 }} />
                    {renderCheckInStatus()}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {isCheckedIn && (
            <Grid item xs={12} md={4} lg={5}>
              <Fade in={true} timeout={1000}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`,
                      color: "white",
                      p: { xs: 2, sm: 3 },
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Today's Summary
                    </Typography>
                  </Box>

                  <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          CHECK IN TIME
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          p={2}
                          bgcolor="success.50"
                          borderRadius={2}
                        >
                          <AccessTimeIcon color="success" />
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {currentAttendance?.checkInAt
                                ? format(
                                    parseISO(currentAttendance.checkInAt),
                                    "h:mm a"
                                  )
                                : "--:-- --"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formattedDate}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          WORK DURATION
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          p={2}
                          bgcolor="info.50"
                          borderRadius={2}
                        >
                          <AccessTimeIcon color="info" />
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {workDuration}{" "}
                              {workDuration === 1 ? "hour" : "hours"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Since check in
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          LOCATION
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2 }}
                        >
                          <Typography variant="body2">
                            {currentAttendance?.locationIn ||
                              "Location not recorded"}
                          </Typography>
                        </Paper>
                      </Box>

                      <Box mt="auto">
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            // Handle view details

                            navigate("/history-attendance");
                          }}
                          size="large"
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            py: 1.5,
                          }}
                        >
                          View Full History
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        sx={{
          bottom: { xs: 70, sm: 24 },
        }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            "& .MuiAlert-message": {
              fontWeight: 500,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
