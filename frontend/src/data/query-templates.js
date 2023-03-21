export const queryTemplates = [
  {
    id: "list-all",
    title: "All triples",
    description: "List all triples in the knowledge graph",
    query: "SELECT * WHERE { "
        + "  ?s ?p ?o . "
        + "}"
  },
  {
    id: "list-employees",
    title: "List employees",
    description: "List all employees with some basic infos about them",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT (?employee AS ?name) ?imageURL ?discipline ?seniority "
        + "(GROUP_CONCAT(strafter(str(?skill), \"#\"); SEPARATOR=\", \") as ?skills) "
        + "?nonProjectParticipations ?fellowshipAlumni "
        + "WHERE { "
        + "    ds:Employees ds:hasEmployee ?employee . "
        + "    OPTIONAL { ?employee ds:hasImageURL ?imageURL . } "
        + "    OPTIONAL { ?employee ds:belongsToDiscipline ?discipline . } "
        + "    OPTIONAL { ?employee ds:hasExperienceLevel ?seniority . } "
        + "    OPTIONAL { ?employee ds:isMemberOf ?nonProjectParticipations . } "
        + "    OPTIONAL { ?employee ds:hasSkill ?skill . } "
        + "    OPTIONAL { "
        + "        ds:Fellowships ds:hasFellowship ?fellowshipAlumni . "
        + "        ?fellowshipAlumni ds:hasProject ?fellowshipProject . "
        + "        ?fellowshipProject ds:hasTeamMember ?employee . "
        + "    }"
        + "} GROUP BY ?employee ?imageURL ?discipline ?seniority ?nonProjectParticipations ?fellowshipAlumni"
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
    id: "list-projects",
    title: "List projects",
    description: "List all current and past projects",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT ?project ?launchDate ?projectPartner ?url ?status (COUNT(?employeesOnProject) as ?people) WHERE { "
        + "    ds:Projects ds:hasProject ?project . "
        + "    OPTIONAL { ?project ds:hasLaunchDate ?launchDate . } "
        + "    OPTIONAL { ?project ds:hasProjectPartner ?projectPartner . } "
        + "    OPTIONAL { ?project ds:hasURL ?url . } "
        + "    OPTIONAL { <<ds:Projects ds:hasProject ?project>> ds:status ?status . } "
        + "    OPTIONAL { ?employeesOnProject ds:joinedProject ?project . }"
        + "} GROUP BY ?project ?launchDate ?projectPartner ?url ?status ORDER BY ?status"
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
        label: "Project",
        placeholder: "[project]"
      }
    ]
  },
  {
    id: "skill-statistics",
    title: "Skill statistics",
    description: "Statistics about existing and desired skills",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT ?skill ?discipline (COUNT(?employee1) AS ?peopleHavingIt) (COUNT(?employee2) AS ?peopleWantingToLearnIt) WHERE { "
        + "    { ?employee1 ds:hasSkill ?skill . } "
        + "    UNION "
        + "    { ?employee2 ds:wantsToLearn ?skill . } "
        + "    ?skill ?associatedWithDiscipline ?discipline . "
        + "} GROUP BY ?skill ?discipline ORDER BY DESC(?peopleHavingIt)"
  },
  {
    id: "team-assembly",
    title: "Assemble a team",
    description: "Based on desired disciplines, seniority and skills",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT * WHERE { "
        + "    { "
        + "        SELECT * WHERE { "
        + "            ?name ds:belongsToDiscipline ?discipline .  "
        + "            ?name ds:hasExperienceLevel ?seniority . "
        + "            ?name ds:hasSkill ?hasSkill . "
        + "            FILTER (?hasSkill = ds:React) . "
        + "            FILTER (?discipline = ds:Engineering) . "
        + "            FILTER (?seniority IN (ds:Senior)) . "
        + "        } LIMIT 1 "
        + "    } UNION { "
        + "        SELECT * WHERE { "
        + "            ?name ds:belongsToDiscipline ?discipline . "
        + "            ?name ds:hasExperienceLevel ?seniority . "
        + "            ?name ds:wantsToLearn ?wantsSkill . "
        + "            FILTER (?wantsSkill = ds:React) . "
        + "            FILTER (?discipline = ds:Engineering) . "
        + "            FILTER (?seniority IN (ds:Regular)) "
        + "        } LIMIT 1 "
        + "    } UNION { "
        + "        SELECT * WHERE { "
        + "            ?name ds:belongsToDiscipline ?discipline . "
        + "            ?name ds:hasExperienceLevel ?seniority . "
        + "            FILTER (?discipline = ds:Design) . "
        + "            FILTER (?seniority IN (ds:Junior, ds:Regular)) "
        + "        } LIMIT 1 "
        + "    }"
        + "}"
  },
  {
    id: "ministry-contact-points",
    title: "Ministry contact points",
    description: "Ministries we had or have contact points with.",
    query: "PREFIX ds: <https://digitalservice.bund.de/kg#> "
        + "SELECT ?dsProject ?fellowship ?fellowshipProject ?workedThereBefore WHERE { "
        + "    BIND(ds:MinistryXYZ AS ?ministry)  "
        + "    {  "
        + "        ?dsProject ds:hasProjectPartner ?ministry .  "
        + "        ?ministry ds:type ds:Ministry . "
        + "    } "
        + "    UNION  "
        + "    { "
        + "        ds:Fellowships ds:hasFellowship ?fellowship . "
        + "        ?fellowship ds:hasProject ?fellowshipProject . "
        + "        ?fellowshipProject ds:hasFellowshipProjectPartner ?ministry .  "
        + "    } "
        + "    UNION { ?workedThereBefore ds:workedBeforeAt ?ministry . } "
        + "}",
    choices: [
      {
        label: "Ministry",
        placeholder: "[ministry]"
      }
    ]
  }
]
