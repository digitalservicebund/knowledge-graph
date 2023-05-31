import { useEffect, useRef, useState } from "react";
import chartjs from "chart.js/auto";
import { Bar } from "react-chartjs-2";

function BarChart(props) {
  const init = useRef(false)
  const [chartData, setChartData] = useState()

  useEffect(() => {
    if (init.current) return
    init.current = true
    computeDatasets()
  }, [])

  const computeDatasets = () => {
    const datasets = [
      { label: "DigitalService", data: [] },
      { label: "Tech4Germany", data: [] },
      { label: "Work4Germany", data: [] }
    ]
    const labels = []
    props.queryResultData.rows.forEach(row => {
      labels.push(row["Partner"].value.split("#")[1])
      datasets[0].data.push(Number(row["DigitalServiceProjects"].value))
      datasets[1].data.push(Number(row["Tech4GermanyProjects"].value))
      datasets[2].data.push(Number(row["Work4GermanyProjects"].value))
    })
    setChartData({ labels, datasets })
  }

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          autoSkip: false
        },
      },
    },
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
        text: "Number of projects per partner",
        font: { size: 20 },
      },
    },
  }

  return ( chartData &&
      <>
        <div style={{ width: "1200px", height: "650px" }}>
          <Bar data={chartData} options={options} />
        </div>
        <br/><br/><br/>
      </>
  )
}

export default BarChart
