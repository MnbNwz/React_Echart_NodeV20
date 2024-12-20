import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Box } from "@mui/material";

const MultiRealTimeChartWithControls = () => {
  const chartRefs = [useRef(null), useRef(null), useRef(null)];
  const [data1, setData1] = useState([]);
  const [timeStamps1, setTimeStamps1] = useState([]);

  const [data2, setData2] = useState([]);
  const [timeStamps2, setTimeStamps2] = useState([]);

  const [data3, setData3] = useState([]);
  const [timeStamps3, setTimeStamps3] = useState([]);

  const [running, setRunning] = useState(false);
  const dataLimit = 100; // Number of points to display

  const getRandomInterval = () => Math.floor(Math.random() * 3990) + 10;

  // Data generation functions
  const fetchData1 = () => {
    const now = new Date().toLocaleTimeString();
    const randomValue = Math.random() * 100;

    setTimeStamps1((prev) => {
      const updated = [...prev, now];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });

    setData1((prev) => {
      const updated = [...prev, randomValue];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });
  };

  const fetchData2 = () => {
    const now = new Date().toLocaleTimeString();
    const randomValue = Math.random() * 200 - 100;

    setTimeStamps2((prev) => {
      const updated = [...prev, now];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });

    setData2((prev) => {
      const updated = [...prev, randomValue];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });
  };

  const fetchData3 = () => {
    const now = new Date().toLocaleTimeString();
    const sineValue = Math.sin(Date.now() / 1000) * 50;

    setTimeStamps3((prev) => {
      const updated = [...prev, now];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });

    setData3((prev) => {
      const updated = [...prev, sineValue];
      return updated.length > dataLimit ? updated.slice(1) : updated;
    });
  };

  // Control handlers
  const startAll = () => {
    setRunning(true);
  };

  const stopAll = () => {
    setRunning(false);
  };

  useEffect(() => {
    if (running) {
      const interval1 = setInterval(fetchData1, getRandomInterval());
      const interval2 = setInterval(fetchData2, getRandomInterval());
      const interval3 = setInterval(fetchData3, getRandomInterval());

      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
        clearInterval(interval3);
      };
    }
  }, [running]);

  // Chart options
  const getOption1 = () => ({
    title: { text: "Chart 1: Line Chart" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", boundaryGap: false, data: timeStamps1 },
    yAxis: { type: "value" },
    series: [
      {
        name: "Random Value",
        type: "line",
        data: data1,
        smooth: true,
        areaStyle: {},
      },
    ],
  });

  const getOption2 = () => ({
    title: { text: "Chart 2: +VE/-VE Bar chart" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", boundaryGap: false, data: timeStamps2 },
    yAxis: { type: "value" },
    series: [
      {
        name: "Random Positive/Negative Value",
        type: "bar",
        data: data2,
      },
    ],
  });

  const getOption3 = () => ({
    title: { text: "Chart 3: +VE/-VE Sine Wave Simulation" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", boundaryGap: false, data: timeStamps3 },
    yAxis: { type: "value" },
    series: [
      {
        name: "Sine Wave",
        type: "line",
        data: data3,
        smooth: true,
        areaStyle: { color: "rgba(255, 87, 51, 0.3)" },
      },
    ],
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box display="flex" justifyContent="space-between" p={2}>
        <Button variant="contained" color="primary" onClick={startAll}>
          Start
        </Button>
        <Button variant="contained" color="secondary" onClick={stopAll}>
          Stop
        </Button>
      </Box>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <ReactECharts
          ref={chartRefs[0]}
          option={getOption1()}
          style={{ width: "100%" }}
        />
        <ReactECharts
          ref={chartRefs[1]}
          option={getOption2()}
          style={{ width: "100%" }}
        />
        <ReactECharts
          ref={chartRefs[2]}
          option={getOption3()}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default MultiRealTimeChartWithControls;
