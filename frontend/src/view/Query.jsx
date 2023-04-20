import "../css/Query.css";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import QueryResultsTable from "../component/QueryResultsTable";
import slugify from "slugify";
import { datasetNamesToOneString, fetchInsert, fetchSelect } from "../utils";

function Query() {
  const init = useRef(false);
  const yasgui = useRef();
  const [datasets, setDatasets] = useState({ main: true, meta: false });
  const [queryResultData, setQueryResultData] = useState();

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
    let ds = datasetNamesToOneString(datasets)
    if (ds === "none") {
      alert("No dataset selected")
      return
    }
    const query = yasgui.current.getTab().getQuery()
    fetchSelect(query, ds, responseJson => {
      console.log("Response:", responseJson)
      setQueryResultData({
        variables: responseJson.head.vars,
        rows: responseJson.results.bindings
      })
    })
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
    let insertQuery = "PREFIX : <https://digitalservice.bund.de/kg#> " +
        "INSERT DATA { " +
        "    :" + id + " :isA :QueryTemplate ; " +
        "    :hasTitle \"" + title + "\" ; " +
        (description ? "    :hasDescription \"" + description + "\" ; " : "") +
        "    :hasQuery \"\"\"" + query + "\n\"\"\" . " +
        "}"
    // let runOnDatasets TODO
    fetchInsert(insertQuery, "meta", responseText => console.log("Response:", responseText))
  }

  return (
      <div>
        <h2>Query</h2>
        <div id="yasgui" style={{width: "700px"}} />
        <br/>
        <div style={{paddingBottom: "20px", color: "gray"}}>
          Datasets:
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
        <QueryResultsTable queryResultData={queryResultData} />
      </div>
  );
}

export default Query;
