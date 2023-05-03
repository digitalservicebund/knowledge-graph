import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import fileDownload from "js-file-download";
import { getTimestamp } from "../utils";

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

  const formats = ["RDF/Turtle", "CSV", "JSON-LD", "TGF", "SPARQL endpoint", "Markdown", "GraphML", "Excel", "Google Spreadsheet", "Confluence page"]
  const [io, setIO] = useState("export");

  const exampleCode = ["Java", "JavaScript", "Python"]

  const paperStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "rgb(255, 255, 0, 0.06)",
    cursor: "pointer"
  }

  const disabledPaperStyle = {
    ...paperStyle,
    backgroundColor: "rgb(150, 150, 150, 0.08)",
  }

  function uri(localName) {
    return DEFAULT_NAMESPACE_PREFIX + ":" + localName;
  }

  async function addTriple() {
    let object = obj.startsWith("\"") && obj.endsWith("\"") ? obj : uri(obj);
    const query = "PREFIX " + DEFAULT_NAMESPACE_PREFIX + ": <" + DEFAULT_NAMESPACE + "> "
        + "INSERT DATA { " + uri(sub) + " " + uri(pred) + " " + object + " }";
    console.log(query)
    // await sparql.fetchUpdate(config.SPARQL_ENDPOINT + "/demo", query);
  }

  function handlePaperClick(format) {
    if (
        // (io === "import" && format === "Markdown") ||
        (io === "export" && (format === "RDF/Turtle" || format === "CSV"))
    ) {
      let dataset = prompt("Which dataset? (main or meta)", "main")
      if (!dataset || !["main", "meta"].includes(dataset)) {
        alert("No (valid) dataset given")
        return
      }
      fetch("http://localhost:8080/api/v1/knowthyselves/io/" + io, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: format.toLowerCase(), dataset: dataset })
      })
      .then(response => response.text())
      .then(data => {
        let filename;
        if (format === "RDF/Turtle") filename = dataset + "-turtle-export-" + getTimestamp() + ".ttls"
        if (format === "CSV") filename = dataset + "-csv-export-" + getTimestamp() + ".csv"
        console.log("Data downloaded, now saving as file:", filename)
        fileDownload(data,  filename)
      })
      return
    }
    alert("Not implemented yet.");
  }

  function handleKeyUp(ev) {
    if (ev.key === "Enter") {
      addTriple();
    }
  }

  function isEnabledFormat(format) {
    if (format === "RDF/Turtle") return true
    return format === "CSV";
  }

  return (
      <div>
        <br/><br/>
        <h2 style={{color: "gray"}}>Edit statements manually</h2>
        <RadioGroup style={{paddingBottom: "15px"}} row defaultValue="add" onChange={(e) => setAddRemove(e.target.value)}>
          <FormControlLabel value="add" control={<Radio />} label="Add" disabled/>
          <FormControlLabel value="update" control={<Radio />} label="Update" disabled/>
          <FormControlLabel value="delete" control={<Radio />} label="Delete" disabled/>
        </RadioGroup>

        <TextField label="Subject" variant="outlined" value={sub} onChange={handleSubChange} onKeyUp={handleKeyUp} disabled/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Predicate" variant="outlined" value={pred} onChange={handlePredChange} onKeyUp={handleKeyUp} disabled/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Object" variant="outlined" value={obj} onChange={handleObjChange} onKeyUp={handleKeyUp} disabled/>
        <Button style={{margin: "10px 0 0 25px"}} variant="contained" onClick={addTriple} disabled>
          Submit
        </Button>
        <br/><br/>
        <h2>Import / Export</h2>
        <RadioGroup row defaultValue="export" onChange={(e) => setIO(e.target.value)}>
          <FormControlLabel value="import" control={<Radio />} label="Import from" disabled/>
          <FormControlLabel value="export" control={<Radio />} label="Export to" />
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
              <Paper style={isEnabledFormat(f) ? paperStyle : disabledPaperStyle} key={f} elevation={2} onClick={() => handlePaperClick(f)}>
                <div style={{textAlign: "center", color: isEnabledFormat(f) ? "black" : "gray"}}>{f}</div>
              </Paper>
          )}
        </Box>
        <br/>
        <h2 style={{color: "gray"}}>Example code</h2>
        <p style={{color: "gray"}}>For accessing the SPARQL endpoints programmatically</p>
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
              <Paper style={disabledPaperStyle} key={e} elevation={2}>
                <div style={{textAlign: "center", color: "gray"}}>{e}</div>
              </Paper>
          )}
        </Box>
      </div>
  );
}

export default Data;
