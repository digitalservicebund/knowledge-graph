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

  const getQuery = () => {
    return yasgui.current.getTab().getQuery()
  }

  async function runQuery() {
    const query = yasgui.current.getTab().getQuery()
    const ds = query.split("#")[1].trim()
    fetchInsert(query, ds, responseJson => console.log("Response:", responseJson))
  }

  return (
      <div>
        <h2>Query</h2>
        <div id="yasgui" style={{width: "700px"}} />
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
      </div>
  );
}

export default QueryWrite;
