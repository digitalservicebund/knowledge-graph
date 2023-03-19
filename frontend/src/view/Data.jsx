import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import config from "../config.json";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const sparql = new SparqlEndpointFetcher()
const DEFAULT_NAMESPACE = "https://digitalservice.bund.de/kg#"
const DEFAULT_NAMESPACE_PREFIX = "ds"

function Data() {
  const [sub, setSub] = useState("");
  const [pred, setPred] = useState("");
  const [obj, setObj] = useState("");
  const handleSubChange = e => { setSub(e.target.value) };
  const handlePredChange = e => { setPred(e.target.value) };
  const handleObjChange = e => { setObj(e.target.value) };

  const [addRemove, setAddRemove] = useState("add");

  const formats = ["RDF/Turtle", "JSON-LD", "TGF", "SPARQL endpoint", "Markdown", "GraphML", "CSV", "Excel", "Google Spreadsheet", "Confluence page"]
  const [io, setIO] = useState("import");

  const exampleCode = ["Java", "JavaScript", "Python"]

  const paperStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "rgb(255, 255, 0, 0.06)",
    cursor: "pointer"
  }

  function uri(localName) {
    return DEFAULT_NAMESPACE_PREFIX + ":" + localName;
  }

  async function addTriple() {
    let object = obj.startsWith("\"") && obj.endsWith("\"") ? obj : uri(obj);
    const query = "PREFIX " + DEFAULT_NAMESPACE_PREFIX + ": <" + DEFAULT_NAMESPACE + "> "
        + "INSERT DATA { " + uri(sub) + " " + uri(pred) + " " + object + " }";
    await sparql.fetchUpdate(config.SPARQL_ENDPOINT + "/demo", query);
  }

  function handlePaperClick(format) {
    if (
        (io === "import" && format === "Markdown") ||
        (io === "export" && format === "RDF/Turtle")
    ) {
      fetch("http://localhost:8080/api/v1/knowthyselves/io/" + io, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: format.toLowerCase() })
      })
      .then(response => response.text())
      .then(data => console.log(data));
      return
    }
    alert("Not implemented yet.");
  }

  function handleKeyUp(ev) {
    if (ev.key === "Enter") {
      addTriple();
    }
  }

  return (
      <div>
        <br/><br/>
        <p><strong>Edit statements manually</strong></p>
        <RadioGroup style={{paddingBottom: "15px"}} row defaultValue="add" onChange={(e) => setAddRemove(e.target.value)}>
          <FormControlLabel value="add" control={<Radio />} label={<strong>Add</strong>} />
          <FormControlLabel value="update" control={<Radio />} label={<strong>Update</strong>} />
          <FormControlLabel value="delete" control={<Radio />} label={<strong>Delete</strong>} />
        </RadioGroup>

        <TextField label="Subject" variant="outlined" value={sub} onChange={handleSubChange} onKeyUp={handleKeyUp} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Predicate" variant="outlined" value={pred} onChange={handlePredChange} onKeyUp={handleKeyUp} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Object" variant="outlined" value={obj} onChange={handleObjChange} onKeyUp={handleKeyUp} />
        <Button style={{margin: "10px 0 0 25px"}} variant="contained" onClick={addTriple}>
          Submit
        </Button>
        <br/><br/><br/>
        <RadioGroup row defaultValue="import" onChange={(e) => setIO(e.target.value)}>
          <FormControlLabel value="import" control={<Radio />} label={<strong>Import from</strong>} />
          <FormControlLabel value="export" control={<Radio />} label={<strong>Export to</strong>} />
        </RadioGroup>
        <br/>
        <Box
            style={{width: "800px"}}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 120,
                height: 60,
              },
            }}
        >
          {formats.map(f =>
              <Paper style={paperStyle} key={f} elevation={2} onClick={() => handlePaperClick(f)}>
                <div style={{textAlign: "center"}}>{f}</div>
              </Paper>
          )}
        </Box>
        <br/>
        <p><strong>Example code for accessing the SPARQL endpoints programmatically</strong></p>
        <Box
            style={{width: "800px"}}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 120,
                height: 60,
              },
            }}
        >
          {exampleCode.map(e =>
              <Paper style={paperStyle} elevation={2}>
                <div style={{textAlign: "center"}}>{e}</div>
              </Paper>
          )}
        </Box>
      </div>
  );
}

export default Data;
