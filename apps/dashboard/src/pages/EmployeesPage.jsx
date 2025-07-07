import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  TablePagination,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { userStore } from "../store/userStore.js";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../store/authStore.js";
import { enqueueSnackbar } from "notistack";

const EmployeesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { users, getUsers, createUser, loading, uploadUsers } = userStore(
    useShallow((state) => ({
      users: state.users,
      getUsers: state.getUsers,
      createUser: state.createUser,
      loading: state.loading,
      uploadUsers: state.uploadUsers,
    }))
  );

  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
    role: "user",
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser(formData);
    setOpenDialog(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleImport = async () => {
    if (!csvFile) return;

    try {
      await uploadUsers(csvFile);
      setOpenImportDialog(false);
      enqueueSnackbar(
        "Import sedang diproses di background. Silakan refresh beberapa saat lagi untuk melihat hasilnya.",
        {
          variant: "info",
          autoHideDuration: 8000,
          action: (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                getUsers();
              }}
            >
              Refresh Sekarang
            </Button>
          ),
        }
      );
    } catch {
      enqueueSnackbar("Gagal memproses file CSV", { variant: "error" });
    }
  };

  const handleDownloadExample = () => {
    const csvContent = [
      "email,fullName,phoneNumber,avatarUrl,role",
      "john.doe@example.com,John Doe,+1234567890,https://example.com/avatar1.jpg,user",
      "jane.smith@example.com,Jane Smith,,,admin",
      "alex.wong@example.com,Alex Wong,+1234567891,,user",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees_import_example.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box p={isMobile ? 1 : 3}>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        gap={2}
        mb={3}
      >
        <Typography variant="h5" component="h1" gutterBottom={isMobile}>
          Employees
        </Typography>
        <Box display="flex" gap={2} width={isMobile ? "100%" : "auto"}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            fullWidth={isMobile}
          >
            {isMobile ? "Add" : "Add Employee"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setOpenImportDialog(true)}
            fullWidth={isMobile}
          >
            {isMobile ? "Import" : "Import CSV"}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 200px)" }}>
          <Table
            stickyHeader
            aria-label="employees table"
            size={isMobile ? "small" : "medium"}
          >
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {!isMobile && (
                  <>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {employee.avatarUrl ? (
                          <Box
                            component="img"
                            src={`http://localhost:3001/${employee.avatarUrl}`}
                            alt={employee.fullName}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {employee.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {employee.fullName}
                          </Typography>
                          {isMobile && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {employee.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phoneNumber || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role || "user"}
                            size="small"
                            color={
                              employee.role === "admin" ? "primary" : "default"
                            }
                            variant={
                              employee.role === "admin" ? "filled" : "outlined"
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={employee.isActive}
                            disabled={employee.email === user?.email}
                            onChange={() => {
                              //   toggleActive(employee.id);
                            }}
                            color="primary"
                          />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Employee Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              Add New Employee
              {isMobile && (
                <IconButton edge="end" onClick={() => setOpenDialog(false)}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                margin="normal"
                name="email"
                label="Email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleInputChange}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                margin="normal"
                name="fullName"
                label="Full Name"
                fullWidth
                required
                value={formData.fullName}
                onChange={handleInputChange}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                margin="normal"
                name="phoneNumber"
                label="Phone Number"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleInputChange}
                size={isMobile ? "small" : "medium"}
              />
              <FormControl
                fullWidth
                margin="normal"
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  name="role"
                  labelId="role-label"
                  label="Role"
                  fullWidth
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <MenuItem value="user">Employee</MenuItem>
                  <MenuItem value="admin">HR/Admin</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                <Typography variant="caption" component="div">
                  <strong>Default Password:</strong> p@sswordDefault
                </Typography>
                <Typography variant="caption" component="div">
                  User will be prompted to change their password on first login.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              variant={isMobile ? "outlined" : "text"}
              fullWidth={isMobile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={loading?.createEmployee}
              fullWidth={isMobile}
              startIcon={
                loading?.createEmployee ? <CircularProgress size={20} /> : null
              }
            >
              {loading?.createEmployee ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Import Employees from CSV
            {isMobile && (
              <IconButton edge="end" onClick={() => setOpenImportDialog(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="csv-upload"
          />
          <Box display="flex" flexDirection="column" gap={3} py={1}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              Choose CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadExample}
              fullWidth
              sx={{ py: 2 }}
            >
              Download Example CSV
            </Button>

            {csvFile && (
              <Alert
                severity="info"
                sx={{ mt: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setCsvFile(null)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <Box>
                  <Typography variant="subtitle2">Selected file:</Typography>
                  <Typography variant="body2">{csvFile.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(csvFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              </Alert>
            )}

            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                CSV Format Requirements:
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <strong>email</strong> (required): User's email address
                  </li>
                  <li>
                    <strong>fullName</strong> (required): User's full name
                  </li>
                  <li>
                    <strong>phoneNumber</strong> (optional): User's phone number
                  </li>
                  <li>
                    <strong>avatarUrl</strong> (optional): URL to user's avatar
                    image
                  </li>
                  <li>
                    <strong>role</strong> (required): User role (user or admin)
                  </li>
                </ul>
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenImportDialog(false)}
            variant={isMobile ? "outlined" : "text"}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            color="primary"
            variant="contained"
            disabled={!csvFile || loading?.importUsers}
            fullWidth={isMobile}
            startIcon={
              loading?.importUsers ? <CircularProgress size={20} /> : null
            }
          >
            {loading?.importUsers ? "Importing..." : "Import Users"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;
