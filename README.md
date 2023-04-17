# :bulb: KnowThyselves
A Knowledge Graph prototype by the Workstream "Learning Organization" at DigitalService.

<img title="Katy" src="https://user-images.githubusercontent.com/5141792/225292599-c8ae735f-10f9-42c3-89c2-267a1d60b790.png" width="400">

## Tech stack

Find diagrams in `doc`.

## How to run the application

For a quick demo with some data (and various mockups for the demo-narrative) readily available, go back to tag [v0.1.0-demo](https://github.com/digitalservicebund/know-thyselves/releases/tag/v0.1.0-demo). The current state on `main` will not import demo-data upon startup.

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
