import { useState, useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { useSpring, animated } from "@react-spring/web";
import { RectClipPath } from "@visx/clip-path";
import { localPoint } from "@visx/event";
import { toPng } from "html-to-image";
import { Zoom } from "@visx/zoom"; // Added

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

export default function VisxBarChartClipAndZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [isCropMode, setIsCropMode] = useState(false);

  // Updated selection to include Y
  const [selection, setSelection] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleExport = async () => {
    if (containerRef.current && selection) {
      try {
        // 1. Calculate the actual top-left and dimensions of the selection
        const x = Math.min(selection.x1, selection.x2) + MARGIN.left;
        const y = Math.min(selection.y1, selection.y2) + MARGIN.top;
        const width = Math.abs(selection.x2 - selection.x1);
        const height = Math.abs(selection.y2 - selection.y1);

        // 2. Use options to crop the output to the selection area
        const dataUrl = await toPng(containerRef.current, {
          backgroundColor: "#fff",
          // These properties define the "clip" of the export
          canvasWidth: width,
          canvasHeight: height,
          width: width,
          height: height,
          style: {
            // Move the container so the selected area starts at (0,0) in the export
            transform: `translate(-${x}px, -${y}px)`,
            transformOrigin: "top left",
          },
        });

        const link = document.createElement("a");
        link.download = `chart-selection-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to export selection:", error);
      }
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
      }}
    >
      <Zoom<SVGSVGElement>
        width={chartWidth}
        height={CHART_HEIGHT}
        scaleXMin={1}
        scaleXMax={10}
        scaleYMin={1}
        scaleYMax={10}
      >
        {(zoom) => (
          <div
            ref={containerRef}
            style={{
              position: "relative",
              border: "1px solid #ddd",
            }}
          >
            <svg
              width={chartWidth}
              height={CHART_HEIGHT}
              style={{
                cursor: isCropMode ? "crosshair" : "default",
                touchAction: "none",
              }}
              onMouseDown={(e) => {
                if (!isCropMode) return;
                const point = localPoint(e);
                if (!point) return;
                setIsDragging(true);
                // Adjust for margins to get local chart coordinates
                const x = point.x - MARGIN.left;
                const y = point.y - MARGIN.top;
                setSelection({ x1: x, y1: y, x2: x, y2: y });
              }}
              onMouseMove={(e) => {
                if (!isDragging || !selection) return;
                const point = localPoint(e);
                if (!point) return;
                setSelection({
                  ...selection,
                  x2: point.x - MARGIN.left,
                  y2: point.y - MARGIN.top,
                });
              }}
              onMouseUp={() => {
                setIsDragging(false);
              }}
            >
              <rect width={chartWidth} height={CHART_HEIGHT} fill="#fff" />

              <Group top={MARGIN.top} left={MARGIN.left}>
                {/* We apply the zoom transform only to the data elements */}
                <g transform={zoom.toString()}>
                  <RectClipPath
                    id="zoom-clip"
                    width={xMax}
                    height={INNER_HEIGHT}
                  />

                  <Group clipPath="url(#zoom-clip)">
                    {/* Grid Lines */}
                    {[0, 20, 40, 60, 80, 100].map((tick) => (
                      <line
                        key={`l-${tick}`}
                        x1={0}
                        x2={xMax}
                        y1={yScale(tick)}
                        y2={yScale(tick)}
                        stroke="#efefef"
                        strokeWidth={1 / zoom.transformMatrix.scaleX}
                      />
                    ))}

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
                </g>

                {/* UI Selection Overlay (Fixed to screen space, not zoomed) */}
                {/* {selection && (
                  <rect
                    x={Math.min(selection.x1, selection.x2)}
                    y={0} // To keep vertical visual consistency, though we track Y for logic
                    width={Math.abs(selection.x2 - selection.x1)}
                    height={INNER_HEIGHT}
                    fill="rgba(255, 255, 255, 0.g1)"
                    stroke="#007bff"
                    strokeDasharray="4"
                  />
                )} */}
                {/* Secondary horizontal selection indicator */}
                {selection && isCropMode && (
                  <rect
                    x={Math.min(selection.x1, selection.x2)}
                    y={Math.min(selection.y1, selection.y2)}
                    width={Math.abs(selection.x2 - selection.x1)}
                    height={Math.abs(selection.y2 - selection.y1)}
                    fill="rgba(255, 255, 255, 0.2)"
                    stroke="#007bff"
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
                zIndex: 10,
              }}
            >
              <button
                onClick={() => {
                  setIsCropMode(!isCropMode);
                  setSelection(null);
                }}
                style={actionButtonStyle}
              >
                {isCropMode ? "Cancel" : "Select Area"}
              </button>

              <button
                disabled={!selection}
                style={actionButtonStyle}
                onClick={() => {
                  if (!selection) return;
                  const { x1, y1, x2, y2 } = selection;
                  const selW = Math.abs(x2 - x1);
                  const selH = Math.abs(y2 - y1);
                  if (selW < 5 || selH < 5) return;

                  // Calculate required scale to fit selection to view
                  const scaleX = xMax / selW;
                  const scaleY = INNER_HEIGHT / selH;
                  const newScale = Math.min(scaleX, scaleY);

                  // Calculate translation to center the selection
                  const centerX = (x1 + x2) / 2;
                  const centerY = (y1 + y2) / 2;

                  zoom.setTransformMatrix({
                    scaleX: newScale,
                    scaleY: newScale,
                    translateX: xMax / 2 - centerX * newScale,
                    translateY: INNER_HEIGHT / 2 - centerY * newScale,
                    skewX: 0,
                    skewY: 0,
                  });

                  setSelection(null);
                  setIsCropMode(false);
                }}
              >
                Zoom To Box
              </button>
              <button
                onClick={handleExport}
                disabled={!selection}
                style={actionButtonStyle}
              >
                Export PNG
              </button>
              <button onClick={() => zoom.reset()} style={actionButtonStyle}>
                Reset Zoom
              </button>
            </div>
          </div>
        )}
      </Zoom>
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
