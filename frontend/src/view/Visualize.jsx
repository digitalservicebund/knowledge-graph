import ForceGraph2D from "react-force-graph-2d";
import { useEffect, useRef, useState } from "react";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import config from "../config.json";
const sparql = new SparqlEndpointFetcher()

function Visualize() {
  const init = useRef(false);
  const [graphData, setGraphData] = useState();

  useEffect(() => {
    if (!init.current) {
      init.current = true
      fetchTriples().then(() => {})
    }
  }, [])

  function getLocalName(uri) {
    return uri.split("#").pop()
  }

  async function fetchTriples() {
    const query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o . } LIMIT 3" // TODO support Quad
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT, query)
    const nodes = {}
    const edges = []
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
      const sub = getLocalName(resultRow.s.value)
      const pred = getLocalName(resultRow.p.value)
      const obj = resultRow.o.termType === "Literal" ?
          ("\"" + resultRow.o.value + "\"") : getLocalName(resultRow.o.value)
      if (!nodes[sub]) nodes[sub] = { id: sub, label: sub }
      if (!nodes[obj]) nodes[obj] = { id: obj, label: obj }
      edges.push({ source: sub, target: obj, label: pred })
    })
    bindingsStream.on("end", () => {
      setGraphData({ nodes: Object.values(nodes), links: edges })
    })
  }

  return (
      <div>
        <br/>
        <h2>Visualize</h2>
        {graphData && <ForceGraph2D
            width={1000}
            height={600}
            backgroundColor={"#eee"}
            graphData={graphData}
            nodeLabel="label"
            linkLabel="label"
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
        />}
      </div>
  );
}

export default Visualize;
