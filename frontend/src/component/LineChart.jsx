import {useEffect, useRef, useState} from "react";
import chartjs from "chart.js/auto"; // required for react-chartjs-2
import { Line } from "react-chartjs-2";
import fileDownload from "js-file-download";

function LineChart(props) {
  const init = useRef(false)
  const [chartData, setChartData] = useState()

  useEffect(() => {
    if (init.current) return
    init.current = true
    computeDatasets()
  }, [])

  const computeDatasets = () => {
    let row = props.queryResultData.rows[0]
    let labels = []
    let datasets = {}
    props.queryResultData.variables.forEach(variable => {
      let date = variable.substring(0, 7)
      if (!labels.includes(date)) labels.push(date)
      let discipline = variable.substring(7, variable.length)
      if (!datasets[discipline]) datasets[discipline] = { label: discipline, data: [], tension: 0.2 } //, fill: "origin" }
      let value = Number(row[variable].value)
      datasets[discipline].data.push(value)
    })
    // delete datasets["Total"]
    setChartData({ labels: labels, datasets: Object.values(datasets) })
  }

  const chartOptions = {
    animation: {
      onComplete: function(animation) {
        /*let chartInstance = animation.chart
        chartInstance.data.datasets.forEach(dataset => {
          if(dataset.backgroundColor) {
            dataset.backgroundColor = dataset.backgroundColor.replace(/[^,]+(?=\))/, "1")
          }
        })
        chartInstance.update()*/
      }
    }
  }

  const downloadChartData = () => {
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
        <Line data={chartData} options={chartOptions} />
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
