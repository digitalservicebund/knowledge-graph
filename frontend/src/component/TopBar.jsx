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
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { fetchSelect } from "../utils";

const pages = [
    { label: "Templates", path: "/templates" },
    { label: "Query", path: "/query" },
    { label: "Data", path: "/data" },
    { label: "Visualize", path: "/visualize" },
    { label: "Experimental", path: "/experimental" }
];
const settings = ["Settings", "Logout"];

function TopBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElDataset, setAnchorElDataset] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [activeKnowledgeModalOpen, setActiveKnowledgeModalOpen] = useState(false);
  const [activeKnowledgeResultRows, setActiveKnowledgeResultRows] = useState([]);

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

  const checkActiveKnowledge = () => {
    let query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT 
  (?currentProjectName AS ?currentProject)
  ?learning
  (?pastProjectName AS ?pastProject)
  (?pastProjectState AS ?matchingState)
  (?pastTheme AS ?matchingActivity)
  ?pastClient
  ?currentClient
  ?year
  ?author
WHERE {
  # past
  ?learningId :occurredInProject ?pastProjectId .
  ?pastProjectId :hasName ?pastProjectName .
  ?learningId :description ?learning .
  ?learningId :hasTopic ?pastProjectState .
  ?learningId :hasTheme ?pastTheme .
  ?pastProjectId :hasClient ?pastClient .
  ?learningId :occurredInYear ?year .
  ?learningId :addedBy ?authorId .
  ?authorId :hasFullName ?author .
  # current
  ?currentProjectId :isInState ?currentProjectState .
  ?currentProjectId :hasName ?currentProjectName .
  ?currentProjectId :hasClient ?currentClient .
  ?currentProjectId :currentActivity ?currentActivity .
  # matching
  # FILTER(?pastProjectState = ?currentProjectState) .
  FILTER(?pastTheme = ?currentActivity) .
}`
    fetchSelect(query, "main", (responseJson) => {
      setActiveKnowledgeResultRows(responseJson.results.bindings)
      setActiveKnowledgeModalOpen(true)
    })
  }

  const buildLearningStatement = () => {
    let row = activeKnowledgeResultRows[0] // only the first learning will be displayed for now
    let currentProject = row.currentProject.value
    let learning = row.learning.value
    let pastProject = row.pastProject.value
    let matchingState = row.matchingState.value.split("#")[1]
    let matchingActivity = row.matchingActivity.value.split("#")[1]
    let pastClient = row.pastClient.value.split("#")[1]
    let currentClient = row.currentClient.value.split("#")[1]
    let matchingClients = pastClient === currentClient
    return <span>
      The project <strong>{currentProject}</strong>
      { matchingClients ? <> with <strong>{pastClient}</strong> as client is in
        the state <strong>{matchingState}</strong> and </> : " " }
      is doing <strong>{matchingActivity}</strong>. This context matches a learning
      that was saved in the past project <strong>{pastProject}</strong> by <strong>{row.author.value}</strong> in <strong>{row.year.value}</strong>:
      <br/><br/>
      <span style={{color: "gray", fontSize: "large"}}>"</span>
      <span style={{color: "blue"}}>{learning}</span>
      <span style={{color: "gray", fontSize: "large"}}>"</span>
    </span>
  }

  return (
      <div>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <img
                  src="https://user-images.githubusercontent.com/5141792/239685148-d32b9c3d-ef73-466a-afda-c5ed9019b660.png"
                  width="45"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                  alt="Katy DigitalService Logo"
                  onClick={handleLogoClick}
              />
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
                        onClick={checkActiveKnowledge}
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
          { activeKnowledgeResultRows.length > 0 ?
              <>
                <DialogTitle>Potentially relevant learning found!</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {buildLearningStatement()}
                  </DialogContentText>
                </DialogContent>
              </>
              : <>
                <DialogTitle>No new active learning results</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    If you know that there should exist relevant learnings for a given context but they don't show up - let's investigate and improve the pattern!
                  </DialogContentText>
                </DialogContent>
              </>
          }
          <DialogActions>
            <Button onClick={() => setActiveKnowledgeModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              navigate("/template/Learning-matches")
              setActiveKnowledgeModalOpen(false)
            }}>Go to template</Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}
export default TopBar;
