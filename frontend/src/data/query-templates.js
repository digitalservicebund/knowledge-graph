export const queryTemplates = [
  /*{
    id: "list-all",
    title: "All triples",
    description: "List all triples",
    query: "SELECT * WHERE { "
        + "  ?s ?p ?o . "
        + "}"
  },*/
  {
    id: "list-employees",
    title: "List employees",
    description: "List all employees with some basic infos about them",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT (?employee AS ?name) ?imageURL ?discipline ?seniority (GROUP_CONCAT(strafter(str(?skill), \"#\"); SEPARATOR=\", \") as ?skills) ?nonProjectParticipations "
        + "WHERE { "
        + "    ds:Employees ds:hasEmployee ?employee . "
        + "    OPTIONAL { ?employee ds:hasImageURL ?imageURL . } "
        + "    OPTIONAL { ?employee ds:belongsToDiscipline ?discipline . } "
        + "    OPTIONAL { ?employee ds:hasExperienceLevel ?seniority . } "
        + "    OPTIONAL { ?employee ds:isMemberOf ?nonProjectParticipations . } "
        + "    OPTIONAL { ?employee ds:hasSkill ?skill . } "
        + "} GROUP BY ?employee ?imageURL ?discipline ?seniority ?nonProjectParticipations"
  },
  {
    id: "hire-timeline",
    title: "Hiring timeline",
    description: "Plot the timeline of when employees joined the company",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "    ds:Employees ds:hasEmployee ?name . "
        + "    OPTIONAL { <<ds:Employees ds:hasEmployee ?name>> ds:joined ?firstDay . } "
        + "    OPTIONAL { ?name ds:joinedProject ?project . } "
        + "    OPTIONAL { <<?name ds:joinedProject ?project>> ds:onDate ?firstDayOnProject . }"
        + "} ORDER BY ?firstDay"
  },
  {
    id: "project-timeline",
    title: "Project timeline",
    description: "Shows the timeline of a project in terms of who joined/left.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT ?name ?firstDay ?lastDay ?daysOnProject WHERE { "
        + "    ?name ds:joinedProject ds:AkteX . "
        + "    <<?name ds:joinedProject ds:AkteX>> ds:onDate ?firstDay . "
        + "    OPTIONAL { "
        + "        ?name ds:leftProject ds:AkteX . "
        + "        <<?name ds:leftProject ds:AkteX>> ds:onDate ?lastDay . "
        + "    }"
        + "}",
    choices: [
      {
        label: "project",
        placeholder: "[project]"
      }
    ]
  },
  {
    id: "ministries",
    title: "Ministries",
    description: "Ministries we worked with.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "  ?project ds:hasProjectPartner ?ministry . "
        + "  OPTIONAL { ?ministry ds:hasLogoImageURL ?logoImageURL . } "
        + "}"
  },
  {
    id: "list-projects",
    title: "List projects",
    description: "List all our projects.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "  ds:Projects ds:hasProject ?project . "
        + "  OPTIONAL { ?project ds:hasProjectPartner ?projectPartner . } "
        + "  OPTIONAL { ?project ds:hasURL ?url . } "
        + "  OPTIONAL { <<ds:Projects ds:hasProject ?project>> ds:status ?status . } "
        + "}"
  }
]
