import React, { useMemo, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Media, ImageRun } from "docx";
import PptxGenJS from "pptxgenjs";
import { Button, ButtonGroup } from "@mui/material";

const BoxPlotChart = ({ source }) => {
  console.log(source);
  const [executionTime, setExecutionTime] = useState(null); // State for execution time
  const chartRef = useRef(null);
  const processedData = useMemo(() => {
    const startProcessing = performance.now();

    if (!Array.isArray(source) || source.length === 0) {
      console.warn("Invalid or empty source data:", source);
      setExecutionTime(0);
      return { categories: [], boxPlotData: [], groups: {} };
    }

    // Filter out invalid rows
    const validSource = source.filter(
      ([category, value]) =>
        category !== undefined &&
        typeof category === "string" &&
        value !== undefined &&
        !isNaN(value)
    );

    // Group by wafer_id (categories)
    const groups = validSource.reduce((acc, [category, value]) => {
      acc[category] = acc[category] || [];
      acc[category].push(value);
      return acc;
    }, {});

    // Categories
    const categories = Object.keys(groups).sort(); // Wafer IDs as categories

    // Calculate boxplot data
    const boxPlotData = categories.map((category) => {
      const values = groups[category].sort((a, b) => a - b);
      const min = values[0];
      const max = values[values.length - 1];
      const q1 = values[Math.floor((values.length - 1) * 0.25)];
      const median = values[Math.floor((values.length - 1) * 0.5)];
      const q3 = values[Math.floor((values.length - 1) * 0.75)];
      return [min, q1, median, q3, max];
    });

    const endProcessing = performance.now();
    setExecutionTime((endProcessing - startProcessing).toFixed(2));

    return { categories, boxPlotData, groups };
  }, [source]);

  const { categories, boxPlotData } = processedData;

  const options = {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (!params.data) return "No data available for this point.";
        const [min, q1, median, q3, max] = params.data;
        const categoryName = categories[params.dataIndex];
        return `
          <b>${categoryName}</b><br/>
          Min: ${min}<br/>
          Q1: ${q1}<br/>
          Median: ${median}<br/>
          Q3: ${q3}<br/>
          Max: ${max}
        `;
      },
    },
    xAxis: {
      type: "category",
      data: categories,
      name: "Wafer ID",
      axisLabel: {
        interval: 0,
        rotate: 90,
      },
    },
    yAxis: {
      type: "value",
      name: "Value",
    },
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "inside",
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        yAxisIndex: 0,
        start: 0,
        end: 100,
        left: "5%", // Position the Y-axis slider on the left side
      },
      {
        type: "inside",
        yAxisIndex: 0,
        start: 0,
        end: 100,
      },
    ],
    // brush: {
    //   toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'clear'], // Available brush tools
    //   xAxisIndex: 0,
    //   yAxisIndex: 0,
    //   throttleDelay: 300, // Limit the number of brush events fired
    //   brushLink: 'all', // Link brushing across multiple axes

    // },
    toolbox: {
      feature: {
        // restore: {},
        saveAsImage: {},
      },
    },
    series: [
      {
        name: "Boxplot",
        type: "boxplot",
        data: boxPlotData,
        itemStyle: {
          borderWidth: 1.5,
          color: "#5470c6",
        },
      },
    ],
  };

  // const handleExportPNG = () => {
  //   const echartsInstance = chartRef.current.getEchartsInstance();
  //   const imgData = echartsInstance.getDataURL({
  //     type: 'png',
  //     backgroundColor: '#fff',
  //   });
  //   const link = document.createElement('a');
  //   link.href = imgData;
  //   link.download = 'chart.png';
  //   link.click();
  // };

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
    const worksheet = XLSX.utils.json_to_sheet(processedData.boxPlotData, {
      header: ["Min", "Q1", "Median", "Q3", "Max"],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");
    XLSX.writeFile(workbook, "chart-data.xlsx");
  };

  // Utility function to convert base64 to Uint8Array
  const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Updated handleExportWord function
  const handleExportWord = async () => {
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

  return (
    <div>
      <ReactECharts
        option={options}
        style={{ height: "500px", width: "100%" }}
        ref={chartRef}
      />
      <div>
        <p>
          Execution Time:{" "}
          {executionTime !== null ? `${executionTime} ms` : "Calculating..."}{" "}
          with {source.length - 1} datasets
        </p>
      </div>
      <ButtonGroup
        variant="contained"
        color="primary"
        style={{ marginTop: "10px" }}
      >
        {/* <Button onClick={handleExportPNG}>Export PNG</Button> */}
        <Button onClick={handleExportPDF}>Export PDF</Button>
        <Button onClick={handleExportExcel}>Export Excel</Button>
        <Button onClick={handleExportWord}>Export Word</Button>
        <Button onClick={handleExportPPT}>Export PPT</Button>
      </ButtonGroup>
    </div>
  );
};

export default BoxPlotChart;
