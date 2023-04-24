import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import fileDownload from "js-file-download";

function QueryResultsTable(props) {

  function buildCellContent(col, variable, rowIdx) {
    variable = variable.toLowerCase()
    if (!col) return
    if (col.type === "uri") {
      return <span title={col.value}>{col.value.split("#").pop()}</span>
    }
    // RDF-star
    if (col.type === "triple") {
      let triple = col.value
      let rdfStarTripleFull = "<<" + triple.subject.value + " " + triple.predicate.value + " " + triple.object.value + ">>"
      let rdfStarTripleShort = "<<" + triple.subject.value.split("#").pop() + " "
          + triple.predicate.value.split("#").pop() + " "
          + (triple.object.type === "uri" ? triple.object.value.split("#").pop() : triple.object.value) + ">>"
      return <span title={rdfStarTripleFull}>{rdfStarTripleShort}</span>
    }
    // literal
    if (variable.includes("imageurl")) {
      return <img src={col.value} title={col.value} width="60" alt="picture"/>
    }
    if (variable.includes("url")) {
      return <>
        <a href={col.value} title={col.value} target="_blank" rel="noreferrer">{variable.split("url")[0]}</a>
        <OpenInNewIcon style={{fontSize: "large", verticalAlign: "middle", marginLeft: "2px"}}/>
      </>
    }
    return <span style={{color:"green"}}>{col.value === "0" ? "" : col.value}</span>
  }

  function download(type) {
    const vars = props.queryResultData.variables
    const filename = "filename" // TODO
    if (type === "csv") {
      let header = vars.join(",") + "\n"
      let rows = []
      // TODO
      fileDownload(header, filename + ".csv")
      return
    }
    if (type === "json") {
      fileDownload(JSON.stringify(props.queryResultData), filename + ".json");
    }
  }

  return (
      <div>
        {props.queryResultData && <>
          <strong>{props.queryResultData.rows.length} results</strong>
          <small style={{paddingLeft: "10px", color: "gray"}}>
            Download as&nbsp;
            <span style={{textDecoration: "underline"}} onClick={() => download("json")}>JSON</span>
          </small>
          <br/><br/>
          <TableContainer>
            <Table sx={{margin: "0 auto", width: 700}}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {props.queryResultData.variables.map(v =>
                      <TableCell align="right" key={v}><strong>{v}</strong></TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {props.queryResultData.rows.map((col, rowIdx) => (
                    <TableRow key={rowIdx} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
                      <TableCell align="left"><span style={{color: "gray", fontSize: "small"}}>{rowIdx + 1}</span></TableCell>
                      {props.queryResultData.variables.map((v, idx) =>
                          <TableCell align="right" key={idx}>{buildCellContent(col[v], v, rowIdx)}</TableCell>
                      )}
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <br/><br/><br/>
        </>
        }
    </div>
  );
}

export default QueryResultsTable;
