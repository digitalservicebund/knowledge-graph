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
        + "  ds:DigitalService ds:hasEmployee ?employee . "
        + "}"
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
]
