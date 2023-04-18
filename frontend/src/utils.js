
const SELECT_QUERY_ENDPOINT = "http://localhost:8080/api/v1/knowthyselves/query/select"
const INSERT_QUERY_ENDPOINT = "http://localhost:8080/api/v1/knowthyselves/query/insert"

export const datasetNamesToOneString = (datasets) => {
  const { main, meta } = datasets
  if (main && meta) return "both";
  if (main) return "main";
  if (meta) return "meta";
  return "none";
}

export const fetchSelect = (query, ds, callback) => {
  fetch(SELECT_QUERY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query, dataset: ds })
  })
  .then(response => response.json())
  .then(responseJson => callback(responseJson))
}

export const fetchInsert = (query, ds, callback) => {
  fetch(INSERT_QUERY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query, dataset: ds })
  })
  .then(response => response.text())
  .then(responseText => callback(responseText))
}
