import "../css/Query.css";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import QueryResultsTable from "../component/QueryResultsTable";
import { datasetNamesToOneString, fetchInsert, fetchSelect, uri } from "../utils";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";

function QueryRead() {
  const yasgui = useRef()
  const tags = useRef([])
  const [datasets, setDatasets] = useState({ main: true, meta: false })
  const [queryResultData, setQueryResultData] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)
  const FORM_VALUES_DEFAULT = { title: "", description: "", main: true, meta: false, tags: [], parameters: {} }
  const [formValues, setFormValues] = useState(FORM_VALUES_DEFAULT)
  const INSIDE_ANGLE_BRACKETS_REGEX = /(?<=<)[^<>]+(?=>)/g
  const PARAMETERS_TOOLTIP = [
      "\"Name\" will be shown to the user when asking to parameterize the query. If none is set, the variable you used in the query (e.g. <thisOne>) will be used.",
      "",
      "If no query is set, the user can input free text as value for the parameter. If a query is set, its results determine the choices for the user. These queries can currently only run on the main dataset.",
      "",
      "Note that the query MUST contain a ?value variable and MAY also contain a ?label variable. If ?label is present, that will be displayed to the user while the respective ?value will be filled in.",
      "",
      "If your parameter is to fill a literal it needs to look like this: \"<param>\". If it is to fill an URI it needs to look like this :<param>.",
      "",
      "It is recommended to develop your query in a new tab before pasting it in here.",
  ].join("\n")
  const SCHEMA_TOOLTIP = [
      "This is needed to use the correct vocabulary in the SPARQL query.",
      "",
      "For instance, there are two possible predicates from the DigitalService node to Person nodes:",
      ":hasEmployee and :hasExternalCollaborator"
  ].join("\n")

  useEffect(() => {
    if (yasgui.current) return
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    yasgui.current.getTab().setQuery(
        "PREFIX : <https://digitalservice.bund.de/kg#>\n\n"
        + "SELECT * WHERE { \n  ?subject ?predicate ?object .\n} "
        + "LIMIT 100"
    );
  }, []);

  const fetchTags = (callback) => {
    let query = "PREFIX : <https://digitalservice.bund.de/kg#> "
        + "SELECT DISTINCT ?tag WHERE { "
        + "  ?templateId :isA :QueryTemplate . "
        + "  ?templateId :hasTag ?tag . "
        + "}"
    fetchSelect(query, "meta", responseJson => {
      tags.current = responseJson.results.bindings.map(row => row.tag.value.split("#")[1])
      callback()
    })
  }

  const getQuery = () => {
    return yasgui.current.getTab().getQuery()
  }

  const handleDatasetChange = (event) => {
    const { name, checked } = event.target
    if (!checked && ((name === "main" && !datasets.meta) || (name === "meta" && !datasets.main))) {
      alert("At least one dataset must be selected")
      return
    }
    setDatasets({ ...datasets, [name]: checked })
  }

  const handleDialogFormChange = (event, tags) => {
    if (tags) {
      tags = tags.map((tag) => (tag.startsWith("Add new tag ") ? uri(tag.slice(13, -1)) : uri(tag)))
      setFormValues({ ...formValues, tags: tags })
      return
    }
    const { name, value } = event.target
    if (name.startsWith("param")) {
      let paramId = name.split("-")[1]
      let key = name.split("-")[2]
      setFormValues({ ...formValues,
        parameters: {
          ...formValues.parameters,
          [paramId]: {
            ...formValues.parameters[paramId],
            [key]: value
          }
        }
      })
      return
    }
    setFormValues({ ...formValues, [name]: value })
  }

  const handleDialogOpen = () => {
    const paramIds = getQuery().match(INSIDE_ANGLE_BRACKETS_REGEX).filter(param => !param.startsWith("http"))
    let params = {}
    for (let paramId of paramIds) {
      params[paramId] = { name: "", query: "" }
    }
    setFormValues({ ...formValues, "main": datasets.main, "meta": datasets.meta, parameters: params })
    fetchTags(() => setDialogOpen(true))
  }

  const handleSave = () => {
    let title = formValues.title.trim()
    if (!title) {
      alert("Template must have a title")
      return
    }
    let ds = datasetNamesToOneString({ main: formValues.main, meta: formValues.meta })
    if (ds === "none") {
      alert("At least one dataset must be selected")
      return
    }
    let id = uri(title)
    let description = formValues.description.trim()

    let params = ""
    for (let paramId of Object.keys(formValues.parameters)) {
      let param = formValues.parameters[paramId]
      let triple = ":" + id + " :hasParameter :" + paramId
      params += "    " + triple + " . "
      if (param.name) params += "    <<" + triple + ">> :hasName \"" + param.name + "\" . "
      if (param.query) params += "    <<" + triple + ">> :hasQuery \"" + param.query + "\" . " // use """ syntax? TODO
    }

    let insertQuery = "PREFIX : <https://digitalservice.bund.de/kg#> " +
        "INSERT DATA { " +
        "    :" + id + " :isA :QueryTemplate . " +
        "    :" + id + " :hasTitle \"" + title + "\" . " +
        (description ? "    :" + id + " :hasDescription \"" + description + "\" . " : "") +
        "    :" + id + " :runOnDataset \"" + ds + "\" . " +
        formValues.tags.map((tag) => "    :" + id + " :hasTag :" + tag + " . ").join(" ") +
        "    :" + id + " :hasQuery \"\"\"" + getQuery() + "\n\"\"\" . " +
        (params ? params : "") +
        "}"
    fetchInsert(insertQuery, "meta", responseText => {
      console.log("Response:", responseText)
      setDialogOpen(false)
      setFormValues(FORM_VALUES_DEFAULT)
    })
  }

  const handleFilterOptions = (options, params) => {
    const filtered = options.filter((option) =>
        option.toLowerCase().includes(params.inputValue.toLowerCase()))
    if (params.inputValue !== "" && !options.includes(params.inputValue))
      filtered.push("Add new tag \"" + params.inputValue + "\"")
    return filtered
  }

  async function runQuery() {
    let ds = datasetNamesToOneString(datasets)
    if (ds === "none") {
      alert("No dataset selected")
      return
    }
    fetchSelect(getQuery(), ds, responseJson => {
      console.log("Response:", responseJson)
      setQueryResultData({
        variables: responseJson.head.vars,
        rows: responseJson.results.bindings
      })
    })
  }

  return (
      <div>
        <h2>SPARQL query</h2>
        <div style={{color: "gray", fontSize: "small"}}>
          The data schema can be found on <a style={{color: "gray"}} href="https://miro.com/app/board/uXjVMOiZaKo=" target="_blank">this</a> Miro board
          <Tooltip title={<div style={{ fontSize: "small", whiteSpace: "pre-line" }}>{SCHEMA_TOOLTIP}</div>} arrow>
            <InfoIcon style={{fontSize: "large", color: "lightgray", verticalAlign: "middle", marginLeft: "6px", marginBottom: "2px"}}/>
          </Tooltip>
        </div>
        <br/>
        <div id="yasgui" style={{width: "700px"}} />
        <br/>
        <div style={{paddingBottom: "20px", color: "gray"}}>
          Datasets to run this on:
          <label>
            <input
                type="checkbox"
                name="main"
                checked={datasets.main}
                onChange={handleDatasetChange}
            />
            main
          </label>
          <label>
            <input
                type="checkbox"
                name="meta"
                checked={datasets.meta}
                onChange={handleDatasetChange}
            />
            meta
          </label>
        </div>
        <Button variant="contained" onClick={runQuery}>
          Run query
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="outlined" onClick={handleDialogOpen}>
          Save as template
        </Button>
        { queryResultData && queryResultData.rows.length > 0 && <>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Button variant="outlined" onClick={() => {}} disabled>
            Create plot
          </Button>
        </> }
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Save as template</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ fontSize: "small" }}>
              By saving this query as a template you make it accessible to others.<br/>
              To parameterize your query, write something like <i>:&lt;projectId&gt;</i> at the respective locations in the query.
              For instance instead of <i>?project</i>.
              Users of your template will then be able to choose/set those parameters before running the query.
            </DialogContentText>
            <br/>
            <TextField
                label="Title"
                name="title"
                fullWidth
                variant="standard"
                value={formValues.title}
                onChange={handleDialogFormChange}
            />
            <br/><br/>
            <TextField
                label="Description (optional)"
                name="description"
                fullWidth
                variant="standard"
                value={formValues.description}
                onChange={handleDialogFormChange}
            />
            <br/><br/><br/>
            <Autocomplete
                multiple
                value={formValues.tags}
                onChange={handleDialogFormChange}
                freeSolo
                options={tags.current}
                filterOptions={handleFilterOptions}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            sx={{ backgroundColor: "lightgoldenrodyellow" }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} label="Tags (optional)" placeholder="Type or select" />
                )}
            />
            <br/><br/>
            {Object.keys(formValues.parameters).length > 0 && <>
              <DialogContentText>
                Parameters
                <Tooltip title={<div style={{ fontSize: "small", whiteSpace: "pre-line" }}>{PARAMETERS_TOOLTIP}</div>} arrow>
                  <InfoIcon style={{fontSize: "large", color: "lightgray", verticalAlign: "middle", marginLeft: "6px"}}/>
                </Tooltip>
              </DialogContentText>
              <br/>
              {Object.keys(formValues.parameters).map((paramId, idx) => (
                  <div key={idx}>
                    <TextField
                        label={"Name for: " + paramId}
                        name={"param-" + paramId + "-name"}
                        value={formValues.parameters[paramId].name}
                        onChange={handleDialogFormChange}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <TextField
                        label="Query"
                        name={"param-" + paramId + "-query"}
                        value={formValues.parameters[paramId].query}
                        onChange={handleDialogFormChange}
                    />
                    <br/><br/>
                  </div>
              ))}
            </>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
        <br/><br/>
        <QueryResultsTable queryResultData={queryResultData} />
      </div>
  );
}

export default QueryRead;
