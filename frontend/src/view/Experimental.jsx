import Button from "@mui/material/Button";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
const sparql = new SparqlEndpointFetcher()

function Experimental() {

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
        <h2>Experimental</h2>
        <Button variant="contained" onClick={dev}>
          dev
        </Button>
      </div>
  );
}

export default Experimental;
