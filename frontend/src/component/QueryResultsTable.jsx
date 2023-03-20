import { useEffect, useRef, useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import config from "../config.json";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
const sparql = new SparqlEndpointFetcher()

function QueryResultsTable(props) {

  const init = useRef(false);
  const [resultData, setResultData] = useState();
  const [faceURLs, setFaceURLs] = useState([]);

  useEffect(() => {
    if (init.current) return
    init.current = true;
    runQuery().then(() => {})
  }, [])

  async function runQuery() {
    let variables = []
    let rows = []
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT + "/demo", props.query)
    bindingsStream.on("variables", vars =>
        variables = vars.map(v => v.value)
    )
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
      rows.push(resultRow)
    })
    bindingsStream.on("end", () => {
      if (props.templateId === "list-employees") {
        Promise.all(rows.map((_, idx) => fetchRandomFace())).then(result => {
          setFaceURLs(result)
          setResultData({
            variables: variables,
            rows: rows
          })
        })
      } else {
        setResultData({
          variables: variables,
          rows: rows
        })
      }
    })
  }

  async function fetchRandomFace() {
    return await fetch("https://fakeface.rest/face/json?minimum_age=18&maximum_age=67")
        .then(response => response.json())
        .then(data =>  data.image_url)
  }

  const daysOnProject = [139, 96, 48, 11] // remove demo-hack TODO

  function buildCellContent(col, variable, rowIdx) {
    variable = variable.toLowerCase()
    if (props.templateId === "list-employees" && variable === "imageurl") {
      return <img style={{borderRadius: "10px"}} src={faceURLs[rowIdx]} width="50"/>
    }
    if (props.templateId === "project-timeline" && variable === "daysonproject") {
      return <span style={{color:"green"}}>{daysOnProject[rowIdx]}</span>
    }
    if (!col) return
    if (col.termType === "NamedNode") {
      return <span title={col.value}>{col.value.split("#").pop()}</span>
    }
    // RDF-star
    if (col.termType === "Quad") {
      let rdfStarTripleFull = "<<" + col.subject.value + " " + col.predicate.value + " " + col.object.value + ">>"
      let rdfStarTripleShort = "<<" + col.subject.value.split("#").pop() + " "
          + col.predicate.value.split("#").pop() + " "
          + (col.object.termType === "NamedNode" ? col.object.value.split("#").pop() : col.object.value) + ">>"
      return <span title={rdfStarTripleFull}>{rdfStarTripleShort}</span>
    }
    // literal
    if (variable.includes("imageurl")) {
      return <img src={col.value} title={col.value} width="120" alt="logo"/>
    }
    if (variable.includes("url")) {
      return <>
        <a href={col.value} title={col.value} target="_blank" rel="noreferrer">link</a>
        <OpenInNewIcon style={{fontSize: "large", verticalAlign: "middle", marginLeft: "2px"}}/>
      </>
    }
    return <span style={{color:"green"}}>{col.value === "0" ? "" : col.value}</span>
  }

  return (
      <div>
        {resultData && <>
          <TableContainer>
            <Table sx={{width: 700}}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {resultData.variables.map(h =>
                      <TableCell align="right" key={h}><strong>{h}</strong></TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {resultData.rows.map((col, rowIdx) => (
                    <TableRow key={rowIdx} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
                      <TableCell align="left"><span style={{color: "gray", fontSize: "small"}}>{rowIdx + 1}</span></TableCell>
                      {resultData.variables.map((v, idx) =>
                          <TableCell align="right" key={idx}>{buildCellContent(col[v], v, rowIdx)}</TableCell>
                      )}
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {props.templateId === "project-timeline" && <>
              <br/>
              <p style={{color: "blue"}}>Total person days on project: <strong>294</strong></p>
            </>
          }
        </>
        }
    </div>
  );
}

export default QueryResultsTable;
