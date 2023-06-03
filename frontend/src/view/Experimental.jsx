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
        return <div style={{ color: "blue", marginLeft: "40px" }}>
            {str}
        </div>
    }

    const searchByPerson = () => {
        appendOutput(activity("Checking the Knowledge Graph"))

        let query = `PREFIX : <https://digitalservice.bund.de/kg#>
          SELECT * WHERE { 
            ?person :isA :Person .
            ?person :hasFullName "${input}" .
          }`

        setTimeout(() => {
            fetchSelect(query, "main", responseJson => {
                console.log("Response:", responseJson)
                if (responseJson.results.bindings.length === 0) {
                    appendOutput(statement(<>No person with name <strong>{input}</strong> found</>))
                    setTimeout(() => {
                        appendOutput(activity("Checking Wikidata for background infos"))
                        checkWikidata((office, party) => {
                            setTimeout(() => {
                                appendOutput(statement(<>Found workplace <strong>{office}</strong> and party <strong>{party}</strong></>))
                                setTimeout(() => {
                                    appendOutput(activity("Checking the Knowledge Graph"))
                                    setTimeout(() => {
                                        // TODO
                                    }, 1000)
                                }, 1000)
                            }, 1000)
                        }).then(() => {})
                    }, 1000)
                }
            })
        }, 1000)
    }

    async function checkWikidata(callback) {
        const wikidataQuery = `
            SELECT ?person ?personLabel ?position ?positionLabel ?office ?officeLabel ?party ?partyLabel WHERE {
                ?person rdfs:label "Annalena Baerbock"@de.
                ?person p:P39 ?positionStatement.
                ?positionStatement ps:P39 ?position.
                ?position wdt:P2389 ?office.
                ?person wdt:P102 ?party.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
            }`

        const bindingsStream = await sparql.fetchBindings("https://query.wikidata.org/sparql", wikidataQuery)
        bindingsStream.on("variables", vars => {})
        bindingsStream.on("data", data => {
            let office = data["officeLabel"].value
            let party = data["partyLabel"].value
            callback(office, party)
        })
        bindingsStream.on("end", () => {})
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
