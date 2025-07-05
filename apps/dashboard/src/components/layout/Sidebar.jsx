// src/components/layout/Sidebar.jsx
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  BarChart as ReportsIcon,
  ShoppingCart as OrdersIcon,
  Store as ProductsIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/", exact: true },
  { text: "Users", icon: <UsersIcon />, path: "/users" },
  { text: "Products", icon: <ProductsIcon />, path: "/products" },
  { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { text: "Reports", icon: <ReportsIcon />, path: "/reports" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const isActive = (itemPath, currentPath) => {
  // Special case for home/dashboard
  if (itemPath === "/") {
    return currentPath === itemPath;
  }
  // For other paths, check if current path starts with the item path
  // and either it's an exact match or the next character is a slash
  return (
    currentPath === itemPath ||
    (currentPath.startsWith(itemPath) &&
      (currentPath.length === itemPath.length ||
        currentPath[itemPath.length] === "/"))
  );
};
const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const drawer = (
    <div>
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            p: 2,
          }}
        >
          <Typography variant="h6" noWrap component="div">
            Worklynesia
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path, location.pathname)}
              sx={{
                color: "text.secondary",
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
                "&:hover": {
                  backgroundColor: "action.hover",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
