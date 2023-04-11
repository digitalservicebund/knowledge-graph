import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { queryTemplates } from "../data/query-templates";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import QueryResultsTable from "../component/QueryResultsTable";

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});
  const [query, setQuery] = useState();

  useEffect(() => {
    if (init.current) return
    init.current = true;
    setTemplate(queryTemplates.find(t => t.id === id));
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
      </div>
  );
}

export default Template;
