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
  const { user, updateProfile, getUserById, logout } = useAuthStore(
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchUserById = async () => {
      await getUserById();
    };
    fetchUserById();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/change-password`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      setSnackbar({
        open: true,
        message: "Password changed successfully!",
        severity: "success",
      });

      logout();
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to change password",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log(user, "woii");
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
            InputLabelProps={{
              shrink: true,
              sx: {
                backgroundColor: "background.paper",
                px: 1,
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: true,
              sx: {
                backgroundColor: "background.paper",
                px: 1,
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            disabled={!editMode || isLoading}
            InputLabelProps={{
              shrink: true,
              sx: {
                backgroundColor: "background.paper",
                px: 1,
              },
            }}
            inputProps={{
              inputMode: "tel",
              pattern: "[0-9+\\-\\s]*",
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

      {/* Add Change Password Section */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>

        {!showPasswordForm ? (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowPasswordForm(true)}
            disabled={isLoading}
          >
            Change Password
          </Button>
        ) : (
          <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
              disabled={isLoading}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
              disabled={isLoading}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
              required
              disabled={isLoading}
              error={!!passwordError}
              helperText={passwordError}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError("");
                }}
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
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Save New Password"
                )}
              </Button>
            </Box>
          </Box>
        )}
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
