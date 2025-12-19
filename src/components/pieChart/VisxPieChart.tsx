import React from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { animated, useSpring, to } from "@react-spring/web";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";

type PieDatum = {
  name: string;
  color: string;
  percent: number;
};

const data: PieDatum[] = [
  { name: "critical", color: "#f64c4c", percent: 35 },
  { name: "info", color: "#40bf7f", percent: 20 },
  { name: "high", color: "#ff8801", percent: 15 },
  { name: "warning", color: "#ffd47f", percent: 30 },
];

// Sub-component for individual animated slices
const AnimatedPath = ({ arc, path, ...props }: { arc: any; path: any; [key: string]: any }) => {
  const { startAngle, endAngle, opacity } = useSpring({
    from: { startAngle: arc.startAngle, endAngle: arc.startAngle, opacity: 0 },
    to: { startAngle: arc.startAngle, endAngle: arc.endAngle, opacity: 1 },
    config: { tension: 170, friction: 26 },
  });

  return (
    <animated.path
      {...props}
      d={to([startAngle, endAngle], (start, end) =>
        path({ ...arc, startAngle: start, endAngle: end })
      )}
      fill={arc.data.color}
      style={{ opacity, cursor: "pointer", ...props.style }}
    />
  );
};

export const VisxPieChart: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 280,
}) => {
  const chartHeight = height - 80;
  const radius = Math.min(width, chartHeight) / 2;
  const innerRadius = radius * 0.65;

  // Tooltip State
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<PieDatum>();

  // Smooth movement for the tooltip
  const tooltipSpring = useSpring({
    to: {
      left: tooltipLeft ?? 0,
      top: tooltipTop ?? 0,
      opacity: tooltipData ? 1 : 0,
    },
    config: { tension: 100, friction: 50 },
  });

  return (
    <div style={{ position: "relative", fontFamily: "sans-serif", width }}>
      <svg width={width} height={chartHeight}>
        <Group top={chartHeight / 2} left={width / 2}>
          <Pie
            data={data}
            pieValue={(d) => d.percent}
            outerRadius={radius}
            innerRadius={innerRadius}
            padAngle={0.04}
            cornerRadius={4}
          >
            {(pie) =>
              pie.arcs.map((arc) => (
                <AnimatedPath
                  key={arc.data.name}
                  arc={arc}
                  path={pie.path}
                  onMouseMove={(event: React.MouseEvent) => {
                    const coords = localPoint(event) || { x: 0, y: 0 };
                    showTooltip({
                      tooltipData: arc.data,
                      tooltipLeft: coords.x,
                      tooltipTop: coords.y,
                    });
                  }}
                  onMouseLeave={hideTooltip}
                />
              ))
            }
          </Pie>
        </Group>
      </svg>

      {/* Animated Tooltip Container */}
      {tooltipData && (
        <animated.div
          style={{
            ...tooltipSpring,
            position: "absolute",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <TooltipWithBounds
            // eslint-disable-next-line react-hooks/purity
            key={Math.random()} // Forces update for positioning
            top={0}
            left={0}
            style={{
              ...defaultStyles,
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>
              {tooltipData.name}
            </div>
            <div>{tooltipData.percent}% of total</div>
          </TooltipWithBounds>
        </animated.div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {data.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 3 }} />
            <span style={{ color: "#333", fontWeight: 500, textTransform: "capitalize" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};