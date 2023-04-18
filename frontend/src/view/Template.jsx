import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import QueryResultsTable from "../component/QueryResultsTable";
import { fetchSelect } from "../utils";

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [query, setQuery] = useState();
  const [showQuery, setShowQuery] = useState(false);

  useEffect(() => {
    if (init.current) return
    init.current = true;
    fetchTemplate()
  }, [])

  const fetchTemplate = () => {
    let query = "PREFIX : <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "  :" + id + " :isA :QueryTemplate . "
        + "  :" + id + " :hasTitle ?title . "
        + "  OPTIONAL { :" + id + " :hasDescription ?description . } "
        + "  :" + id + " :hasQuery ?query . "
        + "}"
    fetchSelect(query, "meta", responseJson => {
      console.log("Response:", responseJson)
      let row = responseJson.results.bindings[0]
      setTemplate({
        title: row.title.value,
        description: row.description ? row.description.value : "",
        query: row.query.value,
        choices: [] // TODO
      })
    })
  }

  const toggleShowQuery = () => {
    setShowQuery(!showQuery)
  }

  return (
      <div style={{textAlign: "center", width: "880px"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              { template.choices && template.choices.map(c => {
                return <div key={c.label}>
                  <TextField label={c.label} variant="standard"/>
                  <br/>
                </div>
              })}
              <div style={{color: "gray", textDecoration: "underline"}} onClick={toggleShowQuery}>
                <small>{showQuery ? "hide" : "show"} query</small>
              </div>
              { showQuery && <pre style={{textAlign: "left", marginLeft: "250px"}}>
                {template.query}
              </pre> }
              {!query &&
                  <Button style={{margin: "20px"}} variant="contained" onClick={() => setQuery(template.query)}>
                    Run query
                  </Button>
              }
              <br/>
              {query && <QueryResultsTable query={query} datasets={{main: true, meta: false}} />}
            </>
        }
        { !template && "No template with id " + id + " found" }
      </div>
  );
}

export default Template;
