import './App.css';
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint"
const sparql = new SparqlEndpointFetcher()
const config = require("./config.json");

function App() {

  async function dev() {
    const bindingsStream = await sparql.fetchBindings(
        config.SPARQL_ENDPOINT, "SELECT * WHERE { ?s ?p ?o . }")
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          KnowThyselves
        </p>
        <button onClick={dev}>fuseki</button>
      </header>
    </div>
  );
}

export default App;
