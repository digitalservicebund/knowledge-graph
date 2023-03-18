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
      setResultData({
        variables: variables,
        rows: rows
      })
    })
  }

  function buildCellContent(col, variable) {
    if (!col) return
    variable = variable.toLowerCase()
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
      if (props.templateId === "list-employees") {
        return <img style={{borderRadius: "30px"}} src="https://fakeface.rest/face/view" title={col.value} width="60"/>
      }
      return <img src={col.value} title={col.value} width="120" alt="logo"/>
    }
    if (variable.includes("url")) {
      return <>
        <a href={col.value} title={col.value} target="_blank" rel="noreferrer">link</a>
        <OpenInNewIcon style={{fontSize: "large", verticalAlign: "middle", marginLeft: "2px"}}/>
      </>
    }
    return <span style={{color:"green"}}>{col.value}</span>
  }

  return (
      <div>
        {resultData &&
          <TableContainer>
            <Table sx={{width: 600}}>
              <TableHead>
                <TableRow>
                  {resultData.variables.map(h => <TableCell align="right" key={h}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {resultData.rows.map((col, idx) => (
                    <TableRow key={idx} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
                      {resultData.variables.map((h, idx) =>
                          <TableCell align="right" key={idx}>{buildCellContent(col[h], h)}</TableCell>
                      )}
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        }
    </div>
  );
}

export default QueryResultsTable;
