import { useEffect, useRef, useState } from "react";
import chartjs from "chart.js/auto";
import { Bar } from "react-chartjs-2";

function GanttChart(props) {
  const init = useRef(false)
  const [chartData, setChartData] = useState()
  const startMonths = useRef([])

  useEffect(() => {
    if (init.current) return
    init.current = true
    computeDatasets()
  }, [])

  const computeDatasets = () => {
    let projects = []
    const dateToMonth = (date) => {
      // earliest in the data is Jan 2022
      return (date.split("-")[0] - 2022) * 12 + Number(date.split("-")[1]) - 1
    }
    props.queryResultData.rows.forEach(row => {
      projects.push({
        name: row["name"].value,
        start: dateToMonth(row["earliest"].value),
        end: dateToMonth(row["latest"].value)
      })
    })
    startMonths.current = projects.map(project => project.start)
    setChartData({
      labels: projects.map(project => project.name),
      datasets: [{
          label: "Projects timeline",
          data: projects.map(project => project.end),
        }]
    })
  }

  const options = {
    indexAxis: "y",
    plugins: {
      title: {
        display: true,
        text: "Projects timeline",
        font: { size: 20 },
        padding: { bottom: 30 }
      },
      legend: { display: false },
    },
    scales: {
      x: {
        max: 15,
        grid: { drawOnChartArea: false },
        ticks: {
          callback: function(value) {
            const baseDate = new Date(2022, 0)
            const date = new Date(baseDate.setMonth(baseDate.getMonth() + value))
            if (value === 15) return "" // cosmetics: avoid visual overlap
            return `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
          }
        },
      },
    },
    animation: {
      onComplete: function(animation) {
        let chartInstance = animation.chart
        const ctx = chartInstance.ctx
        const dataset = chartInstance.data.datasets[0]
        const meta = chartInstance.getDatasetMeta(0)
        ctx.fillStyle = "white"
        for (let i = 0; i < dataset.data.length; i++) {
          let startMonth = startMonths.current[i]
          let endMonth = dataset.data[i]
          const model = meta.data[i].getProps(["x", "y", "base", "width", "height"], true)
          const fullBarWidth = model.x - model.base
          let barWidth = (startMonth / endMonth) * fullBarWidth
          if (startMonth === endMonth) barWidth -= 10
          ctx.fillRect(model.base, model.y - model.height / 2 - 4, barWidth, model.height + 8)
        }
      }
    }
  }

  const chartPlugins = [
    {
      id: "drawGridOnTop",
      afterDatasetsDraw: (chart) => {
        setTimeout(() => {
          const ctx = chart.ctx
          const xScale = chart.scales["x"]
          const yScale = chart.scales["y"]
          xScale.ticks.forEach((tick, index) => {
            if (index === 0) return
            const x = xScale.getPixelForTick(index)
            ctx.beginPath()
            ctx.moveTo(x, yScale.bottom)
            ctx.lineTo(x, yScale.top)
            ctx.strokeStyle = "#e8e8e8"
            ctx.stroke()
          })
        }, 100)
      },
    },
  ]

  return ( chartData &&
      <>
        <Bar data={chartData} options={options} plugins={chartPlugins} />
        <br/><br/><br/>
      </>
  )
}

export default GanttChart
