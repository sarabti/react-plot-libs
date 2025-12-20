import { useState, useMemo } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { useSpring, animated } from "@react-spring/web";

// Create animated versions of SVG elements
const AnimatedBar = animated(Bar);
const AnimatedText = animated("text");

type DataPoint = {
  month: string;
  color: string;
  value: number;
};

// ... (initialData, legend, and getRandomValue remain the same)
const initialData: DataPoint[] = [
  { month: "jan", color: "#f64c4c", value: 50 },
  { month: "feb", color: "#ff8801", value: 30 },
  { month: "mar", color: "#40bf7f", value: 70 },
  { month: "apr", color: "#ffd47f", value: 90 },
  { month: "may", color: "#40bf7f", value: 40 },
  { month: "jun", color: "#f64c4c", value: 60 },
];

const legend = [
  { color: "#f64c4c", degree: "Critical" },
  { color: "#ff8801", degree: "High" },
  { color: "#40bf7f", degree: "Info" },
  { color: "#ffd47f", degree: "Warning" },
];

const getRandomValue = () => Math.floor(Math.random() * (100 - 10 + 1)) + 10;
const BAR_WIDTH = 35;
const BAR_PADDING = 25;
const MARGIN = { top: 30, right: 20, bottom: 40, left: 20 };
const CHART_HEIGHT = 280;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const CHART_WIDTH =
  (BAR_WIDTH + BAR_PADDING) * initialData.length + MARGIN.left + MARGIN.right;

/**
 * Sub-component to handle animation for each bar and its label
 */
const AnimatedBarGroup = ({ d, barX, barY, barHeight }: any) => {
  const springProps = useSpring({
    to: { y: barY, height: barHeight },
    // config mimics an 'ease-in-out' feel without a heavy bounce
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <g transform={`translate(${barX}, 0)`}>
      <AnimatedBar
        x={0}
        y={springProps.y}
        width={BAR_WIDTH}
        height={springProps.height}
        fill={d.color}
        rx={8}
        ry={8}
      />
      <AnimatedText
        x={BAR_WIDTH / 2}
        // This is the magic part: it recalculates 3px above the bar's Y every frame
        y={springProps.y.to((y: number) => y - 6)}
        fontSize={10}
        fontWeight="light"
        textAnchor="middle"
        fill="#333"
      >
        {d.value}
      </AnimatedText>
    </g>
  );
};

export default function VisxBarChart() {
  const [data, setData] = useState<DataPoint[]>(initialData);

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, (BAR_WIDTH + BAR_PADDING) * data.length],
        domain: data.map((d) => d.month),
        padding: BAR_PADDING / (BAR_WIDTH + BAR_PADDING),
      }),
    [data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [INNER_HEIGHT, 0],
        domain: [0, 100],
      }),
    []
  );

  const randomizeData = () => {
    setData((prev) => prev.map((d) => ({ ...d, value: getRandomValue() })));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Group top={MARGIN.top} left={MARGIN.left}>
          {/* Dashed Horizontal Lines */}
          {[0, 20, 40, 60, 80, 100].map((tick) => (
            <line
              key={`line-${tick}`}
              x1={0}
              x2={CHART_WIDTH - MARGIN.left - MARGIN.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#efefef"
              strokeWidth={1}
            />
          ))}

          {/* Animated Bars & Labels */}
          {data.map((d) => (
            <AnimatedBarGroup
              key={d.month}
              d={d}
              barX={xScale(d.month) ?? 0}
              barY={yScale(d.value) ?? 0}
              barHeight={INNER_HEIGHT - (yScale(d.value) ?? 0)}
              
            />
          ))}

          {/* X-Axis Labels */}
          {data.map((d) => (
            <text
              key={`label-${d.month}`}
              x={(xScale(d.month) ?? 0) + BAR_WIDTH / 2}
              y={INNER_HEIGHT + 15}
              fontSize={10}
              textAnchor="middle"
              fill="#666"
            >
              {d.month}
            </text>
          ))}
        </Group>
      </svg>

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
        {legend.map((item) => (
          <div
            key={item.color}
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
            <span style={{ color: "#333", fontWeight: 500 }}>
              {item.degree}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={randomizeData}
        style={{ marginTop: "20px", padding: "8px 16px", cursor: "pointer" }}
      >
        Randomize Values
      </button>
    </div>
  );
}
