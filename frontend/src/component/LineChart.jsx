import { useEffect, useRef, useState } from "react";
import chartjs from "chart.js/auto"; // required for react-chartjs-2
import { Line } from "react-chartjs-2";
import fileDownload from "js-file-download";

function LineChart(props) {
  const init = useRef(false)
  const [chartData, setChartData] = useState()
  const chartRef = useRef()

  useEffect(() => {
    if (init.current) return
    init.current = true
    computeDatasets()
  }, [])

  const computeDatasets = () => {
    let row = props.queryResultData.rows[0]
    let dateLabels = []
    let datasets = {}

    props.queryResultData.variables.forEach(variable => {
      let date = variable.substring(0, 7)
      if (!dateLabels.includes(date)) dateLabels.push(date)
      let discipline = variable.substring(7, variable.length)
      if (!datasets[discipline]) datasets[discipline] =
          { label: discipline, data: [], tension: 0.2, fill: "origin", borderWidth: 0, pointRadius: 0 }
      let value = Number(row[variable].value)
      datasets[discipline].data.push(value)
    })

    let sortedDatasetLabels = Object.values(datasets).sort((a, b) => {
      let lastA = a.data[a.data.length - 1]
      let lastB = b.data[b.data.length - 1]
      return lastB - lastA
    }).map(dataset => dataset.label)

    let datapoints = new Array(dateLabels.length).fill(0)
    let stackedDatasets = []
    for (let datasetLabel of sortedDatasetLabels) {
      datapoints = datapoints.map((value, idx) => value + datasets[datasetLabel].data[idx])
      stackedDatasets.push(
          { label: datasetLabel, data: datapoints, tension: 0.2, fill: "origin", borderWidth: 0, pointRadius: 0 })
    }

    setChartData({ labels: dateLabels, datasets: stackedDatasets })
  }

  const chartOptions = {
    animation: {
      onComplete: function(animation) {
        let chartInstance = animation.chart
        chartInstance.data.datasets.forEach(dataset => {
          if(dataset.backgroundColor) {
            dataset.backgroundColor = dataset.backgroundColor.replace(/[^,]+(?=\))/, "1")
          }
        })
        chartInstance.update()
      }
    },
    plugins: {
      title: {
        display: true,
        text: "Employee growth by discipline",
        font: { size: 20 },
      },
    },
  }

  const downloadChartData = () => {
    chartRef.current.canvas.toBlob(blob => {
      fileDownload(blob, "Chart.png")
    }, "image/png")
    let csv = []
    let disciplineLabels = chartData.datasets.map(ds => ds.label)
    csv.push(["Month", ...disciplineLabels].join(","))
    chartData.labels.forEach((month, idx) => {
      let row = [month]
      chartData.datasets.forEach(ds => {
        row.push(ds.data[idx])
      })
      csv.push(row.join(","))
    })
    fileDownload(csv.join("\n"), "ChartData.csv")
  }

  return ( chartData &&
      <>
        <Line data={chartData} options={chartOptions} ref={chartRef} />
        <br/>
          <small
              style={{ color: "gray", textDecoration: "underline", cursor: "pointer" }}
              onClick={downloadChartData}>
            Download chart data as CSV
          </small>
        <br/><br/><br/>
      </>
  )
}

export default LineChart
