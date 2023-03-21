import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { queryTemplates } from "../data/query-templates";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import chartjs from "chart.js/auto"; // required for react-chartjs-2
import { Line } from "react-chartjs-2";
import QueryResultsTable from "../component/QueryResultsTable";

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [query, setQuery] = useState();
  const [chartData, setChartData] = useState();
  const demoChartData = {
    labels: ["June 2022", "July", "August", "September", "October", "November", "December", "January 2023", "February", "March"],
    datasets: [{
      label: "Number of employees over time",
      data: [1, 1, 2, 3, 3, 3, 4, 4, 5, 7],
      tension: 0.2
    }]};
  const demoCriteriaStr = "Senior Engineer (React!) + Regular Engineer (React?) + Junior/Regular Design"

  useEffect(() => {
    if (init.current) return
    init.current = true;
    setTemplate(queryTemplates.find(t => t.id === id));
    if (id === "hire-timeline") setChartData(demoChartData); // remove demo-hack TODO
  }, [])

  return (
      <div style={{textAlign: "center", width: "880px"}}>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              { template.choices && template.choices.map(c => {
                return <div key={c.label}>
                  <TextField label={c.label} variant="standard"/>
                  <br/>
                </div>
              })}
              { template.id === "team-assembly" && <>
                <br/><br/>
                <strong>Criteria:</strong>
                <TextField fullWidth variant="standard" value={demoCriteriaStr} />
                <br/><br/>
              </>}
              {!query &&
                  <Button style={{margin: "20px"}} variant="contained" onClick={() => setQuery(template.query)}>
                    Run query
                  </Button>
              }
              <br/>
              {query && <QueryResultsTable query={query} templateId={template.id}/>}
            </>
        }
        { !template && "No template with id " + id + " found" }
        {chartData && query && <><br/><Line data={chartData} /></>}
      </div>
  );
}

export default Template;
