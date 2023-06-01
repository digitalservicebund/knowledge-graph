import Button from "@mui/material/Button";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import {useState} from "react";
const sparql = new SparqlEndpointFetcher()

function Experimental() {
  const [mode, setMode] = useState("person")
  const [input, setInput] = useState("")

  async function dev() {
    const personName = "Annalena Baerbock"
    const query = `
      SELECT ?person ?personLabel ?position ?positionLabel ?office ?officeLabel WHERE {
        ?person rdfs:label "${personName}"@de.
        ?person p:P39 ?positionStatement.
        ?positionStatement ps:P39 ?position.
        ?position wdt:P2389 ?office.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
      }`

    const bindingsStream = await sparql.fetchBindings("https://query.wikidata.org/sparql", query)
    bindingsStream.on("variables", vars =>
        console.log("variables:", vars)
    )
    bindingsStream.on("data", data => {
      console.log("data:", data)
    })
    bindingsStream.on("end", () => {
      console.log("end")
    })
  }

  return (
      <div>
        <br/>
        <h2>Stakeholders</h2>
        <RadioGroup row defaultValue="person" onChange={(e) => setMode(e.target.value)}>
          <FormControlLabel value="person" control={<Radio />} label="What do we know about this Person?"/>
          <FormControlLabel value="field" control={<Radio />} label="Who do we know in this field?"/>
        </RadioGroup>
        <br/><br/>
        <TextField
            label={mode === "person" ? "Name" : "Field"}
            value={input}
            style={{ width: "350px" }}
            onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={dev} style={{margin: "9px 0 0 25px"}}>
          Search
        </Button>
      </div>
  );
}

export default Experimental;
