import { ResponsivePie } from "@nivo/pie";

const data = [
  { id: "critical", label: "critical", value: 35, color: "#f64c4c" },
  { id: "info", label: "info", value: 20, color: "#40bf7f" },
  { id: "high", label: "high", value: 15, color: "#ff8801" },
  { id: "warning", label: "warning", value: 30, color: "#ffd47f" },
];

export const NivoPieChart = ({ width = 300, height = 300 }) => {
  return (
    <div style={{ width, height }}>
      <ResponsivePie
        data={data}
        // Matching your styling
        innerRadius={0.65}
        padAngle={2}
        cornerRadius={4}
        margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
        
        // Colors & Rendering
        colors={{ datum: "data.color" }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        
        // Animation (Enabled by default)
        animate={true}
        motionConfig="wobbly" 
        transitionMode="startAngle"
        
        // Legend
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateY: 40,
            itemsSpacing: 0,
            itemWidth: 60,
            itemHeight: 18,
            itemTextColor: "#333",
            itemDirection: "left-to-right",
            symbolSize: 12,
            symbolShape: "square",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};