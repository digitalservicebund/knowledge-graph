# KnowThyselves
A Knowledge Graph prototype by the Workstream "Learning Organization" at DigitalService.

## Tech stack

For the backend, a Java Spring Boot application starts an Apache Jena Fuseki server that enables querying a triple store from a TDB directory via a SPARQL endpoint. The Fuseki server could also be started independently or be replaced with another graph database entirely. For convenience however, the Spring Boot application starts and stops the Fuseki server.

The Apache Jena library also allows the Spring Boot application to query the same TDB-backed triple store or manage datasets in it. The Spring Boot application offers REST API endpoints to create new datasets etc. There will be more management tasks in the future.

The React frontend queries the Fuseki server directly. For management tasks it talks to the REST API of the Spring Boot application.

## How to run the application

There is demo-data available that will be imported to the graph on startup. So there is something to see right away when trying out the app :nerd_face:

Lots of things are just mockups for the narrative of the demo at this point. They'll gradually turn into functioning code.

### Backend

```sh
cd backend
./gradlew bootRun
```

Or as IntelliJ run configuration:

![](https://user-images.githubusercontent.com/5141792/226630200-34a24bd5-4d36-4803-b263-db247f42609e.png)

<!-- See which environment variables have to be set in `application.properties`. -->

### Frontend


```sh
cd frontend
npm install
npm start
```

<!-- Fill the values in `frontend/src/config.json`:
```json
{
    "SPARQL_ENDPOINT": ""
}
```-->

## Other

- `scripts/miro` detects a graph on Miro (sticky notes with labelled connection lines between them) and exports it to:
  - a TGF or Turtle file (commented out)
  - a SPARQL endpoint
