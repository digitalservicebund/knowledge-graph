import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint"
import Main from "./view/Main";
import Template from "./view/Template";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />}/>
          <Route path="/template/:id" element={<Template />}  />
        </Routes>
        <button onClick={dev}>fuseki</button>
      </BrowserRouter>
  );
}

export default App;
