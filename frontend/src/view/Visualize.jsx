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

  async function fetchTriples() {
    const query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o . } LIMIT 3" // TODO support Quad
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT, query)
    const nodes = {}
    const edges = []
    bindingsStream.on("data", resultRow => {
      const s = resultRow.s.value
      const p = resultRow.p.value
      const o = resultRow.o.value
      if (!nodes[s]) nodes[s] = { id: s, label: s.split("#").pop() }
      if (!nodes[o]) nodes[o] = { id: o, label: o.split("#").pop() }
      edges.push({ source: s, target: o, label: p.split("#").pop() })
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
