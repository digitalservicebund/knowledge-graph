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

    const DELAY_TIME = 1000

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
        return <div style={{ color: "blue", margin: "10px 10px 10px 40px" }}>
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
                                        query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT
  (COUNT(DISTINCT ?t4gProj) AS ?Tech4GermanyProjects)
  (COUNT(DISTINCT ?w4gProj) AS ?Work4GermanyProjects)
  (COUNT(DISTINCT ?dsProj) AS ?DigitalServiceProjects)
WHERE {
  {
    ?t4gProj :isA :FellowshipProject .
    ?t4gProj :wasInFellowshipProgram :Tech4Germany .
    ?t4gProj :hadParticipatingMinistry ?partner .
  }
  UNION
  {
    ?w4gProj :isA :FellowshipProject .
    ?w4gProj :wasInFellowshipProgram :Work4Germany .
    ?w4gProj :hadParticipatingMinistry ?partner .
  }
  UNION
  {
    ?dsProj :isA :DigitalServiceProject .
    ?dsProj :hasClient ?partner .
  }
  ?partner :hasName "${office}" .
} GROUP BY ?partner`
                                        fetchSelect(query, "main", responseJson => {
                                            console.log("Response:", responseJson)
                                            let row = responseJson.results.bindings[0]
                                            let t4g = Number(row["Tech4GermanyProjects"].value)
                                            let w4g = Number(row["Work4GermanyProjects"].value)
                                            let ds = Number(row["DigitalServiceProjects"].value)
                                            setTimeout(() => {
                                                appendOutput(statement(<>Found {t4g + w4g + ds} projects with <strong>{office}</strong> as partner (click for more info):</>))
                                                t4g > 0 && appendOutput(statement(<li style={{ marginLeft: "18px", textDecoration: "underline" }}>{t4g} Tech4Germany project{t4g > 1 ? "s" : ""}</li>))
                                                w4g > 0 && appendOutput(statement(<li style={{ marginLeft: "18px", textDecoration: "underline" }}>{w4g} Work4Germany project{w4g > 1 ? "s" : ""}</li>))
                                                ds > 0 && appendOutput(statement(<li style={{ marginLeft: "18px", textDecoration: "underline" }}>{ds} DigitalService project{ds > 1 ? "s" : ""}</li>))

                                                query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT ?name WHERE {
  :DigitalService :hasEmployee ?person .
  ?person :hasPreviousWorkplace ?workplace .
  ?workplace :hasName "${office}" .
  ?person :hasFullName ?name .
} `
                                                fetchSelect(query, "main", responseJson => {
                                                    console.log("Response:", responseJson)
                                                    let names = responseJson.results.bindings.map(row => row["name"].value)
                                                    setTimeout(() => {
                                                        appendOutput(statement(<>Found {names.length} employee{names.length > 1 ? "s" : ""} who worked at <strong>{office}</strong> before:</>))
                                                        for (let name of names) {
                                                            appendOutput(statement(<li style={{ marginLeft: "18px", textDecoration: "underline" }}>{name}</li>))
                                                        }
                                                        query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT ?name ?contactContext ?affinityScore WHERE { 
  ?person :isInParty "${party}" .
  ?person :hasFullName ?name .
  ?person :howDoWeKnowThem ?contactContext .
  ?person :dsAffinityScore ?affinityScore .
} `
                                                        fetchSelect(query, "main", responseJson => {
                                                            console.log("Response:", responseJson)
                                                            let rows = responseJson.results.bindings
                                                            setTimeout(() => {
                                                                appendOutput(statement(<>Found {rows.length} contact{names.length > 1 ? "s" : ""} who is in the <strong>{party}</strong> party:</>))
                                                                for (let row of rows) {
                                                                    let name = row["name"].value
                                                                    let contactContext = row["contactContext"].value
                                                                    let affinityScore = row["affinityScore"].value
                                                                    appendOutput(statement(<li style={{ marginLeft: "18px" }}><span style={{ textDecoration: "underline" }}>{name}</span>, {contactContext}, DS affinity score: {affinityScore}</li>))
                                                                }
                                                            }, DELAY_TIME)
                                                        })
                                                    }, DELAY_TIME)
                                                })
                                            }, DELAY_TIME)
                                        })
                                    }, DELAY_TIME)
                                }, DELAY_TIME)
                            }, DELAY_TIME)
                        }).then(() => {})
                    }, DELAY_TIME)
                }
            })
        }, DELAY_TIME)
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
            console.log("Wikidata response:", data)
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
