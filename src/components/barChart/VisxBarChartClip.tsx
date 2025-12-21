import { useState, useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { useSpring, animated } from "@react-spring/web";
import { ClipPath } from "@visx/clip-path";
import { localPoint } from "@visx/event";
import { toPng } from "html-to-image";

const AnimatedBar = animated(Bar);
const AnimatedText = animated("text");

type DataPoint = {
  month: string;
  color: string;
  value: number;
};

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

const actionButtonStyle = {
  background: "rgba(255,255,255,0.8)",
  border: "1px solid #ccc",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};

const AnimatedBarGroup = ({ d, barX, barY, barHeight }: any) => {
  const springProps = useSpring({
    to: { y: barY, height: barHeight },
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
        y={springProps.y.to((y: number) => y - 6)}
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        fill="#333"
      >
        {Math.round(d.value)}
      </AnimatedText>
    </g>
  );
};

export default function VisxBarChartClip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DataPoint[]>(initialData);

  // Selection/Crop States
  const [isCropMode, setIsCropMode] = useState(false);
  const [selection, setSelection] = useState<{ x1: number; x2: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic Width based on data length
  const xMax = (BAR_WIDTH + BAR_PADDING) * data.length;
  const chartWidth = xMax + MARGIN.left + MARGIN.right;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        domain: data.map((d) => d.month),
        padding: BAR_PADDING / (BAR_WIDTH + BAR_PADDING),
      }),
    [data, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [INNER_HEIGHT, 0],
        domain: [0, 110],
      }),
    []
  );

  // --- Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropMode) return;
    const point = localPoint(e);
    if (!point) return;
    setIsDragging(true);
    const x = point.x - MARGIN.left;
    setSelection({ x1: x, x2: x });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selection) return;
    const point = localPoint(e);
    if (!point) return;
    setSelection({ ...selection, x2: point.x - MARGIN.left });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = () => {
    if (!selection) return;
    const x0 = Math.min(selection.x1, selection.x2);
    const x1 = Math.max(selection.x1, selection.x2);

    const filtered = data.filter((d) => {
      const pos = (xScale(d.month) || 0) + BAR_WIDTH / 2;
      return pos >= x0 && pos <= x1;
    });

    if (filtered.length > 0) setData(filtered);
    setSelection(null);
    setIsCropMode(false);
  };

  const handleExport = async () => {
    if (containerRef.current) {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = "chart-crop.png";
      link.href = dataUrl;
      link.click();
    }
  };

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
        marginLeft: "20px",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: "1px solid #ddd",
          cursor: isCropMode ? "crosshair" : "default",
        }}
      >
        <svg
          width={chartWidth}
          height={CHART_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <rect width={chartWidth} height={CHART_HEIGHT} fill="#fff" />

          {/* ClipPath Setup */}
          <ClipPath id="zoom-clip">
            <rect width={xMax} height={INNER_HEIGHT} />
          </ClipPath>

          <Group top={MARGIN.top} left={MARGIN.left}>
            {/* Grid Lines */}
            {[0, 20, 40, 60, 80, 100].map((tick) => (
              <line
                key={`l-${tick}`}
                x1={0}
                x2={xMax}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#efefef"
              />
            ))}

            {/* Bars wrapped in ClipPath */}
            <Group clipPath="url(#zoom-clip)">
              {data.map((d) => (
                <AnimatedBarGroup
                  key={d.month}
                  d={d}
                  barX={xScale(d.month) ?? 0}
                  barY={yScale(d.value) ?? 0}
                  barHeight={INNER_HEIGHT - (yScale(d.value) ?? 0)}
                />
              ))}
            </Group>

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

            {/* Selection Rectangle */}
            {selection && (
              <rect
                x={Math.min(selection.x1, selection.x2)}
                y={0}
                width={Math.abs(selection.x2 - selection.x1)}
                height={INNER_HEIGHT}
                fill="rgba(0, 123, 255, 0.2)"
                stroke="#007bff"
                strokeDasharray="4"
                style={{ pointerEvents: "none" }}
              />
            )}
          </Group>
        </svg>
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <button
            onClick={() => {
              setIsCropMode(!isCropMode);
              setSelection(null);
            }}
            style={actionButtonStyle}
          >
            {isCropMode ? "Cancel Crop" : "Crop"}
          </button>
          <button
            onClick={handleZoom}
            disabled={!selection}
            style={actionButtonStyle}
          >
            Zoom In
          </button>
          <button
            onClick={handleExport}
            disabled={!selection}
            style={actionButtonStyle}
          >
            Export PNG
          </button>
          <button
            onClick={() => setData(initialData)}
            style={actionButtonStyle}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 20,
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
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Randomize Values
      </button>
    </div>
  );
}
