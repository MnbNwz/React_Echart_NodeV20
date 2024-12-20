import React, { useMemo, useRef, useState, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography, Slider } from "@mui/material";
import { Button, ButtonGroup } from "@mui/material";
import { ImageRun, Packer, Paragraph } from "docx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";

const CandlestickChart = ({ source }) => {
  const chartRef = useRef(null);
  const [xRange, setXRange] = useState([0, 10]);
  const [yRange, setYRange] = useState([0, 100]);
  const [selectedData, setSelectedData] = useState(null); // To store selected data

  const processedData = useMemo(() => {
    if (!Array.isArray(source) || source.length === 0) {
      console.warn("Invalid or empty source data:", source);
      return { categories: [], candlestickData: [] };
    }

    const validSource = source.filter(
      ([waferId, parameter]) =>
        waferId !== undefined &&
        typeof waferId === "string" &&
        parameter !== undefined &&
        !isNaN(parameter)
    );

    if (validSource.length === 0) {
      return { categories: [], candlestickData: [] };
    }

    const groups = validSource.reduce((acc, [waferId, parameter]) => {
      acc[waferId] = acc[waferId] || { parameters: [] };
      acc[waferId].parameters.push(parameter);
      return acc;
    }, {});

    const categories = Object.keys(groups).sort();

    const candlestickData = categories
      .map((waferId) => {
        const values = groups[waferId].parameters.sort((a, b) => a - b);
        if (values.length < 5) {
          return null;
        }
        const min = values[0];
        const max = values[values.length - 1];
        const q1 = values[Math.floor((values.length - 1) * 0.25)];
        const median = values[Math.floor((values.length - 1) * 0.5)];
        const q3 = values[Math.floor((values.length - 1) * 0.75)];
        return {
          values: [min, q1, median, q3, max],
        };
      })
      .filter(Boolean);

    return { categories, candlestickData };
  }, [source]);

  const { categories, candlestickData } = processedData;

  const xMax = categories.length;
  const yValues = candlestickData.flatMap((item) => item.values);

  const yMin = Math.min(...yValues);
  const yMax = 5000;

  useMemo(() => {
    setYRange([yMin, yMax]);
  }, [yMin, yMax]);

  useMemo(() => {
    setXRange([0, categories.length]);
  }, [categories.length]);

  if (categories.length === 0 || candlestickData.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="500px"
      >
        <Typography variant="h6" color="textSecondary">
          No data available to display the chart. Please provide valid data.
        </Typography>
      </Box>
    );
  }

  // Always call the useCallback hook to prevent conditional hook calls
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleBrushSelected = useCallback(
    (params) => {
      // Get the selected area (which is in the form of a rectangle, polygon, etc.)
      const selectedData = params.batch[0].selected;

      // Check if selected data is available
      if (!selectedData || selectedData.length === 0) {
        console.log("No data selected.");
        return;
      }

      // Process the selected data to display it
      const selectedItems = selectedData
        .map((item) => {
          const index = item.dataIndex;

          if (index < 0 || index >= candlestickData.length) {
            console.warn(`Invalid index: ${index}`);
            return null;
          }

          const category = categories[index];
          const values = candlestickData[index]?.values;

          if (!category || !values) {
            console.warn("Invalid category or values:", { category, values });
            return null;
          }

          return {
            category,
            values,
          };
        })
        .filter(Boolean); // Filter out null values

      if (selectedItems.length > 0) {
        // Set the selected data to state
        setSelectedData(selectedItems);
      } else {
        console.log("No valid data found.");
      }
    },
    [categories, candlestickData]
  );

  const options = {
    title: {
      text: `Candlestick Chart Example with ${source.length - 1} datasets`,
    },
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        if (!params[0].data) return "No data available for this point.";

        const data = params[0].data;
        let values;

        if (Array.isArray(data)) {
          values = data;
        } else if (data.values) {
          values = data.values;
        } else {
          return "No valid data available.";
        }

        const [min, q1, median, q3, max] = values;

        const categoryName = categories[params[0].dataIndex];
        return `<b>${categoryName}</b><br/>
          Min: ${min}<br/>
          Q1: ${q1}<br/>
          Median: ${median}<br/>
          Q3: ${q3}<br/>
          Max: ${max}`;
      },
    },
    xAxis: {
      type: "category",
      data: categories.slice(xRange[0], xRange[1]),
      name: "Wafer ID",
      axisLabel: {
        interval: 0,
        rotate: 90,
      },
    },
    yAxis: {
      type: "value",
      name: "PARAMETER_01 Value",
      min: yRange[0],
      max: yRange[1],
    },
    brush: {
      toolbox: ["rect", "polygon", "lineX", "lineY", "clear"],
      xAxisIndex: 0,
      yAxisIndex: 0,
      throttleDelay: 300,
      brushLink: "all",
    },
    series: [
      {
        name: "Parameter Distribution",
        type: "candlestick",
        data: candlestickData
          .slice(xRange[0], xRange[1])
          .map((item) => item.values),
        itemStyle: {
          color: "#ec0000",
          color0: "#00da3c",
          borderColor: "#8A0000",
          borderColor0: "#008F28",
        },
      },
    ],
    toolbox: {
      feature: {
        // restore: {},
        saveAsImage: {},
      },
    },
    dataZoom: [
      {
        type: "inside", // Zoom with mouse wheel or pinch gestures for X-Axis only
        xAxisIndex: 0,
        yAxisIndex: -1, // No effect on the y-axis
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Adds a horizontal slider for zooming on X-Axis only
        xAxisIndex: 0,
        yAxisIndex: -1, // No effect on the y-axis
        start: 0,
        end: 100,
        orient: "horizontal", // Horizontal slider
      },
      {
        type: "inside", // Zoom with mouse wheel or pinch gestures for Y-Axis only
        xAxisIndex: -1, // No effect on the x-axis
        yAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider", // Adds a vertical slider for zooming on Y-Axis only
        xAxisIndex: -1, // No effect on the x-axis
        yAxisIndex: 0, // Zooming on the Y-Axis
        start: 0,
        end: 100,
        orient: "vertical", // Vertical slider for Y-Axis
      },
    ],
  };

  const handleExportPDF = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    const imgData = echartsInstance.getDataURL({
      type: "png",
      backgroundColor: "#fff",
    });

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 90);
    pdf.save("chart.pdf");
  };

  const handleExportExcel = () => {
    // Ensure processedData is valid
    if (
      !processedData ||
      !processedData.candlestickData ||
      !processedData.categories
    ) {
      console.warn("Invalid or incomplete data for export.");
      return;
    }

    // Combine categories and candlestickData into rows
    const combinedData = processedData.categories.map((category, index) => ({
      Category: category,
      CandlestickData: JSON.stringify(
        processedData.candlestickData[index] || {}
      ),
    }));

    // Create a worksheet from the combined data
    const worksheet = XLSX.utils.json_to_sheet(combinedData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "chart-data.xlsx");
  };

  const handleExportPPT = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    const imgData = echartsInstance.getDataURL({
      type: "png",
      backgroundColor: "#fff",
    });

    const ppt = new PptxGenJS();
    const slide = ppt.addSlide();
    slide.addImage({ data: imgData, x: 0.5, y: 0.5, w: 9, h: 5 });
    ppt.writeFile("chart.pptx");
  };

  const handleExportWord = async () => {
    const base64ToUint8Array = (base64) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };
    const echartsInstance = chartRef.current.getEchartsInstance();
    const imgData = echartsInstance.getDataURL({
      type: "png",
      backgroundColor: "#fff",
    });

    // Extract base64 part from data URL
    const base64Data = imgData.split(",")[1];
    const imageArray = base64ToUint8Array(base64Data); // Convert to Uint8Array

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageArray, // Use the Uint8Array here
                  transformation: {
                    width: 600, // Adjust as needed
                    height: 300, // Adjust as needed
                  },
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Create a blob from the document and trigger download
    const buffer = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(buffer);
    link.download = "chart.docx";
    link.click();
  };

  return (
    <div>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box width="80%" mb={2}>
          <Typography gutterBottom>X-Axis Range</Typography>
          <Slider
            value={xRange}
            onChange={(e, newValue) => setXRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={xMax}
          />
          <Typography gutterBottom>Y-Axis Range</Typography>
          <Slider
            value={yRange}
            onChange={(e, newValue) => setYRange(newValue)}
            valueLabelDisplay="auto"
            min={yMin}
            max={yMax}
          />
        </Box>

        {/* Display selected data */}
        {selectedData && (
          <Box mt={2}>
            <Typography variant="h6">Selected Data:</Typography>
            <pre>{JSON.stringify(selectedData, null, 2)}</pre>
          </Box>
        )}

        <ReactECharts
          option={options}
          ref={chartRef}
          style={{ height: "500px", width: "100%" }}
          onEvents={{
            brushselected: handleBrushSelected, // Listen for brush selection
          }}
        />
        <ButtonGroup
          variant="contained"
          color="primary"
          style={{ marginTop: "10px", gap: "10px" }}
        >
          {/* <Button onClick={handleExportPNG}>Export PNG</Button> */}
          <Button onClick={handleExportPDF}>Export PDF</Button>
          <Button onClick={handleExportExcel}>Export Excel</Button>
          <Button onClick={handleExportWord}>Export Word</Button>
          <Button onClick={handleExportPPT}>Export PPT</Button>
        </ButtonGroup>
      </Box>
    </div>
  );
};

export default CandlestickChart;
