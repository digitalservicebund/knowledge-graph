import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchSelect } from "../utils";
import Tooltip from "@mui/material/Tooltip";

function Templates() {
  const navigate = useNavigate();

  const init = useRef(false);
  const [templates, setTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const MAX_LENGTH_TAG = 20
  const MAX_LENGTH_TITLE = 24
  const MAX_LENGTH_DESCRIPTION = 62
  const MAX_LENGTH_TAGS = 30

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
        let tagsHere = row.tags ? row.tags.value.split(" ").map(tag => tag.split("#")[1]) : []
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

  const handleTagClick = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const filterTemplate = template => {
    for (let tag of selectedTags) {
      if (!template.tags.includes(tag)) return false
    }
    return true
  }

  const getTemplateCount = () => {
    let count = 0
    let str = "Showing "
    for (let template of templates) if (filterTemplate(template)) count ++
    switch (count) {
      case 0: str += "none of the"; break;
      case templates.length: str += "all"; break;
      default: str += count; break;
    }
    return str + " of the " + templates.length + " templates"
  }

  const getConcatenatedTags = template => {
    let str = ""
    for (let tag of template.tags) str += "#" + tag + " "
    return str
  }

  const isShortened = template => {
    return template.title.length > MAX_LENGTH_TITLE
        || template.description.length > MAX_LENGTH_DESCRIPTION
        || getConcatenatedTags(template).length > MAX_LENGTH_TAGS
  }

  const shortenStrings = (str, max) => {
    if (str.length > max) str = str.substring(0, max).trim() + "..."
    return str
  }

  const buildPaper = (template) => {
    return <Paper key={template.id} style={paperStyle} elevation={4} onClick={() => handlePaperClick(template.id)}>
      <strong>{shortenStrings(template.title, MAX_LENGTH_TITLE)}</strong>
      <div style={descStyle}>{shortenStrings(template.description, MAX_LENGTH_DESCRIPTION)}</div>
      <span style={{ fontSize: "small", color: "gray"}}>{shortenStrings(getConcatenatedTags(template), MAX_LENGTH_TAGS)}</span>
    </Paper>
  }

  return (
      <div>
        <br/>
        <h2>Templates</h2>
        { <>
          <br/>
          {tags.map(tag =>
              <Tooltip key={tag} title={tag.length > MAX_LENGTH_TAG ? tag : ""} arrow>
                <span style={{marginRight: "10px", padding: "8px", borderRadius: "10px",
                  backgroundColor: (selectedTags.includes(tag) ? "lightskyblue" : "lightblue")}}
                onClick={() => handleTagClick(tag)}>
                  {shortenStrings(tag, MAX_LENGTH_TAG)}
                </span>
              </Tooltip>
          )}
          <br/><br/>
          <small style={{ color: "gray" }}>{getTemplateCount()}</small>
          <br/><br/>
        </> }
        <Box
            style={{width: "800px"}}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              "& > :not(style)": {
                m: 1,
                width: 240,
                height: 120,
              },
            }}
        >
          {templates
            .filter((t) => filterTemplate(t))
            .map((template) => {
              return isShortened(template) ? (
                  <Tooltip
                      key={template.id + "_tooltip"}
                      title={
                        <div style={{ fontSize: "small", whiteSpace: "pre-line" }}>
                          {template.title + "\n\n" + template.description + "\n\n" + getConcatenatedTags(template)}
                        </div>
                      }
                      arrow
                  >
                    {buildPaper(template)}
                  </Tooltip>
              ) : (
                  buildPaper(template)
              );
          })}
        </Box>
      </div>
  );
}

export default Templates;
