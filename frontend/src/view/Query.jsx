import "../css/Query.css";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import QueryResultsTable from "../component/QueryResultsTable";
import slugify from "slugify";

function Query() {
  const init = useRef(false);
  const yasgui = useRef();
  const [query, setQuery] = useState();
  const [datasets, setDatasets] = useState({ main: true, meta: false });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setDatasets({ ...datasets, [name]: checked });
  };

  useEffect(() => {
    if (init.current) return
    init.current = true;
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    yasgui.current.getTab().setQuery(
        "PREFIX : <https://digitalservice.bund.de/kg#>\n"
        + "SELECT * WHERE { \n  ?subject ?predicate ?object .\n}"
    );
    return () => {};
  }, []);

  async function runQuery() {
    setQuery(yasgui.current.getTab().getQuery())
  }

  function saveAsTemplate() {
    let title = prompt("Enter the title of your template")
    title = title.trim()
    if (!title) {
      alert("Template must have a title")
      return
    }
    let id = slugify(title)
    let description = prompt("Enter an optional description")
    description = description.trim()
    let query = yasgui.current.getTab().getQuery()
    let insertQuery = "PREFIX : <https://digitalservice.bund.de/kg#>\n" +
        "INSERT DATA {\n" +
        "    :" + id + " :isA :QueryTemplate ;\n" +
        "    :hasTitle \"" + title + "\" ;\n" +
        (description ? "    :hasDescription \"" + description + "\" ;\n" : "") +
        "    :hasQuery \"\"\"\n" + query + "\n\"\"\" .\n" +
        "}"
    // let runOnDatasets TODO
    fetch("http://localhost:8080/api/v1/knowthyselves/query/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: insertQuery, dataset: "meta" })
    })
    .then(response => response.text())
    .then(responseText => {
      console.log("Response:", responseText)
    })
  }

  return (
      <div>
        <h2>Query</h2>
        <Button variant="outlined">
          Copy from template
        </Button>
        <br/><br/>
        <div id="yasgui" style={{width: "700px"}} />
        <br/>
        <div style={{paddingBottom: "20px", color: "gray"}}>
          Dataset(s) to query:
          <label>
            <input
                type="checkbox"
                name="main"
                checked={datasets.main}
                onChange={handleCheckboxChange}
            />
            main
          </label>
          <label>
            <input
                type="checkbox"
                name="meta"
                checked={datasets.meta}
                onChange={handleCheckboxChange}
            />
            meta
          </label>
        </div>
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="outlined" onClick={saveAsTemplate}>
          Save as template
        </Button>
        <br/><br/>
        {query && <QueryResultsTable key={query} query={query} datasets={datasets}/>}
      </div>
  );
}

export default Query;
