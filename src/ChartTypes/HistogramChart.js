import React, { useEffect, useRef, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as echarts from "echarts";
import * as ecStat from "echarts-stat"; // Import echarts-stat

const HistogramChart = ({ source }) => {
  const chartRef = useRef(null); // Reference for chart container
  const [state, setState] = useState({
    renderingTime: null,
    showPolygon: false,
    showCounts: false,
    bins: Math.ceil(Math.sqrt(source.length)),
    binMethod: "squareRoot",
  });

  // Handle checkbox change for polygon
  const handleCheckboxChangePolygon = (event) => {
    setState((prevState) => ({
      ...prevState,
      showPolygon: event.target.checked,
    }));
  };

  // Handle checkbox change for counts
  const handleCheckboxChangeCounts = (event) => {
    setState((prevState) => ({
      ...prevState,
      showCounts: event.target.checked,
    }));
  };

  // Handle bins change
  const handleBinsChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setState((prevState) => ({
        ...prevState,
        bins: value,
      }));
    }
  };

  // Handle bin method change
  const handleBinMethodChange = (event) => {
    const selectedMethod = event.target.value;
    let calculatedBins;

    switch (selectedMethod) {
      case "sturges":
        calculatedBins = Math.ceil(1 + Math.log2(source.length));
        break;
      case "squareRoot":
      default:
        calculatedBins = Math.ceil(Math.sqrt(source.length));
    }

    setState((prevState) => ({
      ...prevState,
      binMethod: selectedMethod,
      bins: calculatedBins,
    }));
  };

  // Handle redraw click
  const handleRedraw = () => {
    drawChart();
  };

  const drawChart = () => {
    const myChart = echarts.init(chartRef.current, null, {
      renderer: "canvas",
      useDirtyRect: true,
    });

    echarts.registerTransform(ecStat.transform.histogram);

    const startRendering = performance.now(); // Start timing the rendering process

    const option = {
      dataset: [
        {
          source,
        },
        {
          transform: {
            type: "ecStat:histogram",
            config: {
              method: state.binMethod,
              bins: state.bins,
            },
          },
        },
      ],
      tooltip: {},
      grid: [{ left: "10%", right: "10%", top: "10%", bottom: "10%" }],
      xAxis: [
        {
          nameLocation: "center",
          name: "Leakage",
          type: "value",
          nameGap: 20,
          scale: true,
          axisTick: { show: false },
          axisLabel: { show: true },
          axisLine: { show: false },
        },
      ],
      yAxis: [
        {
          nameGap: 50,
          nameLocation: "center",
          name: "Count",
          type: "value",
          scale: true,
          axisTick: { show: false },
          axisLabel: { show: true },
          axisLine: { show: false },
        },
      ],
      series: [
        {
          name: "histogram",
          type: "bar",
          barWidth: "99.3%",
          label: {
            show: state.showCounts,
            position: "top",
          },
          encode: { x: 0, y: 1 },
          datasetIndex: 1,
        },
        ...(state.showPolygon
          ? [
              {
                name: "Edge Line",
                type: "line",
                smooth: true,
                lineStyle: {
                  color: "red",
                },
                encode: { x: 0, y: 1 },
                datasetIndex: 1,
              },
            ]
          : []),
      ],
    };

    // Attach an event listener for the 'finished' event
    myChart.on("finished", () => {
      const endRendering = performance.now(); // End timing after painting is complete
      const renderingTime = endRendering - startRendering; // Calculate the rendering time

      // Set rendering time in state
      setState((prevState) => ({
        ...prevState,
        renderingTime: renderingTime.toFixed(2),
      }));
    });

    myChart.setOption(option);

    // Resize the chart when the window is resized
    window.addEventListener("resize", myChart.resize);

    // Cleanup function when the component unmounts
    return () => {
      myChart.dispose();
      window.removeEventListener("resize", myChart.resize);
    };
  };

  useEffect(() => {
    drawChart();
  }, []); // Only run on component mount

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Select value={state.binMethod} onChange={handleBinMethodChange}>
          <MenuItem value="squareRoot">Square Root</MenuItem>
          <MenuItem value="sturges">Sturges</MenuItem>
        </Select>
        <TextField
          label="Number of Classes"
          type="number"
          value={state.bins}
          onChange={handleBinsChange}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <Checkbox
            checked={state.showPolygon}
            onChange={handleCheckboxChangePolygon}
            inputProps={{ "aria-label": "Enable Polygon" }}
          />
          <span>Enable Polygon</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <Checkbox
            checked={state.showCounts}
            onChange={handleCheckboxChangeCounts}
            inputProps={{ "aria-label": "Show Counts" }}
          />
          <span>Show Counts Over Bars</span>
        </div>
        <Button
          variant="contained"
          onClick={handleRedraw}
          style={{ marginLeft: "20px" }}
        >
          Redraw
        </Button>
      </div>
      <div
        ref={chartRef}
        id="chart-container"
        style={{ width: "100%", height: "400px", marginTop: "20px" }}
      ></div>
      <div>
        <p>
          Execution Time: {state.renderingTime}ms with {source.length - 1}{" "}
          datasets
        </p>
      </div>
    </div>
  );
};

export default HistogramChart;
