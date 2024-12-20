import React, { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts";
import "echarts-gl"; // Ensure WebGL rendering is available
import { Button, Box } from "@mui/material";

const XYScatterChart = React.memo(({ source }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [renderingTime, setRenderingTime] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]); // Track selected points
  const [removedPoints, setRemovedPoints] = useState([]); // Track removed points

  const initializeChart = useCallback(() => {
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: "webgl", // Use WebGL for improved performance
      });
    }
    return chartInstance.current;
  }, []);

  const disposeChart = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  }, []);

  // Handle brush selection event
  const handleBrushSelected = (event) => {
    // Check if any points were selected in the brush
    const selectedIndices = event.batch[0]?.selected[0]?.dataIndex || [];
    setSelectedPoints(selectedIndices); // Update selected points
  };

  // Remove selected points and clear selection
  const handleRemovePoints = () => {
    const myChart = chartInstance.current;
    if (!myChart) return;

    // Get current data from the chart
    const currentData = myChart.getOption().series[0].data;

    // Filter out the selected points
    const newChartData = currentData.filter(
      (_, index) => !selectedPoints.includes(index)
    );

    // Set the new chart data
    myChart.setOption({
      series: [
        {
          data: newChartData,
        },
      ],
    });

    // Save removed points to restore later
    const pointsToRemove = selectedPoints.map((index) => currentData[index]);
    setRemovedPoints((prev) => [...prev, ...pointsToRemove]);

    // Clear brush selection using dispatchAction
    myChart.dispatchAction({
      type: "brush",
      areas: [], // Clear selection
    });

    // Clear selected points state
    setSelectedPoints([]);
  };

  // Restore removed points
  const handleRestorePoints = () => {
    const myChart = chartInstance.current;
    if (!myChart) return;

    // Get current data from the chart
    const currentData = myChart.getOption().series[0].data;

    // Avoid duplicates and merge the data
    const restoredData = [...currentData, ...removedPoints];

    // Set the option with restored points
    myChart.setOption({
      series: [
        {
          data: restoredData,
        },
      ],
    });

    // Clear removed points state after restoring
    setRemovedPoints([]);
  };

  useEffect(() => {
    // Map site numbers to colors
    const siteColorMap = {
      1: "#ff0000", // Red
      2: "#00ff00", // Green
      3: "#0000ff", // Blue
      4: "#ff00ff", // Magenta
    };

    // Prepare data with colors applied to points
    const dataWithColors = source.map(([x, y, site]) => ({
      value: [x, y],
      itemStyle: {
        color: siteColorMap[site] || "#000000", // Default to black if site number is not mapped
      },
    }));

    const myChart = initializeChart();
    const startRendering = performance.now(); // Start timing the rendering process

    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (!params.value || params.value.length < 2) {
            return "Invalid data point";
          }
          return `Leakage: ${params.value[0]}, Voltage: ${
            params.value[1]
          }, Site: ${source[params.dataIndex][2]}`;
        },
      },
      grid: {
        left: "10%",
        right: "10%",
        top: "10%",
        bottom: "10%",
      },
      xAxis: {
        type: "value",
        name: "Leakage",
        nameLocation: "middle",
        nameGap: 25,
      },
      yAxis: {
        type: "value",
        name: "Voltage",
        nameLocation: "middle",
        nameGap: 35,
      },
      series: [
        {
          name: "Scatter Plot",
          type: "scatter",
          data: dataWithColors,
          symbolSize: 2, // Smaller symbols for high-density data
          sampling: "lttb", // Use Largest Triangle Three Buckets sampling
          progressive: 50000, // Render 50k points at a time
          progressiveThreshold: 300000,
          itemStyle: {
            color: "#000000", // Fallback color for points without specific colors
          },
        },
      ],
      brush: {
        toolbox: ["rect", "polygon", "keep", "clear"],
        xAxisIndex: 0,
        yAxisIndex: 0,
        brushLink: "all",
      },
    };

    // Attach the 'finished' event listener
    myChart.on("finished", () => {
      const endRendering = performance.now();
      setRenderingTime((endRendering - startRendering).toFixed(2));
    });

    myChart.setOption(option);

    // Attach brush selection event listener
    myChart.on("brushselected", handleBrushSelected);

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.off("brushselected", handleBrushSelected);
      disposeChart();
    };
  }, [source, initializeChart, disposeChart]);

  return (
    <div>
      <div ref={chartRef} style={{ width: "100%", height: "600px" }} />
      <Box mt={2} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          color="error"
          onClick={handleRemovePoints}
          disabled={selectedPoints.length === 0}
          sx={{ padding: "8px 16px", minWidth: "160px" }}
        >
          Remove Selected Points
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRestorePoints}
          sx={{ padding: "8px 16px", minWidth: "160px" }}
        >
          Restore Removed Points
        </Button>
      </Box>
      <Box mt={2} textAlign="center">
        <p>
          Execution Time:{" "}
          {renderingTime ? `${renderingTime} ms` : "Calculating..."} with{" "}
          {source.length} datasets
        </p>
      </Box>
    </div>
  );
});

export default XYScatterChart;
