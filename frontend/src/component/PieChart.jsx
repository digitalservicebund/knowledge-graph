import { useEffect, useRef, useState } from "react";
import chartjs from "chart.js/auto";
import { Pie } from "react-chartjs-2";

function PieChart(props) {
  const init = useRef(false)
  const [chartData, setChartData] = useState()

  useEffect(() => {
    if (init.current) return
    init.current = true
    computeDatasets()
  }, [])

  const computeDatasets = () => {
    let data = { labels: [], datasets: [{ data: [] }]}
    props.queryResultData.rows.forEach(row => {
      let count = row.count.value
      data.labels.push(row.status.value.split("#")[1] + " (" + count + ")")
      data.datasets[0].data.push(count)
    })
    setChartData(data)
  }

  const options = {
    indexAxis: "y",
    plugins: {
      title: {
        display: true,
        text: "Statuses of T4G projects 2018-2022",
        font: { size: 20 }
      }
    }
  }

  return ( chartData &&
      <>
        <div style={{ width: "500px", height: "500px" }}>
          <Pie data={chartData} options={options} />
        </div>
        <br/><br/><br/>
      </>
  )
}

export default PieChart
