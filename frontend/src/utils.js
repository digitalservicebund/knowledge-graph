export const datasetNamesToOneString = (datasets) => {
  const { main, meta } = datasets
  if (main && meta) return "both";
  if (main) return "main";
  if (meta) return "meta";
  return "none";
}
