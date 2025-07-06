import React, { useState, useEffect } from "react";
import { enGB } from "date-fns/locale";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Chip,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse,
  TablePagination,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { format, subDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAttendanceStore } from "../store/attendanceStore";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
} from "@mui/icons-material";

const HistoryAttendancePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getHistory, loading, error } = useAttendanceStore();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHistory = async () => {
    try {
      const from = format(dateRange.from, "yyyy-MM-dd");
      const to = format(dateRange.to, "yyyy-MM-dd");
      const history = await getHistory(from, to);
      setAttendanceHistory(history);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dateRange, statusFilter]);

  const handleDateChange = (field) => (newValue) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const sortedData = [...attendanceHistory]
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === "asc" ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "wfh":
        return "info";
      case "sick":
        return "warning";
      case "leave":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return format(parseISO(dateTime), "PPpp", { locale: id });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";
    return format(parseISO(dateTime), "HH:mm", { locale: id });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading attendance history: {error}
        </Typography>
      </Box>
    );
  }

  const renderMobileView = () => (
    <Box>
      {sortedData
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((attendance) => (
          <Card key={attendance.id} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              onClick={() => handleRowClick(attendance.id)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {format(parseISO(attendance.date), "EEEE, d MMMM yyyy", {
                    locale: id,
                  })}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Chip
                    label={attendance.status.toUpperCase()}
                    color={getStatusColor(attendance.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Box display="flex" alignItems="center" mr={2}>
                    <TimeIcon
                      color="action"
                      fontSize="small"
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(attendance.checkInAt)} -{" "}
                      {formatTime(attendance.checkOutAt) || "--:--"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {expandedRow === attendance.id ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </Box>

            <Collapse
              in={expandedRow === attendance.id}
              timeout="auto"
              unmountOnExit
            >
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      DETAIL KEHADIRAN
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TodayIcon
                        color="action"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {format(
                          parseISO(attendance.date),
                          "EEEE, d MMMM yyyy",
                          { locale: id }
                        )}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon
                        color="action"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        <strong>Masuk:</strong>{" "}
                        {formatDateTime(attendance.checkInAt) || "-"}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <TimeIcon
                        color="action"
                        fontSize="small"
                        sx={{ mr: 1, opacity: 0 }}
                      />
                      <Typography variant="body2">
                        <strong>Pulang:</strong>{" "}
                        {formatDateTime(attendance.checkOutAt) || "-"}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="flex-start" mt={2}>
                      <LocationIcon
                        color="action"
                        fontSize="small"
                        sx={{ mr: 1, mt: 0.5 }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          LOKASI
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Masuk:</strong> {attendance.locationIn || "-"}
                        </Typography>
                        {attendance.locationOut && (
                          <Typography variant="body2">
                            <strong>Pulang:</strong> {attendance.locationOut}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        ))}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
        }
      />
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 300px)" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === "date"}
                direction={orderBy === "date" ? order : "asc"}
                onClick={() => handleRequestSort("date")}
              >
                Tanggal
              </TableSortLabel>
            </TableCell>
            <TableCell>Check In</TableCell>
            <TableCell>Check Out</TableCell>
            <TableCell>Lokasi</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((attendance) => (
              <TableRow
                key={attendance.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  {format(parseISO(attendance.date), "EEEE, d MMMM yyyy", {
                    locale: id,
                  })}
                </TableCell>
                <TableCell>{formatDateTime(attendance.checkInAt)}</TableCell>
                <TableCell>
                  {formatDateTime(attendance.checkOutAt) || "-"}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Masuk:</strong> {attendance.locationIn || "-"}
                    </Typography>
                    {attendance.locationOut && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Pulang:</strong> {attendance.locationOut}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={attendance.status.toUpperCase()}
                    color={getStatusColor(attendance.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
        }
      />
    </TableContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <Box p={isMobile ? 1 : 3}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Riwayat Kehadiran
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            useFlexGap
            flexWrap="wrap"
          >
            <DatePicker
              label="Dari Tanggal"
              value={dateRange.from}
              onChange={handleDateChange("from")}
              inputFormat="dd/MM/yyyy"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              )}
            />
            <DatePicker
              label="Sampai Tanggal"
              value={dateRange.to}
              onChange={handleDateChange("to")}
              inputFormat="dd/MM/yyyy"
              minDate={dateRange.from}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              )}
            />
            <FormControl
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? "100%" : 200 }}
              size={isMobile ? "small" : "medium"}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="present">Hadir</MenuItem>
                <MenuItem value="wfh">WFH</MenuItem>
                <MenuItem value="sick">Sakit</MenuItem>
                <MenuItem value="leave">Cuti</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={fetchHistory}
              sx={{
                minWidth: isMobile ? "100%" : "auto",
                height: isMobile ? "40px" : "56px",
              }}
            >
              Terapkan
            </Button>
          </Stack>
        </Paper>

        {isMobile ? renderMobileView() : renderDesktopView()}
      </Box>
    </LocalizationProvider>
  );
};

export default HistoryAttendancePage;
