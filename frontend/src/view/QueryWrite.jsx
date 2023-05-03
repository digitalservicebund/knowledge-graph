import "../css/Query.css";
import { useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import { fetchInsert } from "../utils";

function QueryWrite() {
  const yasgui = useRef()

  useEffect(() => {
    if (yasgui.current) return
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    yasgui.current.getTab().setQuery(
        "#meta#\n"
        + "PREFIX : <https://digitalservice.bund.de/kg#>\n\n"
        + "DELETE WHERE {\n"
        + "  :ProjectABC :hasQuery ?query .\n"
        + "};\n\n"
        + "INSERT DATA {\n"
        + "  :ProjectABC :hasQuery \"\"\"...\"\"\" .\n"
        + "}"
    );
  }, []);

  async function runQuery() {
    const query = yasgui.current.getTab().getQuery()
    const ds = query.split("#")[1].trim()
    fetchInsert(query, ds, responseJson => console.log("Response:", responseJson))
  }

  const handleFileChange = (e, dataset) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      fetch("http://localhost:8080/api/v1/knowthyselves/io/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "rdf/turtle",
          dataset: dataset,
          turtleFileContent: event.target.result
        })
      })
      .then(response => response.text())
      .then(responseText => {
        console.log("Response text:", responseText)
      })
    }
    reader.readAsText(file)
  }

  return (
      <div>
        <h2>Query</h2>
        <div id="yasgui" style={{width: "700px"}} />
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
        <br/><br/>
        <h3>Upload Turtle file</h3>
        To main:&nbsp;
        <input type="file" onChange={e => handleFileChange(e, "main")}/>
        <br/><br/>
        To meta:&nbsp;
        <input type="file" onChange={e => handleFileChange(e, "meta")}/>
      </div>
  );
}

export default QueryWrite;
