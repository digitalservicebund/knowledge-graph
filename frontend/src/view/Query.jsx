import "../css/Query.css";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import QueryResultsTable from "../component/QueryResultsTable";

function Query() {
  const init = useRef(false);
  const yasgui = useRef();
  const [query, setQuery] = useState();

  useEffect(() => {
    if (init.current) return
    init.current = true;
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    yasgui.current.getTab().setQuery("SELECT * WHERE { \n  ?subject ?predicate ?object .\n}");
    return () => {};
  }, []);

  async function runQuery() {
   setQuery(yasgui.current.getTab().getQuery())
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
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="outlined">
          Save as template
        </Button>
        <br/><br/>
        {query && <QueryResultsTable query={query}/>}
      </div>
  );
}

export default Query;
