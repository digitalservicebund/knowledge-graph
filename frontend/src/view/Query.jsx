import "../css/Query.css";
import { useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";

function Query() {
  const init = useRef(false);
  const yasgui = useRef();

  useEffect(() => {
    if (init.current) return
    init.current = true;
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    return () => {};
  }, []);

  async function runQuery() {
    console.log(yasgui.current.getTab().getQuery())
    // TODO
  }

  return (
      <div>
        <br/><br/>
        <h2>Query</h2>
        <Button variant="outlined">
          Copy from template
        </Button>
        <br/><br/>
        <div id="yasgui" />
        <br/>
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="outlined">
          Save as template
        </Button>
      </div>
  );
}

export default Query;
