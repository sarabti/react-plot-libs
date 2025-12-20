import { Mercator } from "@visx/geo";
import { LinearGradient } from "@visx/gradient";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { useTransition, animated } from "@react-spring/web";
import { feature } from "topojson-client";
import type { Feature } from "geojson";
import iranData from "../../data/iran-provinces.topo.json";

// --- Types & Constants ---
interface Location {
  id: string;
  longitude: number;
  latitude: number;
  degree: "critical" | "warning" | "okay";
  name: string;
}

const COLORS = {
  critical: { circle: "#f64c4c", shadow: "#f9b5b6" },
  warning: { circle: "#ff8801", shadow: "#f6c893" },
  okay: { circle: "#40bf7f", shadow: "#acdfc7" },
};

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Tehran",
    longitude: 51.389,
    latitude: 35.6892,
    degree: "critical",
  },
  {
    id: "2",
    name: "Mashhad",
    longitude: 59.6067,
    latitude: 36.2972,
    degree: "warning",
  },
  {
    id: "3",
    name: "Isfahan",
    longitude: 51.666,
    latitude: 32.6546,
    degree: "okay",
  },
  {
    id: "4",
    name: "Shiraz",
    longitude: 52.5836,
    latitude: 29.5918,
    degree: "critical",
  },
  {
    id: "5",
    name: "Tabriz",
    longitude: 46.2919,
    latitude: 38.0962,
    degree: "warning",
  },
  {
    id: "6",
    name: "Hamadan",
    longitude: 48.5162,
    latitude: 34.7982,
    degree: "okay",
  },
  {
    id: "7",
    name: "Yazd",
    longitude: 54.3995,
    latitude: 31.8974,
    degree: "okay",
  },
];

const VisxIranMap = () => {
  const provinces = feature(iranData as any, (iranData as any).objects.iran)
    .features as Feature[];

  // Tooltip State
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<Location>();

  // React Spring Transition Logic
  const transitions = useTransition(
    tooltipOpen && tooltipData ? [tooltipData] : [],
    {
      from: { opacity: 0, transform: "scale(0.9) translateY(10px)" },
      enter: { opacity: 1, transform: "scale(1) translateY(0px)" },
      leave: { opacity: 0, transform: "scale(0.9) translateY(5px)" },
      config: { tension: 300, friction: 20 },
    }
  );

  return (
    <div
      style={{ position: "relative", width: "500px", fontFamily: "sans-serif" }}
    >
      <h1>Iran Map Iran</h1>

      <svg width={500} height={450} style={{ overflow: "visible" }}>
        <LinearGradient id="province-gradient" from="#ffffff" to="#E4E4E4" />

        <Mercator data={provinces} scale={1300} translate={[-1000, 1000]}>
          {(mercator) => (
            <g>
              {/* Draw Provinces */}
              {mercator.features.map(({ path }, i) => (
                <path
                  key={`province-${i}`}
                  d={path || ""}
                  fill="url(#province-gradient)"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}

              {/* Draw Locations */}
              {mockLocations.map((loc) => {
                const coords = mercator.projection([
                  loc.longitude,
                  loc.latitude,
                ]);
                if (!coords) return null;
                const [cx, cy] = coords;
                const style = COLORS[loc.degree];

                return (
                  <g
                    key={loc.id}
                    className="map-pin"
                    onMouseEnter={() => {
                      showTooltip({
                        tooltipData: loc,
                        tooltipLeft: cx,
                        tooltipTop: cy,
                      });
                    }}
                    onMouseLeave={() => hideTooltip()}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Invisible Hit Area (makes hovering easier) */}
                    <circle cx={cx} cy={cy} r={14} fill="transparent" />

                    {/* Outer Circle (Shadow) */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill={style.shadow}
                      opacity={0.6}
                      className="outer-ring"
                      style={{ transition: "all 0.2s ease-in-out" }}
                    />
                    {/* Inner Circle (Core) */}
                    <circle cx={cx} cy={cy} r={5} fill={style.circle} />
                  </g>
                );
              })}
            </g>
          )}
        </Mercator>
      </svg>

      {/* --- Animated Tooltip Card --- */}
      {transitions(
        (animStyle, item) =>
          item &&
          tooltipTop &&
          tooltipLeft && (
            <TooltipWithBounds
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                translate: "0 100px",
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
                pointerEvents: "none", 
              }}
            >
              <animated.div style={animStyle}>
                <div
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #f0f0f0",
                    minWidth: "140px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      Status:{" "}
                      <span
                        style={{
                          color: COLORS[item.degree].circle,
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.degree}
                      </span>
                    </p>
                  </div>
                </div>
              </animated.div>
            </TooltipWithBounds>
          )
      )}
    </div>
  );
};

export default VisxIranMap;
