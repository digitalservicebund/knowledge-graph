import { queryTemplates } from "../data/query-templates";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";

function Templates() {
  const navigate = useNavigate();

  const paperStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "rgb(0, 0, 255, 0.08)",
    cursor: "pointer"
  }

  const descStyle = {
    textAlign: "center",
    padding: "10px",
    fontSize: "small"
  }

  const handlePaperClick = (id) => {
    navigate("/template/" + id)
  }

  return (
      <div>
        <br/>
        <h2>Templates</h2>
        <Box
            style={{width: "650px"}}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 200,
                height: 120,
              },
            }}
        >
          { queryTemplates.map(t =>
              <Paper style={paperStyle} key={t.id} elevation={4} onClick={() => handlePaperClick(t.id)}>
                <strong>{t.title}</strong>
                <div style={descStyle}>{t.description}</div>
              </Paper>
          )}
        </Box>
      </div>
  );
}

export default Templates;
