import slugify from "slugify";

export const BASE_URL = "http://localhost:8080" // for use with "npm start"

const SELECT_QUERY_ENDPOINT = BASE_URL + "/api/v1/knowthyselves/query/select"
const INSERT_QUERY_ENDPOINT = BASE_URL + "/api/v1/knowthyselves/query/insert"

export const uri = (str) => {
  str = str.replaceAll("+", "-").replaceAll("#", "-").replace(/[()]/g, "-")
  return slugify(str.trim())
}

export const datasetNamesToOneString = (datasets) => {
  const { main, meta } = datasets
  if (main && meta) return "both";
  if (main) return "main";
  if (meta) return "meta";
  return "none";
}

export const fetchSelectAwait = async (query, ds) => {
  return await fetch(SELECT_QUERY_ENDPOINT, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({query: query, dataset: ds})
  })
  .then(response => response.json())
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

export const getTimestamp = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const day = now.getDate().toString().padStart(2, "0")
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
