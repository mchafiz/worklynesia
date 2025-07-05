import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled component for the main content area
const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  //   [theme.breakpoints.up("sm")]: {
  //     marginLeft: 240, // Width of the drawer
  //   },
}));

const ResponsiveLayout = ({
  children,
  drawerOpen = true,
  drawerWidth = 240,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* You can add a responsive AppBar here */}

      {/* You can add a responsive Drawer here */}

      <MainContent
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          pt: { xs: 8, sm: 10 }, // Extra padding for AppBar
          px: { xs: 2, sm: 3 },
        }}
      >
        <Container
          maxWidth={isMobile ? "sm" : isTablet ? "md" : "lg"}
          disableGutters
        >
          {children}
        </Container>
      </MainContent>
    </Box>
  );
};

export default ResponsiveLayout;
