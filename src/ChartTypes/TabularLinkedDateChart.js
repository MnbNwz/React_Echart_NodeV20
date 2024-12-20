import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Grid,
} from "@mui/material";

// Sample data with x, y, z coordinates
const data = [
  { x: 1, y: 3, z: 7 },
  { x: 2, y: 6, z: 8 },
  { x: 3, y: 9, z: 9 },
  { x: 4, y: 12, z: 6 },
  { x: 5, y: 15, z: 4 },
  { x: 6, y: 18, z: 5 },
  { x: 7, y: 21, z: 3 },
  { x: 8, y: 24, z: 2 },
  { x: 9, y: 27, z: 1 },
  { x: 10, y: 30, z: 0 },
];

const LinkedChartTable = () => {
  // State to manage selected rows (indices)
  const [selectedData, setSelectedData] = useState([]);

  // Handle row selection/unselection
  const handleRowSelect = (index) => {
    const newSelection = [...selectedData];
    const selectedIndex = newSelection.indexOf(index);
    if (selectedIndex === -1) {
      newSelection.push(index); // Add to selection
    } else {
      newSelection.splice(selectedIndex, 1); // Remove from selection
    }
    setSelectedData(newSelection);
  };

  // Handle tooltip click event to unselect table row
  const onTooltipClick = (params) => {
    const index = params.dataIndex; // Get index of clicked data point
    const newSelection = [...selectedData];
    const selectedIndex = newSelection.indexOf(index);
    if (selectedIndex !== -1) {
      newSelection.splice(selectedIndex, 1); // Remove the row from selectedData
    }
    setSelectedData(newSelection); // Update the selection
  };

  // ECharts options for 3D scatter plot
  const chartOptions = {
    title: {
      text: "3D Scatter Plot Based on Selected Data",
      subtext: "X, Y, Z Axes",
    },
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `X: ${params.data[0]}, Y: ${params.data[1]}, Z: ${params.data[2]}`,
      // Listen for tooltip click event
      extraCssText: "cursor: pointer;", // Optional: Change cursor to pointer on tooltip
    },
    xAxis3D: {
      type: "value",
      name: "X",
    },
    yAxis3D: {
      type: "value",
      name: "Y",
    },
    zAxis3D: {
      type: "value",
      name: "Z",
    },
    grid3D: {
      show: true,
      boxWidth: 100,
      boxHeight: 100,
      boxDepth: 100,
      viewControl: {
        projection: "perspective",
      },
    },
    series: [
      {
        type: "scatter3D",
        data: data
          .filter((_, index) => selectedData.includes(index)) // Filter data based on selection
          .map((point) => [point.x, point.y, point.z]), // Map to [x, y, z] format
        symbolSize: 10,
        label: {
          show: true,
          formatter: (params) =>
            `(${params.data[0]}, ${params.data[1]}, ${params.data[2]})`,
        },
      },
    ],
  };

  return (
    <Grid container spacing={2} direction="row">
      {/* Table Grid */}
      <Grid item xs={12} sm={6}>
        <h2>Data Table</h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedData.length > 0 &&
                      selectedData.length < data.length
                    }
                    checked={selectedData.length === data.length}
                    onChange={() => {
                      if (selectedData.length === data.length) {
                        setSelectedData([]);
                      } else {
                        setSelectedData(data.map((_, index) => index));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>X</TableCell>
                <TableCell>Y</TableCell>
                <TableCell>Z</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((point, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleRowSelect(index)}
                  selected={selectedData.includes(index)}
                  sx={{
                    backgroundColor: selectedData.includes(index)
                      ? "#FFD700"
                      : "transparent",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedData.includes(index)}
                      onChange={() => handleRowSelect(index)}
                    />
                  </TableCell>
                  <TableCell>{point.x}</TableCell>
                  <TableCell>{point.y}</TableCell>
                  <TableCell>{point.z}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Chart Grid */}
      <Grid item xs={12} sm={6}>
        <h2>3D Scatter Plot Based on Selected Data</h2>
        <ReactECharts
          option={chartOptions}
          style={{ height: "500px", width: "100%" }}
          // Register the click event for tooltip
          onEvents={{
            click: onTooltipClick,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default LinkedChartTable;
