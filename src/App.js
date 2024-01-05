import "./App.css";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import colors from "./colors.js";

function App() {
  const [values, setValues] = useState([]);
  const chartRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    async function fetchGDP() {
      const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
      );
      const json = await response.json();
      const newValues = json.map((i) => ({
        time: new Date(
          2000,
          1,
          1,
          1,
          i["Time"].split(":")[0],
          i["Time"].split(":")[1]
        ),
        place: i["Place"],
        seconds: i["Seconds"],
        name: i["Name"],
        year: i["Year"],
        nationality: i["Nationality"],
        doping: i["Doping"],
        url: i["URL"],
      }));
      setValues(newValues);
    }

    fetchGDP();
  }, []);

  useEffect(() => {
    if (values.length === 0) return;

    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const legend = d3
      .select(legendRef.current)
      .append("svg")
      .attr("width", 400)
      .attr("height", 200)
      .attr("id", "legend");

    legend
      .append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 6)
      .style("fill", colors[0]);

    legend
      .append("circle")
      .attr("cx", 30)
      .attr("cy", 60)
      .attr("r", 6)
      .style("fill", colors[1]);

    legend
      .append("text")
      .attr("x", 50)
      .attr("y", 35)
      .text("No doping allegations")
      .attr("alignment-baseline", "middle");

    legend
      .append("text")
      .attr("x", 50)
      .attr("y", 65)
      .text("Riders with doping allegations")
      .attr("alignment-baseline", "middle");

    const x = d3
      .scaleLinear()
      .domain([
        d3.min(values, (d) => d.year - 1),
        d3.max(values, (d) => d.year + 1),
      ])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("id", "x-axis")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3
      .scaleTime()
      .domain([
        new Date(d3.min(values, (d) => d.time)),
        new Date(d3.max(values, (d) => d.time)),
      ])
      .range([0, height]);

    svg
      .append("g")
      .attr("id", "y-axis")
      .call(d3.axisLeft(y).tickFormat(d3.timeFormat("%M:%S")));

    svg
      .append("g")
      .selectAll("dot")
      .data(values)
      .enter()
      .append("circle")
      .attr("data-xvalue", (d) => d.year)
      .attr("data-yvalue", (d) => d.time.toISOString())
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.time))
      .attr("r", 6)
      .attr("class", "dot")
      .style("fill", (d) => (d.doping === "" ? colors[0] : colors[1]))
      .style("opacity", 0.8)
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `${d.name}: ${d.nationality}<br>Year: ${
              d.year
            }, Time: ${d.time.getUTCHours()}:${d.time.getUTCMinutes()}<br>${
              d.doping !== "" ? d.doping : ""
            }`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px")
          .style("background-color", colors[2])
          .style("color", "white")
          .attr("data-year", d.year);
      })
      .on("mouseout", (event) => {
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }, [values]);

  return (
    <div className="App">
      <h1 id="title" style={{ fontWeight: "bold" }}>
        Doping in Professional Bicycle Racing
      </h1>
      <h4 style={{ fontWeight: "bold" }}>35 Fastest times up Alpe d'Huez</h4>
      <div ref={chartRef}></div>
      <div ref={legendRef}></div>
      <div id="tooltip"></div>
    </div>
  );
}

export default App;
