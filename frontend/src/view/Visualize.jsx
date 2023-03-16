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

  function getObjectLabel(oObj) {
    return oObj.termType === "Literal" ?
        ("\"" + oObj.value + "\"") : getLocalName(oObj.value)
  }

  async function fetchTriples() {
    const query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o . }"
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT, query)
    const nodes = {}
    const edges = {}
    const rdfStarTriples = []
    bindingsStream.on("data", triple => {
      console.log(triple)
      if (triple.s.termType === "Quad") {
        rdfStarTriples.push(triple)
        return
      }
      const sub = triple.s.value
      const pred = triple.p.value
      const obj = triple.o.value
      if (!nodes[sub]) nodes[sub] = {
        id: Object.keys(nodes).length,
        label: getLocalName(sub),
        value: sub
      }
      if (!nodes[obj]) nodes[obj] = {
        id: Object.keys(nodes).length,
        label: getObjectLabel(triple.o),
        value: obj
      }
      let sourceId = nodes[sub].id
      let targetId = nodes[obj].id
      let tripleIdentifier = sub + "_" + pred + "_" + obj
      edges[tripleIdentifier] = {
        id: Object.keys(edges).length,
        identifier: tripleIdentifier,
        source: sourceId,
        target: targetId,
        label: getLocalName(pred),
        value: pred
      }
    })
    bindingsStream.on("end", () => {
      for (let triple of rdfStarTriples) {
        const subTripleIdentifier =
            triple.s.subject.value + "_" + triple.s.predicate.value + "_" + triple.s.object.value
        const predLabel = getLocalName(triple.p.value)
        const objLabel = getObjectLabel(triple.o)
        edges[subTripleIdentifier].label += ", " + predLabel + ": " + objLabel
      }
      setGraphData({ nodes: Object.values(nodes), links: Object.values(edges) })
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
