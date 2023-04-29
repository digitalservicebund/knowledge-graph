import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import fileDownload from "js-file-download";

function QueryResultsTable(props) {

  function buildCellContent(entity, variable) {
    if (!entity) return
    variable = variable.toLowerCase()
    // RDF-star
    if (entity.type === "triple") {
      return <span title="Triple with RDF-star syntax">
        <span>{"<<"}</span>
        {buildCellContent(entity.value.subject, variable)}&nbsp;
        {buildCellContent(entity.value.predicate, variable)}&nbsp;
        {buildCellContent(entity.value.object, variable)}
        <span>{">>"}</span>
      </span>
    }
    // uri
    if (entity.type === "uri") {
      return <span title={entity.value}>{entity.value.split("#").pop()}</span>
    }
    // literal
    if (variable.includes("imageurl")) {
      return <img src={entity.value} title={entity.value} width="60" alt="picture"/>
    }
    if (variable.includes("url")) {
      return <>
        <a href={entity.value} title={entity.value} target="_blank" rel="noreferrer">{variable.split("url")[0]}</a>
        <OpenInNewIcon style={{fontSize: "large", verticalAlign: "middle", marginLeft: "2px"}}/>
      </>
    }
    if (entity.type === "literal" && entity.datatype && entity.datatype === "http://www.w3.org/2001/XMLSchema#date") {
      return <span style={{color:"blue"}}>{entity.value}</span>
    }
    if (entity.type === "literal" && entity.datatype && entity.datatype === "http://www.w3.org/2001/XMLSchema#integer") {
      return <span style={{color:"orange"}}>{entity.value}</span>
    }
    return <span style={{color:"green"}}>{entity.value}</span>
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
                {props.queryResultData.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
                      <TableCell align="left"><span style={{color: "gray", fontSize: "small"}}>{rowIdx + 1}</span></TableCell>
                      {props.queryResultData.variables.map((variable, idx) =>
                          <TableCell align="right" key={idx}>{buildCellContent(row[variable], variable)}</TableCell>
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
