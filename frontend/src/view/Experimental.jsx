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
    const [mode, setMode] = useState("field")
    const [input, setInput] = useState("") // Annalena Baerbock / AI, Sustainability
    const [outputs, setOutputs] = useState([])

    const getDelayTime = () => {
        return 2000 + Math.random() * 1000
    }

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

    const searchByField = () => {
        setOutputs([])
        appendOutput(activity("Collecting synonyms from Wikidata"))
        checkSynonymsOnWikidata("wd:Q11660", aiSynonyms => {
            console.log("AI synonyms:", aiSynonyms)
            checkSynonymsOnWikidata("wd:Q219416", sustainabilitySynonyms => {
                console.log("Sustainability synonyms:", sustainabilitySynonyms)
                setTimeout(() => {
                    appendOutput(statement(<>Found synonyms (EN & DE): {aiSynonyms.length} for <strong>AI</strong> and {sustainabilitySynonyms.length} for <strong>Sustainability</strong></>))
                    appendOutput(activity("Checking the Knowledge Graph for all synonyms"))
                    let query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT ?field (COUNT(?person) AS ?count) 
WHERE {
  ?person :worksInField ?field .
  FILTER (?field IN (:AI, :Sustainability))
} GROUP BY ?field`
                    fetchSelect(query, "main", responseJson => {
                        console.log("Response:", responseJson)
                        setTimeout(() => {
                            let rows = responseJson.results.bindings
                            let aiCount = Number(rows.find(row => row["field"].value.split("#")[1] === "AI")["count"].value)
                            let susCount = Number(rows.find(row => row["field"].value.split("#")[1] === "Sustainability")["count"].value)
                            appendOutput(statement(<>Found {aiCount} contacts working in AI, <span style={{ textDecoration: "underline" }}>see who</span></>))
                            setTimeout(() => {
                                appendOutput(statement(<>Found {susCount} contacts working in Sustainability, <span style={{textDecoration: "underline"}}>see who</span></>))
                                query = `
PREFIX : <https://digitalservice.bund.de/kg#>
SELECT * WHERE {
  ?person :workplace ?workplace .
  ?workplace :hasFieldOfWork :Sustainability .
  ?person :hasFullName ?fullName .
  ?person :howDoWeKnowThem ?contactContext .
}`
                                fetchSelect(query, "main", responseJson => {
                                    console.log("Response:", responseJson)
                                    let row = responseJson.results.bindings[0]
                                    let name = row["fullName"].value
                                    let workplace = row["workplace"].value.split("#")[1]
                                    let contactContext = row["contactContext"].value
                                    setTimeout(() => {
                                        appendOutput(statement(<>Found 1 contact in AI whose organisation is in Sustainability:</>))
                                        appendOutput(statement(<li style={{marginLeft: "18px"}}><span style={{textDecoration: "underline"}}>{name}</span>, {contactContext}, {workplace}</li>))
                                        setTimeout(() => {
                                            appendOutput(statement(<>Want to post in <span style={{textDecoration: "underline"}}>#5_ressources</span> to ask for a matching contact?</>))
                                        }, getDelayTime())
                                    }, getDelayTime())
                                })
                            }, getDelayTime())
                        }, getDelayTime())
                    })
                }, getDelayTime())
            })
        })
    }

    async function checkSynonymsOnWikidata(itemId, callback) {
        const aiSynonyms = `
            SELECT ?synonym WHERE {
              ${itemId} skos:altLabel ?synonym .
              FILTER((LANG(?synonym) = "en") || (LANG(?synonym) = "de"))
            }`
        const bindingsStream = await sparql.fetchBindings("https://query.wikidata.org/sparql", aiSynonyms)
        let synonyms = []
        bindingsStream.on("data", row => synonyms.push(row["synonym"].value))
        bindingsStream.on("end", () => callback(synonyms))
    }

    const searchByPerson = () => {
        setOutputs([])
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
                    appendOutput(statement(<>No person with name <strong>{input}</strong> found in contacts</>))
                    setTimeout(() => {
                        appendOutput(activity("Checking Wikidata for infos about this person"))
                        checkOfficeAndPartyOnWikidata((office, party) => {
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
SELECT ?name ?contactContext WHERE { 
  ?person :isInParty "${party}" .
  ?person :hasFullName ?name .
  ?person :howDoWeKnowThem ?contactContext .
} `
                                                        fetchSelect(query, "main", responseJson => {
                                                            console.log("Response:", responseJson)
                                                            let rows = responseJson.results.bindings
                                                            setTimeout(() => {
                                                                appendOutput(statement(<>Found {rows.length} contact{names.length > 1 ? "s" : ""} who is in the <strong>{party}</strong> party:</>))
                                                                for (let row of rows) {
                                                                    let name = row["name"].value
                                                                    let contactContext = row["contactContext"].value
                                                                    appendOutput(statement(<li style={{ marginLeft: "18px" }}><span style={{ textDecoration: "underline" }}>{name}</span>, {contactContext}</li>))
                                                                }
                                                            }, getDelayTime())
                                                        })
                                                    }, getDelayTime())
                                                })
                                            }, getDelayTime())
                                        })
                                    }, getDelayTime())
                                }, getDelayTime())
                            }, getDelayTime())
                        }).then(() => {})
                    }, getDelayTime())
                }
            })
        }, getDelayTime())
    }

    async function checkOfficeAndPartyOnWikidata(callback) {
        const query = `
            SELECT ?person ?personLabel ?position ?positionLabel ?office ?officeLabel ?party ?partyLabel WHERE {
                ?person rdfs:label "Annalena Baerbock"@de.
                ?person p:P39 ?positionStatement.
                ?positionStatement ps:P39 ?position.
                ?position wdt:P2389 ?office.
                ?person wdt:P102 ?party.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
            }`

        const bindingsStream = await sparql.fetchBindings("https://query.wikidata.org/sparql", query)
        bindingsStream.on("variables", vars => {})
        bindingsStream.on("data", data => {
            console.log("Wikidata response:", data)
            let office = data["officeLabel"].value
            let party = data["partyLabel"].value
            callback(office, party)
        })
        bindingsStream.on("end", () => {})
    }

    return (
        <div>
            <br/>
            <h2>Stakeholders</h2>
            <RadioGroup row defaultValue="field" onChange={(e) => setMode(e.target.value)}>
              <FormControlLabel value="field" control={<Radio />} label="Who do we know in this field?"/>
              <FormControlLabel value="person" control={<Radio />} label="What do we know about this Person?"/>
            </RadioGroup>
            <br/>
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
