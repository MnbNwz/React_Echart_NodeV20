import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

import ParametricHistogram from "./ChartTypes/HistogramChart.js"; // Import the Histogram component
import ParametricWaferMap from "./ChartTypes/ParametricWaferMapChart.js"; // Import or create the Wafer Map component
import XYScatterChart from "./ChartTypes/XYScatterChart.js"; // Import or create the X, Y Scatter component
// import DataSets from "./Datasets.js";
import filePath from "./Assets/circular_semiconductor_wafer_map_with_voltage.csv";
import { FallingLines } from "react-loader-spinner";
import TrendChart from "./ChartTypes/TrendChart.js";
import BoxPlotChart from "./ChartTypes/BoxPlotChart.js";
import GalleryView from "./ChartTypes/GalleryView.js";
import CandlestickChart from "./ChartTypes/CandlestickChart .js";
import RealTimeCharting from "./ChartTypes/RealTimeCharting.js";
import AxisHandeling from "./ChartTypes/AxisHandeling.js";
import OverlayedPointsOnLine from "./ChartTypes/Overlay.js";
import TabularLinkedDataChart from "./ChartTypes/TabularLinkedDateChart.js";

const drawerWidth = 240;

const App = () => {
  const [selectedChart, setSelectedChart] = useState("Parametric Histogram");
  const [chartData, setChartData] = useState({
    histogramData: [],
    scatterData: [],
    parametricWaferMapData: [],
    trendChartData: [],
    boxPlotData: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleFileProcessing();
  }, []);

  const handleFileProcessing = (customFile) => {
    setLoading(true);
    setError(null);

    const numWorkers = navigator.hardwareConcurrency;
    const workers = [];
    const promises = [];

    const createWorkerForChunk = (chunk) => {
      const worker = new Worker(new URL("./csvWorker.js", import.meta.url), {
        type: "module",
      });
      workers.push(worker);

      return new Promise((resolve, reject) => {
        worker.postMessage({ fileContent: chunk });

        worker.onmessage = (e) => {
          const { success, data, message } = e.data;

          if (success) {
            resolve(data);
          } else {
            reject(message);
          }
        };

        worker.onerror = (err) => {
          reject(`Error in worker: ${err.message}`);
        };
      });
    };

    if (customFile) {
      // Scenario: File selected using file picker
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;

        // Split the CSV content into chunks
        const lines = fileContent.split("\n");
        const chunkSize = Math.ceil(lines.length / numWorkers);
        for (let i = 0; i < numWorkers; i++) {
          const chunk = lines
            .slice(i * chunkSize, (i + 1) * chunkSize)
            .join("\n");
          promises.push(createWorkerForChunk(chunk));
        }

        handleWorkerPromises(promises);
      };
      reader.onerror = () => {
        setError("Error reading file");
        setLoading(false);
      };
      reader.readAsText(customFile);
    } else {
      // Scenario: File fetched via URL (filePath)
      fetch(filePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch the file.");
          }
          return response.text(); // Get the file content as text
        })
        .then((fileContent) => {
          // Split the CSV content into chunks
          const lines = fileContent.split("\n");
          const chunkSize = Math.ceil(lines.length / numWorkers);
          for (let i = 0; i < numWorkers; i++) {
            const chunk = lines
              .slice(i * chunkSize, (i + 1) * chunkSize)
              .join("\n");
            promises.push(createWorkerForChunk(chunk));
          }

          handleWorkerPromises(promises);
        })
        .catch((error) => {
          setError(`Error fetching file: ${error.message}`);
          setLoading(false);
        });
    }
  };

  // Helper function to handle worker promises and process data
  const handleWorkerPromises = (promises) => {
    Promise.all(promises)
      .then((results) => {
        // Combine all results from all workers
        const combinedData = results.flat();

        // Process the combined data (similar to your original code)
        const parametricWaferDatasets = [];
        const scatterDatasets = [];
        const histogramDatasets = [];
        const TrendChart = [];
        const boxPlot = [];

        const headers = combinedData[0]; // First row contains the headers
        const headerMap = {};
        headers.forEach((header, index) => {
          headerMap[header.trim()] = index;
        });
        for (let i = 1; i < combinedData.length; i++) {
          const row = combinedData[i];

          // Use the headerMap to access the values by name

          // Use this code to use parametric || X,Y Scatter || Parametric Wafer Map || Trend chart and Box-Plot chart

          // From next line to
          // File name to run these graphs: csv Data files/circular_semiconductor_wafer_map_with_voltage.csv
          // histogramDatasets.push([
          //   parseFloat(row[headerMap["Leakage_Current"]]),
          // ]); // Just leakage
          // scatterDatasets.push([
          //   parseFloat(row[headerMap["Leakage_Current"]]),
          //   parseFloat(row[headerMap["Voltage_Result"]]),
          //   parseFloat(row[headerMap["Site_Number"]]),
          // ]); // Just leakage and voltages
          // parametricWaferDatasets.push([
          //   parseFloat(row[headerMap["X_Coordinate"]]), // x
          //   parseFloat(row[headerMap["Y_Coordinate"]]), // y
          //   parseFloat(row[headerMap["Leakage_Current"]]), // value
          // ]);
          // TrendChart.push([
          //   parseFloat(row[headerMap["Site_Number"]]),
          //   parseFloat(row[headerMap["Leakage_Current"]]),
          // ]);
          // till This line

          boxPlot.push([
            // Use below two lines to use parametric || X,Y Scatter || Parametric Wafer Map || Trend chart and Box-Plot chart
            // row[headerMap["Site_Number"]],
            // parseFloat(row[headerMap["Leakage_Current"]]),

            // Comment above all states and Use this code to run candle Chart
            // File name to run these graphs: csv Data files/consolidated_data_Julius_csv_with_diff_wafer_ids

            row[headerMap["WAF ID 2"]],
            parseFloat(row[headerMap["PARAMETER_01"]]),
            row[headerMap["Device Name"]],
          ]);
        }

        setChartData({
          histogramData: histogramDatasets,
          scatterData: scatterDatasets,
          parametricWaferMapData: parametricWaferDatasets,
          trendChartData: TrendChart,
          boxPlotData: boxPlot,
        });
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const renderChartComponent = () => {
    if (loading) return null;

    switch (selectedChart) {
      case "Parametric Histogram":
        return chartData.histogramData.length > 1 ? (
          <ParametricHistogram source={chartData.histogramData} />
        ) : (
          <>Parametric Histogram with no data</>
        );
      case "Parametric Wafer Map":
        return chartData.parametricWaferMapData.length > 1 ? (
          <ParametricWaferMap
            source={chartData.parametricWaferMapData.slice(0, 2_00_00)}
          />
        ) : (
          <>Parametric Wafer Map with no data</>
        );
      case "X, Y Scatter":
        return chartData.scatterData.length > 1 ? (
          <XYScatterChart source={chartData.scatterData.slice(0, 10_00_0)} />
        ) : (
          <>X, Y Scatter with no data</>
        );
      case "Trend Chart":
        return chartData.trendChartData.length > 1 ? (
          <TrendChart source={chartData.trendChartData} />
        ) : (
          <>Trend Chart with no data ; </>
        );
      case "Box-Plot Chart":
        return chartData.boxPlotData.length > 1 ? (
          <BoxPlotChart source={chartData.boxPlotData} />
        ) : (
          <>Box-Plot Chart with no data </>
        );
      case "Candle Stick":
        return <CandlestickChart source={chartData.boxPlotData} />;
      case "Real Time":
        return <RealTimeCharting />;
      case "Axis Handel":
        return <AxisHandeling />;
      case "Overlay points over the Graph":
        return <OverlayedPointsOnLine />;
      case "Tabular Linked Chart":
        return <TabularLinkedDataChart />;
      case "Gallery View":
        return <GalleryView />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <CssBaseline />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <FallingLines
            color="#6A41FF"
            width="100"
            visible
            ariaLabel="falling-circles-loading"
          />
        </div>
      )}
      <AppBar
        sx={{
          position: "fixed",
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          p: 2,
        }}
      >
        <Toolbar sx={{ flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" component="div" align="center">
            {selectedChart} By using ECharts by Apache
          </Typography>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              mt: 1,
            }}
          >
            <Box>
              <input
                type="file"
                accept=".csv"
                id="file-picker"
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files[0];
                  if (file) {
                    handleFileProcessing(file);
                  } else {
                    console.log("No file selected");
                  }
                }}
              />
              <label htmlFor="file-picker">
                <Button variant="contained" component="span" color="primary">
                  Upload CSV
                </Button>
              </label>
            </Box>
          </Box>
          {error && (
            <Typography
              variant="h6"
              component="div"
              color="error"
              sx={{ mt: 1 }}
            >
              Error: {error}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          backgroundColor: "#2c3e50",
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#34495e",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {[
              "Parametric Histogram",
              "X, Y Scatter",
              "Parametric Wafer Map",
              "Trend Chart",
              "Box-Plot Chart",
              "Candle Stick",
              "Real Time",
              "Overlay points over the Graph",
              "Tabular Linked Chart",
              // "Axis Handel",
              // "Gallery View",
            ].map((text) => (
              <ListItem
                button="true"
                key={text}
                onClick={() => setSelectedChart(text)}
                sx={{
                  backgroundColor:
                    selectedChart === text ? "#16a085" : "transparent",
                  "&:hover": {
                    cursor: "pointer",
                    backgroundColor: "#1abc9c",
                  },
                }}
              >
                <ListItemText primary={text} sx={{ color: "white" }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3, mt: 12 }}
      >
        {renderChartComponent()}
      </Box>
    </Box>
  );
};

export default App;
