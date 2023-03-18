import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { queryTemplates } from "../data/query-templates";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Line } from "react-chartjs-2";
import QueryResultsTable from "../component/QueryResultsTable";

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [query, setQuery] = useState();
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

  return (
      <div style={{textAlign: "center"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              { template.choices && template.choices.map(c => {
                return <TextField key={c.label} label={c.label} variant="standard"/>
              })}
              {!query &&
                  <Button style={{margin: "20px"}} variant="contained" onClick={() => setQuery(template.query)}>
                    Run query
                  </Button>
              }
              <br/>
              {query && <QueryResultsTable query={query}/>}
            </>
        }
        { !template && "No template with id " + id + " found" }
        {chartData && <><br/><br/><Line data={chartData} /></>}
      </div>
  );
}

export default Template;
