# KnowThyselves
A Knowledge Graph prototype by the Workstream "Learning Organization" at DigitalService.

## How to run the application

There is demo-data available that will be imported to the graph on startup. So there is something to see when trying out the app :nerd_face:

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
