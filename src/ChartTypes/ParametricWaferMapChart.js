import React, { useMemo, useRef, useEffect } from "react";
import * as echarts from "echarts";
import "echarts-gl"; // Ensure WebGL support

const WaferMap = ({ source }) => {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  const optionsPiecewise = useMemo(() => {
    return {
      title: {
        text: `Parametric Wafer Map - Piecewise with ${source.length} datasets`,
        left: "center",
      },
      tooltip: {
        position: "top",
        formatter: (params) => {
          return `X: ${params.data[0]}<br/>Y: ${params.data[1]}<br/>Value: ${params.data[2]}`;
        },
      },
      xAxis: {
        type: "value",
        splitLine: { show: true },
      },
      yAxis: {
        type: "value",
        splitLine: { show: true },
      },
      visualMap: {
        type: "piecewise",
        pieces: [
          { min: 0, max: 1, color: "#313695" },
          { min: 1, max: 2, color: "#4575b4" },
          { min: 2, max: 3, color: "#74add1" },
          { min: 3, max: 4, color: "#abd9e9" },
          { min: 4, max: 5, color: "#e0f3f8" },
          { min: 5, max: 6, color: "#ffffbf" },
          { min: 6, max: 7, color: "#fee090" },
          { min: 7, max: 8, color: "#fdae61" },
          { min: 8, max: 9, color: "#f46d43" },
          { min: 9, max: 10, color: "#d73027" },
        ],
        calculable: true,
        orient: "vertical",
        left: "left",
        bottom: "center",
        inactiveColor: "#f0f0f0", // Ensure deselected data shows this color
        outOfRange: {
          color: "#f0f0f0", // Explicit color for data outside selected ranges
        },
      },
      grid: {
        left: "15%",
      },
      series: [
        {
          type: "custom",
          data: source,
          renderItem: (params, api) => {
            const [x, y] = [api.value(0), api.value(1)];
            const xPos = api.coord([x, y])[0];
            const yPos = api.coord([x, y])[1];

            return {
              type: "rect",
              shape: {
                x: xPos - 1.5,
                y: yPos - 1.5,
                width: 3,
                height: 3,
              },
              style: api.style({
                fill: api.visual("color"),
              }),
            };
          },
        },
      ],
    };
  }, [source]);

  const optionsContinuous = useMemo(() => {
    return {
      title: {
        text: `Parametric Wafer Map - Continuous with ${source.length} datasets`,
        left: "center",
        left: "center",
      },
      tooltip: {
        position: "top",
        formatter: (params) => {
          return `X: ${params.data[0]}<br/>Y: ${params.data[1]}<br/>Value: ${params.data[2]}`;
        },
      },
      xAxis: {
        type: "value",
        splitLine: { show: true },
      },
      yAxis: {
        type: "value",
        splitLine: { show: true },
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: "vertical",
        left: "left",
        bottom: "center",
        inRange: {
          color: [
            "#313695",
            "#4575b4",
            "#74add1",
            "#abd9e9",
            "#e0f3f8",
            "#ffffbf",
            "#fee090",
            "#fdae61",
            "#f46d43",
            "#d73027",
          ],
        },
      },
      grid: {
        left: "15%",
      },
      series: [
        {
          type: "custom",
          data: source,
          renderItem: (params, api) => {
            const [x, y] = [api.value(0), api.value(1)];
            const xPos = api.coord([x, y])[0];
            const yPos = api.coord([x, y])[1];

            return {
              type: "rect",
              shape: {
                x: xPos - 1.5,
                y: yPos - 1.5,
                width: 3,
                height: 3,
              },
              style: api.style({
                fill: api.visual("color"),
              }),
            };
          },
        },
      ],
    };
  }, [source]);

  useEffect(() => {
    if (chartRef1.current) {
      const chart1 = echarts.init(chartRef1.current);
      chart1.setOption(optionsPiecewise);

      return () => {
        chart1.dispose();
      };
    }
  }, [optionsPiecewise]);

  useEffect(() => {
    if (chartRef2.current) {
      const chart2 = echarts.init(chartRef2.current);
      chart2.setOption(optionsContinuous);

      return () => {
        chart2.dispose();
      };
    }
  }, [optionsContinuous]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          <div ref={chartRef1} style={{ width: "900px", height: "900px" }} />
        </div>
        <div>
          <div
            ref={chartRef2}
            style={{ width: "900px", height: "900px" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WaferMap;
