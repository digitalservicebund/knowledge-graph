import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import { useEffect, useRef, useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { fetchSelect } from "../utils";

function Visualize() {
  const init = useRef(false);
  const [graphData, setGraphData] = useState();
  const [visuMode, setVisuMode] = useState("2D");
  const [dim, setDim] = useState({
    width: window.innerWidth - 30,
    height: window.innerHeight - 145
  });

  useEffect(() => {
    if (!init.current) {
      init.current = true
      buildGraphData().then(() => {})
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleResize = (e) => {
    setDim({
      width: e.target.innerWidth - 40,
      height: e.target.innerHeight - 150
    })
  }

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

    fetchSelect(query, "main", responseJson => {
      console.log("Response: ", responseJson)
      for (let i = 0; i < responseJson.results.bindings.length; i++) {
        let triple = responseJson.results.bindings[i]
        if (triple.s.type === "triple") {
          rdfStarTriples.push(triple)
          continue
        }
        const sub = triple.s.value
        const pred = triple.p.value
        let obj = triple.o.value
        let objKey = obj
        if (triple.o.type === "literal") {
          objKey += "_" + Math.random().toString(36).slice(-5)
        }
        if (!nodes[sub]) nodes[sub] = {
          id: Object.keys(nodes).length,
          label: getLocalName(sub),
          value: sub
        }
        if (!nodes[objKey]) nodes[objKey] = {
          id: Object.keys(nodes).length,
          label: getObjectLabel(triple.o),
          value: obj
        }
        let tripleIdentifier = sub + "_" + pred + "_" + obj
        edges[tripleIdentifier] = {
          id: Object.keys(edges).length,
          identifier: tripleIdentifier,
          source: nodes[sub].id,
          target: nodes[objKey].id,
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
            width={dim.width}
            height={dim.height}
            backgroundColor={"#eee"}
            graphData={graphData}
            nodeLabel="label"
            linkLabel="label"
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
        />}
        {graphData && visuMode === "3D" && <ForceGraph3D
            width={dim.width}
            height={dim.height}
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
