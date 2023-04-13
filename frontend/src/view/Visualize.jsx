import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import { useEffect, useRef, useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

function Visualize() {
  const init = useRef(false);
  const [graphData, setGraphData] = useState();

  const [visuMode, setVisuMode] = useState("2D");

  useEffect(() => {
    if (!init.current) {
      init.current = true
      buildGraphData().then(() => {})
    }
  }, [])

  function getLocalName(uri) {
    return uri.split("#").pop()
  }

  function getObjectLabel(oObj) {
    return oObj.type === "literal" ?
        ("\"" + oObj.value + "\"") : getLocalName(oObj.value)
  }

  async function buildGraphData() {
    const query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o . }"
    const nodes = {}
    const edges = {}
    const rdfStarTriples = []

    fetch("http://localhost:8080/api/v1/knowthyselves/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      for (let i = 0; i < data.results.bindings.length; i++) {
        let triple = data.results.bindings[i]
        if (triple.s.type === "triple") {
          rdfStarTriples.push(triple)
          continue
        }
        const sub = triple.s.value
        const pred = triple.p.value
        const obj = triple.o.value
        if (!nodes[sub]) nodes[sub] = {
          id: Object.keys(nodes).length,
          label: getLocalName(sub),
          value: sub
        }
        // this logic doesn't work for literals, they need a new node each time TODO
        if (!nodes[obj]) nodes[obj] = {
          id: Object.keys(nodes).length,
          label: getObjectLabel(triple.o),
          value: obj
        }
        let tripleIdentifier = sub + "_" + pred + "_" + obj
        edges[tripleIdentifier] = {
          id: Object.keys(edges).length,
          identifier: tripleIdentifier,
          source: nodes[sub].id,
          target: nodes[obj].id,
          label: getLocalName(pred),
          value: pred
        }
      }
      for (let triple of rdfStarTriples) {
        let refTriple = triple.s.value
        const subTripleIdentifier = refTriple.subject.value + "_"
            + refTriple.predicate.value + "_" + refTriple.object.value
        const predLabel = getLocalName(triple.p.value)
        const objLabel = getObjectLabel(triple.o)
        edges[subTripleIdentifier].label += ", " + predLabel + ": " + objLabel
      }
      const graphData = {
        nodes: Object.values(nodes),
        links: Object.values(edges)
      }
      setGraphData(graphData)
    })
  }

  function handleRadioChange(e) {
    setVisuMode(e.target.value);
  }

  return (
      <div>
        <br/>
        <RadioGroup row defaultValue="2D" onChange={handleRadioChange}>
          <FormControlLabel value="2D" control={<Radio />} label="2D" />
          <FormControlLabel value="3D" control={<Radio />} label="3D" />
        </RadioGroup>
        {graphData && visuMode === "2D" && <ForceGraph2D
            width={1000}
            height={600}
            backgroundColor={"#eee"}
            graphData={graphData}
            nodeLabel="label"
            linkLabel="label"
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
        />}
        {graphData && visuMode === "3D" && <ForceGraph3D
            width={1000}
            height={600}
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
