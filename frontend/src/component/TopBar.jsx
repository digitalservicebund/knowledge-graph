// adapted from https://mui.com/material-ui/react-app-bar/#ResponsiveAppBar.js
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import GroupsIcon from "@mui/icons-material/Groups";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

const pages = [
    { label: "Templates", path: "/templates" },
    { label: "Query", path: "/query" },
    { label: "Data", path: "/data" },
    { label: "Visualize", path: "/visualize" }
];
const settings = ["Settings", "Logout"];

function TopBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElDataset, setAnchorElDataset] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [activeKnowledgeModalOpen, setActiveKnowledgeModalOpen] = useState(false);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenDatasetMenu = (event) => setAnchorElDataset(event.currentTarget);
  const handleCloseDatasetMenu = () => setAnchorElDataset(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const datasets = [
    { label: "Demo", id: "demo" },
    { label: "Main", id: "main" },
    { label: "Playground", id: "playground" },
    { label: "+ Add new", id: "new" }
  ];

  const [currentDataset, setCurrentDataset] = useState(datasets[0])

  const handlePageClick = (page) => {
    handleCloseNavMenu();
    navigate(page.path);
  }

  const handleLogoClick = () => {
    navigate("/");
  }

  const handleDatasetClick = (ds) => {
    handleCloseDatasetMenu()
    setCurrentDataset(ds)
  }

  return (
      <div>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <GroupsIcon
                  sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
                  onClick={handleLogoClick}
                  style={{ cursor: "pointer" }}
              />
              <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  onClick={handleLogoClick}
                  sx={{
                    cursor: "pointer",
                    mr: 2,
                    display: { xs: "none", md: "flex" },
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "inherit",
                    textDecoration: "none",
                  }}
              >
                KnowThyselves
              </Typography>

              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                    sx={{
                      display: { xs: "block", md: "none" },
                    }}
                >
                  {pages.map((page) => (
                      <MenuItem key={page.label} onClick={() => handlePageClick(page)}>
                        <Typography textAlign="center">{page.label}</Typography>
                      </MenuItem>
                  ))}
                </Menu>
              </Box>
              <GroupsIcon
                  sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
                  onClick={handleLogoClick}
                  style={{ cursor: "pointer" }}
              />
              <Typography
                  variant="h5"
                  noWrap
                  component="a"
                  onClick={handleLogoClick}
                  sx={{
                    cursor: "pointer",
                    mr: 2,
                    display: { xs: "flex", md: "none" },
                    flexGrow: 1,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "inherit",
                    textDecoration: "none",
                  }}
              >
                KnowThyselves
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pages.map((page) => (
                    <Button
                        key={page.label}
                        onClick={() => handlePageClick(page)}
                        sx={{ my: 2, color: "white", display: "block" }}
                    >
                      {page.label}
                    </Button>
                ))}
              </Box>

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="">
                    <Button
                        /*onClick={handleOpenDatasetMenu}*/
                        onClick={() => setActiveKnowledgeModalOpen(true)}
                        sx={{ my: 2, color: "white", display: "block", marginRight: "10px" }}
                    >
                      {/*Dataset: {currentDataset.label}*/}
                      Check active knowledge
                    </Button>
                </Tooltip>
                {/*<Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElDataset}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElDataset)}
                    onClose={handleCloseDatasetMenu}
                >
                  {datasets.map((ds) => (
                      <MenuItem key={ds.label} onClick={() => handleDatasetClick(ds)}>
                        <Typography textAlign="center">{ds.label}</Typography>
                      </MenuItem>
                  ))}
                </Menu>*/}
              </Box>

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar />
                  </IconButton>
                </Tooltip>
                <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                      <MenuItem key={setting} onClick={handleCloseUserMenu}>
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Dialog open={activeKnowledgeModalOpen} onClose={() => setActiveKnowledgeModalOpen(false)}>
          <DialogTitle>New potentially relevant learning found!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              TODO
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActiveKnowledgeModalOpen(false)}>Close</Button>
            <Button onClick={() => {}}>Go to template</Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}
export default TopBar;
