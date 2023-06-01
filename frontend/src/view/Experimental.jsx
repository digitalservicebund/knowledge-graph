import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { fetchSelect } from "../utils";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
const sparql = new SparqlEndpointFetcher()

function Experimental() {
  const [mode, setMode] = useState("person")
  const [input, setInput] = useState("") // Annalena Baerbock

  async function searchByPerson() {
    let query = `PREFIX : <https://digitalservice.bund.de/kg#>
      SELECT * WHERE { 
        ?person :isA :Person .
        ?person :hasFullName "${input}" .
      }`
    fetchSelect(query, "main", responseJson => {
      console.log("Response:", responseJson)
      if (responseJson.results.bindings.length === 0) {
        // TODO
      }
    })

    const wikidataQuery = `
      SELECT ?person ?personLabel ?position ?positionLabel ?office ?officeLabel WHERE {
        ?person rdfs:label "${input}"@de.
        ?person p:P39 ?positionStatement.
        ?positionStatement ps:P39 ?position.
        ?position wdt:P2389 ?office.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
      }`

    const bindingsStream = await sparql.fetchBindings("https://query.wikidata.org/sparql", wikidataQuery)
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

  const searchByField = () => {
    // TODO
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
        <Button variant="contained" onClick={() => mode === "person" ? searchByPerson() : searchByField()} style={{margin: "9px 0 0 25px"}}>
          Search
        </Button>
      </div>
  );
}

export default Experimental;
