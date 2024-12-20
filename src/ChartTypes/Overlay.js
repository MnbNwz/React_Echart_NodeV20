import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";

const OverlayedPointsOnLine = () => {
  const [opacity, setOpacity] = useState(1); // State to manage opacity
  const [activeOverlays, setActiveOverlays] = useState(
    Array(6).fill(true) // State to track active overlays (default all on)
  );
  const [showLine, setShowLine] = useState(true); // Initial state to hide the line

  const baseData = [10, 20, 30, 40, 50, 60, 70];
  const xValues = [0, 1, 2, 3, 4, 5, 6];

  // Overlay datasets
  const overlays = [
    {
      name: "Overlay Points - Dataset 1",
      data: [
        [0, 10],
        [2, 30],
        [4, 50],
      ],
      color: "#ff0000",
    },
    {
      name: "Overlay Points - Dataset 2",
      data: [
        [1, 20],
        [3, 40],
        [5, 60],
      ],
      color: "#00ff00",
    },
    {
      name: "Overlay Points - Dataset 3",
      data: [
        [0, 15],
        [2, 35],
        [4, 55],
      ],
      color: "#0000ff",
    },
    {
      name: "Overlay Points - Dataset 4",
      data: [
        [1, 25],
        [3, 45],
        [5, 65],
      ],
      color: "#ffa500",
    },
    {
      name: "Overlay Points - Dataset 5",
      data: [
        [0, 5],
        [2, 25],
        [4, 45],
      ],
      color: "#800080",
    },
    {
      name: "Overlay Points - Dataset 6",
      data: [
        [1, 12],
        [3, 32],
        [5, 52],
      ],
      color: "#008080",
    },
  ];

  // Custom switch styled based on the overlay color
  const ColoredSwitch = styled(Switch)(({ theme, color }) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: color,
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: color,
    },
  }));

  // Build series dynamically, filter by active overlays
  const series = [
    showLine && {
      name: "Base Line",
      type: "line",
      data: baseData.map((y, i) => [xValues[i], y]),
      lineStyle: { color: "#333", width: 2 },
    },
    ...overlays.map((overlay, index) => ({
      name: overlay.name,
      type: "scatter",
      data: activeOverlays[index] ? overlay.data : [], // Hide data if overlay is off
      itemStyle: { color: overlay.color, opacity: opacity },
      symbolSize: 10,
      label: {
        show: activeOverlays[index], // Hide labels when overlay is off
        formatter: (params) => `(${params.value[0]}, ${params.value[1]})`,
        position: "top",
        color: overlay.color,
      },
    })),
  ].filter(Boolean); // Remove falsy values (e.g., when showLine is false)

  // Chart options
  const options = {
    title: {
      text: "Overlayed Points on Line Graph",
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.seriesType === "scatter") {
          return `Dataset: ${params.seriesName}<br/>X: ${params.value[0]}<br/>Y: ${params.value[1]}`;
        }
        return `X: ${params.data[0]}<br/>Y: ${params.data[1]}`;
      },
    },
    legend: {
      show: false, // Hide legend
    },
    xAxis: {
      type: "value",
      name: "X-Axis",
    },
    yAxis: {
      type: "value",
      name: "Y-Axis",
    },
    series,
  };

  // Toggle overlay visibility
  const toggleOverlay = (index) => {
    const updated = [...activeOverlays];
    updated[index] = !updated[index];
    setActiveOverlays(updated);
  };

  return (
    <div>
      <div
        style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}
      >
        <label
          htmlFor="opacity-slider"
          style={{ marginRight: "10px", fontWeight: "bold" }}
        >
          Adjust Opacity:
        </label>
        <input
          id="opacity-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          style={{ flex: 0.5, marginRight: "10px" }}
        />
        <span>{Math.round(opacity * 100)}%</span>
      </div>
      <div style={{ marginBottom: "20px" }}>
        {/* <FormControlLabel
          control={
            <Switch
              checked={showLine}
              onChange={() => setShowLine(!showLine)} // Toggle line visibility
            />
          }
          label="Toggle Line"
        /> */}
        {overlays.map((overlay, index) => (
          <FormControlLabel
            key={index}
            control={
              <ColoredSwitch
                checked={activeOverlays[index]}
                onChange={() => toggleOverlay(index)}
                color={overlay.color}
              />
            }
            label={overlay.name}
          />
        ))}
      </div>
      <ReactECharts
        option={options}
        style={{ height: "600px", width: "100%" }}
      />
    </div>
  );
};

export default OverlayedPointsOnLine;
