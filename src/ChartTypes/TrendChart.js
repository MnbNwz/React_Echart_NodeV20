import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const TrendChartBySite = ({ source }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && source?.length > 0) {
      const chart = echarts.init(chartRef.current, null, {
        renderer: "canvas",
      }); // Use canvas for faster rendering

      // Define a color map for site numbers
      const siteColorMap = {
        1: "#ff0000", // Red for site 1
        2: "#00ff00", // Green for site 2
        3: "#0000ff", // Blue for site 3
        4: "#ff00ff", // Magenta for site 4
      };

      const option = {
        tooltip: false, // Disable tooltip for performance
        grid: {
          left: "10%",
          right: "10%",
          top: "10%",
          bottom: "10%",
        },
        xAxis: {
          type: "value",
          name: "Occurrence",
          nameLocation: "middle",
          nameGap: 25,
          min: 1,
          max: source.length, // Set X-axis range dynamically
        },
        yAxis: {
          type: "value",
          name: "Value",
          nameLocation: "middle",
          nameGap: 40,
        },
        series: [
          {
            type: "scatter",
            data: source.map(([site, value], index) => [
              index + 1,
              value,
              site,
            ]),
            symbolSize: 2, // Small size for points
            sampling: "lttb", // Use sampling to reduce points without losing trends
            progressive: 50000, // Render 50k points at a time
            progressiveThreshold: 300000, // Use progressive rendering after 300k points
            itemStyle: {
              color: (params) => siteColorMap[params.data[2]] || "#000000", // Assign color by site
            },
          },
        ],
      };

      chart.setOption(option);

      chart.on("finished", () => {});

      // Handle chart resizing
      const handleResize = () => {
        chart.resize();
      };
      window.addEventListener("resize", handleResize);

      // Cleanup on unmount
      return () => {
        chart.dispose();
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [source]);

  return (
    <div>
      <div ref={chartRef} style={{ width: "100%", height: "500px" }}></div>
      <p>Executing {source.length - 1} datasets</p>
    </div>
  );
};

export default TrendChartBySite;
