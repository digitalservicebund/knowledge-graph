import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {queryTemplates} from "../data/query-templates";

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

  return (
      <div>
        { template &&
            <>
              <h2>{template.title}</h2>
              <p>{template.description}</p>
            </>
        }
        { !template && "No template with id " + id + " found" }
      </div>
  );
}

export default Template;
