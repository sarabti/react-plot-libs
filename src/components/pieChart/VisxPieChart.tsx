import React, { useState } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { animated, useTransition } from "@react-spring/web";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";

type PieDatum = {
  name: string;
  color: string;
  percent: number;
  hoverShadow: string;
};

const data: PieDatum[] = [
  { name: "critical", color: "#f64c4c", percent: 35, hoverShadow: "#f9b5b6" },
  { name: "info", color: "#40bf7f", percent: 20, hoverShadow: "#acdfc7" },
  { name: "high", color: "#ff8801", percent: 15, hoverShadow: "#f6c893" },
  { name: "warning", color: "#ffd47f", percent: 30, hoverShadow: "#f6c893" },
];

export const VisxPieChart: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 300,
}) => {
  const chartHeight = height - 80;
  const radius = Math.min(width, chartHeight) / 2 - 20;
  const innerRadius = radius * 0.65;
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } =
    useTooltip<PieDatum>();

  // Implementation of useTransition for Mount/Unmount animations
  const transitions = useTransition(tooltipData, {
    from: { opacity: 0, transform: "scale(0.9) translateY(10px)" },
    enter: { opacity: 1, transform: "scale(1) translateY(0px)" },
    leave: { opacity: 0, transform: "scale(0.9) translateY(10px)" },
    config: {
      duration: 200,
      easing: (t) => t * t, // Ease-In
    },
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
            {(pie) => (
              <g>
                {pie.arcs.map((arc) => {
                  const { name, color, hoverShadow } = arc.data;
                  const isHovered = hoveredName === name;
                  const shadowColor = isHovered ? hoverShadow : "transparent";
                  return (
                    <animated.path
                      key={name}
                      d={pie.path(arc) || ""}
                      fill={color}
                      style={{
                        cursor: "pointer",
                        transition: "filter 0.3s ease-in",
                        // Using drop-shadow filter directly in CSS for reactivity
                        filter: isHovered
                          ? `drop-shadow(0px 0px 10px ${shadowColor})`
                          : "none",
                      }}
                      onMouseMove={(event: React.MouseEvent) => {
                        setHoveredName(arc.data.name);
                        const coords = localPoint(event) || { x: 0, y: 0 };
                        showTooltip({
                          tooltipData: arc.data,
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredName(null);
                        hideTooltip();
                      }}
                    />
                  );
                })}
              </g>
            )}
          </Pie>
        </Group>
      </svg>

      {/* Tooltip rendered via Transitions */}
      {transitions(
        (style, item) =>
          item &&
          tooltipLeft &&
          tooltipTop && (
            <animated.div
              style={{
                ...style,
                position: "absolute",
                left: tooltipLeft,
                top: tooltipTop,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <TooltipWithBounds
                // Reset internal bounds positioning logic
                top={0}
                left={0}
                style={{
                  ...defaultStyles,
                  backgroundColor: "white",
                  color: "#1a1a1a",
                  padding: "12px",
                  borderRadius: "10px", // Rounded borders
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Soft shadow
                  border: "1px solid #f0f0f0",
                  fontSize: "13px",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />
                  <span
                    style={{ fontWeight: 700, textTransform: "capitalize" }}
                  >
                    {item.name}
                  </span>
                </div>
                <div style={{ marginTop: "4px", color: "#666" }}>
                  Share: <b>{item.percent}%</b>
                </div>
              </TooltipWithBounds>
            </animated.div>
          )
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        {data.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: 3,
              }}
            />
            <span
              style={{
                color: "#333",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
