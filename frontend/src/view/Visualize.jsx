import ForceGraph2D from "react-force-graph-2d";

function Visualize() {
  const graphData = {
    nodes: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    links: [
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 1, target: 4 },
    ]
  };

  return (
      <div>
        <br/>
        <h2>Visualize</h2>
        <ForceGraph2D
            graphData={graphData}
            nodeLabel={"id"}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
        />
      </div>
  );
}

export default Visualize;
