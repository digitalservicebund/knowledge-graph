import { useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import config from "../config.json";

const sparql = new SparqlEndpointFetcher()
const DEFAULT_NAMESPACE = "https://digitalservice.bund.de/kg#"
const DEFAULT_NAMESPACE_PREFIX = "ds"

function Data() {
  const [sub, setSub] = useState("");
  const [pred, setPred] = useState("");
  const [obj, setObj] = useState("");
  const handleSubChange = e => { setSub(e.target.value) };
  const handlePredChange = e => { setPred(e.target.value) };
  const handleObjChange = e => { setObj(e.target.value) };

  const [io, setIO] = useState("import");

  function uri(localName) {
    return DEFAULT_NAMESPACE_PREFIX + ":" + localName;
  }

  async function addTriple() {
    let object = obj.startsWith("\"") && obj.endsWith("\"") ? obj : uri(obj);
    const query = "PREFIX " + DEFAULT_NAMESPACE_PREFIX + ": <" + DEFAULT_NAMESPACE + "> "
        + "INSERT DATA { " + uri(sub) + " " + uri(pred) + " " + object + " }";
    await sparql.fetchUpdate(config.SPARQL_ENDPOINT, query);
  }

  function handleRadioChange(e) {
    setIO(e.target.value);
  }

  return (
      <div>
        <br/><br/>
        <p><strong>Add triples manually</strong></p>
        <TextField label="Subject" variant="outlined" value={sub} onChange={handleSubChange} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Predicate" variant="outlined" value={pred} onChange={handlePredChange} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Object" variant="outlined" value={obj} onChange={handleObjChange} />
        <Button style={{margin: "10px 0 0 25px"}} variant="contained" onClick={addTriple}>
          Submit
        </Button>
        <br/><br/><br/>
        <FormControl>
          <RadioGroup row defaultValue="import" name="row-radio-buttons-group" onChange={handleRadioChange}>
            <FormControlLabel value="import" control={<Radio />} label={<strong>Import from</strong>} />
            <FormControlLabel value="export" control={<Radio />} label={<strong>Export to</strong>} />
          </RadioGroup>
        </FormControl>
        <ul>
          <li style={{textDecoration: "underline"}}>RDF/Turtle</li>
          <li style={{textDecoration: "underline"}}>TGF</li>
          <li style={{textDecoration: "underline"}}>SPARQL endpoint</li>
          <li style={{textDecoration: "underline"}}>Markdown</li>
          <li style={{textDecoration: "underline"}}>GraphML</li>
          <li style={{textDecoration: "underline"}}>CSV</li>
          <li style={{textDecoration: "underline"}}>Excel</li>
          <li style={{textDecoration: "underline"}}>Google Spreadsheet</li>
          <li style={{textDecoration: "underline"}}>Confluence page</li>
        </ul>
      </div>
  );
}

export default Data;
