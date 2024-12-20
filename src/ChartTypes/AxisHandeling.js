import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid2,
} from "@mui/material";

const MultiAxisChart = () => {
  const defaultXAxisLabels = [
    ["00:00", "06:00", "12:00", "18:00", "24:00"],
    ["2024-12-01", "2024-12-02", "2024-12-03"],
    ["Sunday", "Monday", "Tuesday"],
    ["Jan", "Feb", "Mar", "Apr", "May"],
    ["2023", "2024", "2025"],
  ];

  const defaultYAxisLabels = [
    "Temperature (°C)",
    "Wind Speed (m/s)",
    "Precipitation (mm)",
    "Pressure (hPa)",
    "Humidity (%)",
  ];

  const defaultTitle = "Multi-Axis Example: Editable Axis Labels with Reset";

  const [showGrid2, setShowGrid2] = useState(true);
  const [xAxisLabels, setXAxisLabels] = useState([...defaultXAxisLabels]);
  const [yAxisLabels, setYAxisLabels] = useState([...defaultYAxisLabels]);
  const [chartTitle, setChartTitle] = useState(defaultTitle);
  const [legendLabels, setLegendLabels] = useState([...defaultYAxisLabels]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editedXAxisLabels, setEditedXAxisLabels] = useState([...xAxisLabels]);
  const [editedYAxisLabels, setEditedYAxisLabels] = useState([...yAxisLabels]);
  const [editedTitle, setEditedTitle] = useState(chartTitle);
  const [editedLegendLabels, setEditedLegendLabels] = useState([
    ...legendLabels,
  ]);
  const [chartKey, setChartKey] = useState(0); // Force re-render

  const handleDialogOpen = () => {
    setEditedXAxisLabels([...xAxisLabels]);
    setEditedYAxisLabels([...yAxisLabels]);
    setEditedTitle(chartTitle);
    setEditedLegendLabels([...legendLabels]);
    setOpenDialog(true);
  };

  const handleDialogClose = (save = false) => {
    if (save) {
      setXAxisLabels([...editedXAxisLabels]);
      setYAxisLabels([...editedYAxisLabels]);
      setChartTitle(editedTitle);
      setLegendLabels([...editedLegendLabels]);
      setChartKey((prev) => prev + 1); // Increment key to force re-render
    }
    setOpenDialog(false);
  };

  const handleEditXAxis = (axisIndex, index, value) => {
    const newLabels = [...editedXAxisLabels];
    newLabels[axisIndex][index] = value;
    setEditedXAxisLabels(newLabels);
  };

  const handleEditYAxis = (index, value) => {
    const newLabels = [...editedYAxisLabels];
    newLabels[index] = value;
    setEditedYAxisLabels(newLabels);
  };

  const handleEditLegend = (index, value) => {
    const newLabels = [...editedLegendLabels];
    newLabels[index] = value;
    setEditedLegendLabels(newLabels);
  };

  const handleReset = () => {
    setXAxisLabels([...defaultXAxisLabels]);
    setYAxisLabels([...defaultYAxisLabels]);
    setChartTitle(defaultTitle);
    setLegendLabels([...defaultYAxisLabels]);
    setChartKey((prev) => prev + 1); // Increment key to force re-render
  };

  const options = {
    title: {
      text: chartTitle,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: legendLabels,
    },
    xAxis: xAxisLabels.map((data, index) => ({
      type: "category",
      data,
      position: index % 2 === 0 ? "bottom" : "top",
      offset: index > 1 ? 30 * (index - 1) : 0,
      name: `X-Axis ${index + 1}`,
      splitLine: { show: showGrid2 },
    })),
    yAxis: yAxisLabels.map((name, index) => ({
      type: "value",
      name,
      position: index % 2 === 0 ? "left" : "right",
      offset: index > 1 ? 50 * (index - 1) : 0,
      splitLine: { show: showGrid2 },
      axisLine: { show: true },
    })),
    series: [
      {
        name: legendLabels[0],
        type: "line",
        data: [5, 15, 20, 10, 8],
        xAxisIndex: 0,
        yAxisIndex: 0,
        lineStyle: { color: "#ff0000" },
        smooth: true,
      },
      {
        name: legendLabels[2],
        type: "bar",
        data: [20, 40, 60, 80, 100],
        xAxisIndex: 1,
        yAxisIndex: 2,
        itemStyle: { color: "#0000ff" },
      },
      {
        name: legendLabels[1],
        type: "line",
        data: [2, 3, 5, 4, 3],
        xAxisIndex: 2,
        yAxisIndex: 1,
        lineStyle: { color: "#00ff00" },
        smooth: true,
      },
    ],
    grid2: {
      containLabel: true,
    },
  };

  return (
    <div>
      <ReactECharts
        key={chartKey} // Add unique key to force re-render
        option={options}
        style={{ height: "700px", width: "100%" }}
      />
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowGrid2((prev) => !prev)}
        >
          {showGrid2 ? "Hide Grid2 Lines" : "Show Grid2 Lines"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDialogOpen}
        >
          Edit Chart
        </Button>
        <Button variant="contained" color="error" onClick={handleReset}>
          Reset Chart
        </Button>
      </div>

      {/* Dialog for Editing Chart */}
      <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
        <DialogTitle>Edit Chart</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2}>
            <Grid2 item xs={12}>
              <TextField
                label="Chart Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                fullWidth
                margin="dense"
              />
            </Grid2>
            {editedXAxisLabels.map((axis, axisIndex) => (
              <Grid2 item xs={12} key={`x-axis-${axisIndex}`}>
                <h4>Edit X-Axis {axisIndex + 1} Labels:</h4>
                {axis.map((label, index) => (
                  <TextField
                    key={`x-axis-${axisIndex}-${index}`}
                    label={`Label ${index + 1}`}
                    value={label}
                    onChange={(e) =>
                      handleEditXAxis(axisIndex, index, e.target.value)
                    }
                    fullWidth
                    margin="dense"
                  />
                ))}
              </Grid2>
            ))}
            {editedYAxisLabels.map((label, index) => (
              <Grid2 item xs={12} key={`y-axis-${index}`}>
                <TextField
                  label={`Y-Axis ${index + 1} Label`}
                  value={label}
                  onChange={(e) => handleEditYAxis(index, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid2>
            ))}
            {editedLegendLabels.map((label, index) => (
              <Grid2 item xs={12} key={`legend-${index}`}>
                <TextField
                  label={`Legend Label ${index + 1}`}
                  value={label}
                  onChange={(e) => handleEditLegend(index, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid2>
            ))}
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MultiAxisChart;
