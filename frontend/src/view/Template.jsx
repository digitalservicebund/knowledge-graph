import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint"
import { queryTemplates } from "../data/query-templates";
import config from "../config.json";

const sparql = new SparqlEndpointFetcher()

function Template() {
  let { id } = useParams();
  const init = useRef(false);
  const [template, setTemplate] = useState({});

  useEffect(() => {
    if (!init.current) {
      init.current = true;
      setTemplate(queryTemplates.find(t => t.id === id));
    }
  }, [])

  async function runQuery() {
    const bindingsStream = await sparql.fetchBindings(config.SPARQL_ENDPOINT, template.query)
    bindingsStream.on("data", resultRow => {
      console.log(resultRow)
    })
  }

  return (
      <div>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
              <button onClick={runQuery}>Run query</button>
            </>
        }
        { !template && "No template with id " + id + " found" }
      </div>
  );
}

export default Template;
