import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { queryTemplates } from "../data/query-templates";
import config from "../config.json";

const sparql = new SparqlEndpointFetcher()

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [variables, setVariables] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!init.current) {
      init.current = true;
      setTemplate(queryTemplates.find(t => t.id === id));
    }
  }, [])

  async function runQuery() {
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT, template.query)
    bindingsStream.on("variables", vars =>
      setVariables(vars.map(v => v.value))
    )
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
      setRows(rows => [...rows, resultRow])
    })
  }

  function buildCellContent(row, variable) {
    if (variable.toLowerCase().includes("imageURL".toLowerCase())) {
      return <img src={row.value} title={row.value} width="120" alt="logo"/>
    }
    if (row.termType === "NamedNode") {
      return <span title={row.value}>{row.value.split("#").pop()}</span>
    }
    // literal
    return <span style={{color:"green"}}>{row.value}</span>
  }

  return (
      <div style={{textAlign: "center"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              <button style={{margin: "20px"}} onClick={runQuery}>Run query</button>
              <TableContainer>
                <Table sx={{ width: 600 }}>
                  <TableHead>
                    <TableRow>
                      { variables.map(h => <TableCell align="right" key={h}>{h}</TableCell>) }
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          { variables.map((h, idx) =>
                              <TableCell align="right" key={idx}>{buildCellContent(row[h], h)}</TableCell>
                          )}
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
        }
        { !template && "No template with id " + id + " found" }
      </div>
  );
}

export default Template;
