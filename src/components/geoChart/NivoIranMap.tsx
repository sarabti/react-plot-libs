import { ResponsiveChoropleth } from "@nivo/geo";

// Make sure your iranFeatures variable is imported or defined here
import iranFeatures from "../../data/iran-provinces.geo.json";
import { geoMercator } from "d3-geo";

const COLORS = {
  critical: { circle: "#f64c4c", shadow: "#f9b5b6" },
  warning: { circle: "#ff8801", shadow: "#f6c893" },
  okay: { circle: "#40bf7f", shadow: "#acdfc7" },
};

const mockLocations = [
  { longitude: 51.38, latitude: 35.68, degree: "critical" as const },
  { longitude: 59.6, latitude: 36.29, degree: "warning" as const },
  { longitude: 51.66, latitude: 32.65, degree: "okay" as const },
  { longitude: 46.29, latitude: 38.08, degree: "warning" as const },
  { longitude: 52.53, latitude: 29.59, degree: "okay" as const },
  { longitude: 48.33, latitude: 33.46, degree: "critical" as const },
  { longitude: 60.86, latitude: 29.49, degree: "okay" as const },
];

const NivoIranMap = () => {
  const width = 550;
  const height = 500;
  const projection = geoMercator()
    .scale(1300)
    .translate([width / 2 + (-12.2 * 100), height / 2 + (8 * 100)]);

  return (
    <>
      <h1>Iran Geo Map</h1>
      <div style={{ width, height }}>
        <svg style={{ height: 0, width: 0, position: "absolute" }}>
          <defs>
            <linearGradient id="provinceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#E4E4E4" />
            </linearGradient>
          </defs>
        </svg>
        <ResponsiveChoropleth
          data={[]}
          domain={[0, 100]}
          features={iranFeatures.features}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          projectionScale={1300}
          projectionTranslation={[-1.7, 2.1]}
          unknownColor="url(#provinceGradient)"
          borderWidth={1}
          borderColor="#ffffff"
          theme={{
            background: "transparent",
          }}
          layers={
            [
              "features",
              // Custom layer for the 7 locations
              () => {
                return (
                  <g>
                    {mockLocations.map((loc, i) => {
                      const projected = projection([
                        loc.longitude,
                        loc.latitude,
                      ]);

                      if (!projected) return null;
                      const [x, y] = projected;
                      const theme = COLORS[loc.degree];

                      return (
                        <g key={i}>
                          {/* Shadow Circle */}
                          <circle
                            cx={x}
                            cy={y}
                            r={7} // 2px + 1px shadow area
                            fill={theme.shadow}
                          />
                          {/* Main Dot */}
                          <circle cx={x} cy={y} r={4} fill={theme.circle} />
                        </g>
                      );
                    })}
                  </g>
                );
              },
            ] as any
          }
        />
      </div>
    </>
  );
};

export default NivoIranMap;
