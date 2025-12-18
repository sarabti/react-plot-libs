import { Mercator } from "@visx/geo";
import { LinearGradient } from "@visx/gradient";
import { feature } from "topojson-client";
import type { Feature } from "geojson";
import iranData from "../../data/iran-provinces.topo.json";
interface Location {
  longitude: number;
  latitude: number;
  degree: "critical" | "warning" | "okay";
}

const COLORS = {
  critical: { circle: "#f64c4c", shadow: "#f9b5b6" },
  warning: { circle: "#ff8801", shadow: "#f6c893" },
  okay: { circle: "#40bf7f", shadow: "#acdfc7" },
};

// Mock Data Generator
const mockLocations: Location[] = [
  { longitude: 51.389, latitude: 35.6892, degree: "critical" }, // Tehran
  { longitude: 59.6067, latitude: 36.2972, degree: "warning" }, // Mashhad
  { longitude: 51.666, latitude: 32.6546, degree: "okay" }, // Isfahan
  { longitude: 52.5836, latitude: 29.5918, degree: "critical" }, // Shiraz
  { longitude: 46.2919, latitude: 38.0962, degree: "warning" }, // Tabriz
  { longitude: 48.5162, latitude: 34.7982, degree: "okay" }, // Hamadan
  { longitude: 54.3995, latitude: 31.8974, degree: "okay" }, // Yazd
];

const VisxIranMap = () => {
  const provinces = feature(iranData as any, (iranData as any).objects.iran)
    .features as Feature[];

  return (
    <>
      <h1>Iran Map with Visx</h1>
      <svg width={500} height={450}>
        <LinearGradient
          id="province-gradient"
          from="#ffffff"
          to="#E4E4E4"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        />

        <Mercator data={provinces} scale={1300} translate={[-1000, 1000]}>
          {(mercator) => (
            <g>
              {/* Draw Provinces */}
              {mercator.features.map(({ feature, path }, i) => (
                <path
                  key={`province-${i}`}
                  d={path || ""}
                  fill="url(#province-gradient)"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}

              {mockLocations.map((loc, i) => {
                const coords = mercator.projection([
                  loc.longitude,
                  loc.latitude,
                ]);
                if (!coords) return null;
                const [cx, cy] = coords;
                const style = COLORS[loc.degree];

                return (
                  <g key={`loc-${i}`}>
                    <circle cx={cx} cy={cy} r={7} fill={style.shadow} />
                    <circle cx={cx} cy={cy} r={4} fill={style.circle} />
                  </g>
                );
              })}
            </g>
          )}
        </Mercator>
      </svg>
    </>
  );
};

export default VisxIranMap;
