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
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

const sparql = new SparqlEndpointFetcher()

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [variables, setVariables] = useState([]);
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState();
  /*{labels: ["Jan", "Feb", "Mar"],
    datasets: [{
      label: "Dataset #1",
      data: [10, 50, 40],
      tension: 0.2
    }]}*/

  useEffect(() => {
    if (init.current) return
    init.current = true;
    setTemplate(queryTemplates.find(t => t.id === id));
  }, [])

  async function runQuery() {
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT + "/demo", template.query)
    bindingsStream.on("variables", vars =>
      setVariables(vars.map(v => v.value))
    )
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
      setRows(rows => [...rows, resultRow])
    })
  }

  function buildCellContent(col, variable) {
    if (!col) return
    variable = variable.toLowerCase()
    if (col.termType === "NamedNode") {
      return <span title={col.value}>{col.value.split("#").pop()}</span>
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
    return <span style={{color:"green"}}>{col.value}</span>
  }

  return (
      <div style={{textAlign: "center"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              { template.choices && template.choices.map(c => {
                return <TextField key={c.label} label={c.label} variant="standard"/>
              })}
              { variables.length === 0 &&
                  <Button style={{margin: "20px"}} variant="contained" onClick={runQuery}>
                    Run query
                  </Button>
              }
              <br/>
              <TableContainer>
                <Table sx={{ width: 600 }}>
                  <TableHead>
                    <TableRow>
                      { variables.map(h => <TableCell align="right" key={h}>{h}</TableCell>) }
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((col, idx) => (
                        <TableRow key={idx} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          { variables.map((h, idx) =>
                              <TableCell align="right" key={idx}>{buildCellContent(col[h], h)}</TableCell>
                          )}
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
        }
        { !template && "No template with id " + id + " found" }
        {chartData && <><br/><br/><Line data={chartData} /></>}
      </div>
  );
}

export default Template;
