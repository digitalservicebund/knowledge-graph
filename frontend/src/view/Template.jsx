import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import QueryResultsTable from "../component/QueryResultsTable";
import { fetchSelect, fetchSelectAwait } from "../utils";
import Autocomplete from "@mui/material/Autocomplete";

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
        + "  OPTIONAL { "
        + "    :" + id + " :hasParameter ?param . "
        + "    OPTIONAL { <<:" + id + " :hasParameter ?param>> :hasName ?paramName . } "
        + "    OPTIONAL { <<:" + id + " :hasParameter ?param>> :hasQuery ?paramQuery . } "
        + "  } "
        + "}"
    fetchSelect(query, "meta", responseJson => {
      console.log("Response:", responseJson)
      let rows = responseJson.results.bindings
      if (rows.length === 0) {
        alert("No template with id " + id + " found")
        return
      }
      processRowsForParams(rows).then(params => {
        setTemplate({
          title: rows[0].title.value,
          description: rows[0].description ? rows[0].description.value : "",
          query: rows[0].query.value,
          parameters: params
        })
      })
    })
  }

  async function processRowsForParams(rows) {
    let params = {}
    for (let row of rows) {
      if (!row.param) continue
      let paramId = row.param.value.split("#")[1]
      params[paramId] = {}
      if (row.paramName) params[paramId].name = row.paramName.value
      if (row.paramQuery) {
        let query = row.paramQuery.value
        params[paramId].query = query
        params[paramId].queryResults = await fetchSelectAwait(query, "main") // support DS choice here too TODO
      }
    }
    return params
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

  function handleParamAutocompleteChange(event, option) {
    console.log(option)
    let value = option.value
    let paramId = option.paramId
    // TODO
  }

  function buildParameterField(paramId) {
    let param = template.parameters[paramId]
    let paramName = param.name ? param.name : paramId

    if (param.query) {
      let hasOnlyValue = param.queryResults.head.vars.length === 1 // if false it has value and label
      const uriOrLiteral = (val) => val.type === "uri" ? val.value.split("#")[1] : val.value
      let options = param.queryResults.results.bindings.map(row => {
        let value = uriOrLiteral(row.value)
        let label = hasOnlyValue ? value : uriOrLiteral(row.label)
        return { label: label, value: value, paramId: paramId }
      })
      return <Autocomplete
          key={paramId}
          options={options}
          renderInput={(params) => <TextField {...params} label={"Choose value for " + paramName} />}
          onChange={handleParamAutocompleteChange}
      />
    }

    return (
      <TextField
          key={paramId}
          label={"Enter value for " + paramName}
          variant="outlined"
          style={{ width: "300px", margin: "10px" }}
      />
    )
  }

  return (
      <div style={{textAlign: "center", width: "880px"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              { template.parameters && Object.keys(template.parameters).length > 0
                  && Object.keys(template.parameters).map(paramId => buildParameterField(paramId)) }
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
