import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchSelect } from "../utils";

function Templates() {
  const navigate = useNavigate();

  const init = useRef(false);
  const [templates, setTemplates] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (init.current) return
    init.current = true
    fetchTemplates()
  }, [])

  const fetchTemplates = () => {
    let query = "PREFIX : <https://digitalservice.bund.de/kg#> "
        + "SELECT ?templateId ?title ?description (GROUP_CONCAT(?tag) as ?tags) WHERE { "
        + "    ?templateId :isA :QueryTemplate . "
        + "    ?templateId :hasTitle ?title . "
        + "    OPTIONAL { ?templateId :hasDescription ?description . } "
        + "    OPTIONAL { ?templateId :hasTag ?tag . } "
        + "} GROUP BY ?templateId ?title ?description"
    fetchSelect(query, "meta", responseJson => {
      console.log("Response:", responseJson)
      let distinctTags = {}
      let collectTemplates = []
      for (let row of responseJson.results.bindings) {
        let tagsHere = row.tags ? row.tags.value.split(" ") : []
        collectTemplates.push({
          id: row.templateId.value.split("#")[1],
          title: row.title.value,
          description: row.description ? row.description.value : "",
          tags: tagsHere
        })
        for (let tag of tagsHere) distinctTags[tag] = true
      }
      setTemplates(collectTemplates)
      setTags(Object.keys(distinctTags).sort())
    })
  }

  const paperStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "rgb(0, 0, 255, 0.08)",
    cursor: "pointer"
  }

  const descStyle = {
    textAlign: "center",
    padding: "10px",
    fontSize: "small"
  }

  const handlePaperClick = (id) => {
    navigate("/template/" + id)
  }

  return (
      <div>
        <br/>
        <h2>Templates</h2>
        { /* List tags TODO */ }
        <Box
            style={{width: "650px"}}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 200,
                height: 120,
              },
            }}
        >
          { templates.map(template =>
              <Paper style={paperStyle} key={template.id} elevation={4} onClick={() => handlePaperClick(template.id)}>
                <strong>{template.title}</strong>
                <div style={descStyle}>{template.description}</div>
              </Paper>
          )}
        </Box>
      </div>
  );
}

export default Templates;
