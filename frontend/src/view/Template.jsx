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
  const [showDetails, setShowDetails] = useState(false);
  const [queryResultData, setQueryResultData] = useState();

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

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
  }

  async function runQuery() {
    let ds = "main" // take from template TODO
    fetchSelect(template.query, ds, responseJson => {
      console.log("Response:", responseJson)
      setQueryResultData({
        variables: responseJson.head.vars,
        rows: responseJson.results.bindings
      })
    })
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
              <div style={{color: "gray", textDecoration: "underline"}} onClick={toggleShowDetails}>
                <small>{showDetails ? "hide" : "show"} details</small>
              </div>
              { showDetails && <pre style={{textAlign: "left", marginLeft: "250px"}}>
                {template.query}
              </pre> }
              <Button style={{margin: "20px"}} variant="contained" onClick={() => runQuery()}>
                Run query
              </Button>
              <br/>
              <QueryResultsTable queryResultData={queryResultData} />
            </>
        }
        { !template && "No template with id " + id + " found" }
      </div>
  );
}

export default Template;
