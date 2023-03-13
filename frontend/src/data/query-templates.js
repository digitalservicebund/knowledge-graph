export const queryTemplates = [
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
        + "  ?ministry ds:hasLogo ?logo . "
        + "}"
  },
]
