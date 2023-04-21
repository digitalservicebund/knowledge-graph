import "../css/Query.css";
import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import QueryResultsTable from "../component/QueryResultsTable";
import slugify from "slugify";
import { datasetNamesToOneString, fetchInsert, fetchSelect } from "../utils";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";

function Query() {
  const init = useRef(false)
  const yasgui = useRef()
  const tags = useRef(["experimental"])
  const [datasets, setDatasets] = useState({ main: true, meta: false })
  const [queryResultData, setQueryResultData] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    main: true,
    meta: false,
    tags: []
  })

  useEffect(() => {
    if (init.current) return
    init.current = true;
    yasgui.current = new Yasgui(document.getElementById("yasgui"));
    yasgui.current.getTab().setQuery(
        "PREFIX : <https://digitalservice.bund.de/kg#>\n"
        + "SELECT * WHERE { \n  ?subject ?predicate ?object .\n}"
    );
  }, []);

  const handleDatasetChange = (event) => {
    const { name, checked } = event.target
    setDatasets({ ...datasets, [name]: checked })
    setFormValues({ ...formValues, [name]: checked })
  }

  const handleDialogFormChange = (event, tags) => {
    if (tags) {
      tags = tags.map((tag) => (tag.startsWith("Add new tag ") ? tag.slice(13, -1) : tag))
      setFormValues({ ...formValues, tags: tags })
      return
    }
    const { name, value, checked, type } = event.target
    setFormValues({ ...formValues, [name]: type === "checkbox" ? checked : value })
  }

  const handleSave = () => {
    let title = formValues.title.trim()
    if (!title) {
      alert("Template must have a title")
      return
    }
    let mainDsSelected = formValues.main
    let metaDsSelected = formValues.meta
    if (!mainDsSelected && !metaDsSelected) {
      alert("At least one dataset must be selected")
      return
    }
    let id = slugify(title)
    let description = formValues.description.trim()
    let query = yasgui.current.getTab().getQuery()

    let insertQuery = "PREFIX : <https://digitalservice.bund.de/kg#> " +
        "INSERT DATA { " +
        "    :" + id + " :isA :QueryTemplate ; " +
        "    :hasTitle \"" + title + "\" ; " +
        (description ? "    :hasDescription \"" + description + "\" ; " : "") +
        (mainDsSelected ? "    :runsOnDataset \"main\" ; " : "") +
        (metaDsSelected ? "    :runsOnDataset \"meta\" ; " : "") +
        formValues.tags.map((tag) => "    :hasTag \"" + tag + "\" ; ").join(" ") +
        "    :hasQuery \"\"\"" + query + "\n\"\"\" . " +
        "}"
    fetchInsert(insertQuery, "meta", responseText => {
      console.log("Response:", responseText)
      setDialogOpen(false)
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
    const query = yasgui.current.getTab().getQuery()
    fetchSelect(query, ds, responseJson => {
      console.log("Response:", responseJson)
      setQueryResultData({
        variables: responseJson.head.vars,
        rows: responseJson.results.bindings
      })
    })
  }

  return (
      <div>
        <h2>Query</h2>
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
        <Button variant="outlined" onClick={() => setDialogOpen(true)}>
          Save as template
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Save as template</DialogTitle>
          <DialogContent>
            <DialogContentText>
              By saving this query as a template you make it accessible to others.<br/>
              If you are not sure others will find it useful but you want to
              try things out (please do!), you can add the tag <i>experimental</i>.
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
            <DialogContentText>Datasets to run this on:</DialogContentText>
            <FormControlLabel
                control={
                  <Checkbox
                      disabled
                      name="main"
                      checked={formValues.main}
                      onChange={handleDialogFormChange}
                  />
                }
                label="Main"
            />
            <FormControlLabel
                control={
                  <Checkbox
                      disabled
                      name="meta"
                      checked={formValues.meta}
                      onChange={handleDialogFormChange}
                  />
                }
                label="Meta"
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
                    <TextField {...params} label="Tags" placeholder="Type or select" />
                )}
            />
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

export default Query;
