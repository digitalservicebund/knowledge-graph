export const queryTemplates = [
  {
    id: "get-all",
    title: "Get all",
    description: "Get all triples.",
    query: "SELECT * WHERE { "
        + "  ?s ?p ?o . "
        + "}"
  },
  {
    id: "list-employees",
    title: "List employees",
    description: "List all employees.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "    ds:DigitalService ds:hasEmployee ?employee . "
        + "    OPTIONAL { <<ds:DigitalService ds:hasEmployee ?employee>> ds:firstDay ?firstDayAtDS . } "
        + "    OPTIONAL { ?employee ds:joinedProject ?project . } "
        + "    OPTIONAL { <<?employee ds:joinedProject ?project>> ds:onDate ?firstDayOnProject . } "
        + "    OPTIONAL { ?employee ds:belongsToDiscipline ?discipline . } "
        + "    OPTIONAL { ?employee ds:hasExperienceLevel ?experienceLevel . } "
        + "    OPTIONAL { ?employee ds:isMemberOf ?nonProjectParticipations . } "
        + "}"
  },
  {
    id: "project-timeline",
    title: "Project timeline",
    description: "Shows the timeline of a project in terms of who joined/left.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "    ?employee ds:joinedProject ds:AkteX . "
        + "    <<?employee ds:joinedProject ds:AkteX>> ds:onDate ?firstDay . "
        + "    OPTIONAL { "
        + "        ?employee ds:leftProject ds:AkteX . "
        + "        <<?employee ds:leftProject ds:AkteX>> ds:onDate ?lastDay . "
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
