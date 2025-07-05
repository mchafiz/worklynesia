// src/pages/ProfilePage.jsx
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../store/authStore";
import { PhotoCamera } from "@mui/icons-material";

const ProfilePage = () => {
  const { user, updateProfile, getUserById } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
      updateProfile: state.updateProfile,
      getUserById: state.getUserById,
    }))
  );

  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
  });

  useEffect(() => {
    console.log(user);
    if (user) {
      getUserById(user.id);

      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      // Here you would typically upload the file to your server
      // For now, we'll create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatar: imageUrl,
        avatarFile: file, // Store the file object for later upload
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload image",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically send the form data to your API
      await updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar, // This would be the URL from your server
      });

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            position: "relative",
          }}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
            disabled={!editMode || isLoading}
          />
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={formData.avatar}
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                mb: 2,
                bgcolor: "primary.main",
              }}
            >
              {formData.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            {editMode && (
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                disabled={isLoading}
              >
                <PhotoCamera />
              </IconButton>
            )}
          </Box>

          <Typography variant="h5" component="h1" gutterBottom>
            {formData.fullName}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {formData.email}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            margin="normal"
            disabled={!editMode || isLoading}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled // Email is typically not editable
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            disabled={!editMode || isLoading}
            inputProps={{
              inputMode: "tel",
              pattern: "[0-9+\\-\\s]*", // Simple phone number pattern
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
            }}
          >
            {editMode ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
