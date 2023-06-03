import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { fetchSelect } from "../utils";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import BounceLoader from "react-spinners/BounceLoader";
import styled, { keyframes } from "styled-components";
const sparql = new SparqlEndpointFetcher()

function Experimental() {
    const [mode, setMode] = useState("person")
    const [input, setInput] = useState("Annalena Baerbock") // Annalena Baerbock
    const [outputs, setOutputs] = useState([])

    const appendOutput = newOutputEl => {
        setOutputs(currentOutputs => [...currentOutputs, newOutputEl])
    }

    const fadeOut = keyframes`
        0% { opacity: 1; }
        100% { opacity: 0; }
    `;

    const FadingBounceLoader = styled(BounceLoader)`
        animation: ${fadeOut} 2s forwards;
    `;

    const activity = str => {
        return (
            <div style={{ display: "flex", alignItems: "center", color: "gray", margin: "10px" }}>
                <FadingBounceLoader size={20} color="blue"/>
                &nbsp;&nbsp;
                {str}
            </div>
        )
    }

    const statement = str => {
        return <div style={{ color: "darkblue", marginLeft: "40px" }}>
            {str}
        </div>
    }

    async function searchByPerson() {
        appendOutput(activity("Checking the Knowledge Graph ..."))

    let query = `PREFIX : <https://digitalservice.bund.de/kg#>
      SELECT * WHERE { 
        ?person :isA :Person .
        ?person :hasFullName "${input}" .
      }`

        setTimeout(() => {
            fetchSelect(query, "main", responseJson => {
                console.log("Response:", responseJson)
                if (responseJson.results.bindings.length === 0) {
                    appendOutput(statement("No person with name " + input + " found"))
                }
            })
        }, 1000)

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
          <div id="output" style={{ marginTop: "60px" }}>
              { outputs.map((output, idx) => <span key={idx}>{output}</span>) }
          </div>
      </div>
  );
}

export default Experimental;
