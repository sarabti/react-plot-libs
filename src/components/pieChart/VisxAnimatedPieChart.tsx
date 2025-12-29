import React, { useState, useMemo } from 'react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { arc as d3Arc } from 'd3-shape';
import { animated, useSpring, to } from '@react-spring/web';

// --- Types ---
interface DataItem {
  id: string;
  value: number;
}

interface SliceProps {
  arc: PieArcDatum<DataItem>;
  path: any;
  fill: string;
}

const AnimatedPath = animated('path');

const Slice = ({ arc, path, fill }: SliceProps) => {
  const { startAngle, endAngle } = arc;

  // By using the 'to' key in useSpring, react-spring knows to 
  // animate from the current state to the new angles provided.
  const springs = useSpring({
    to: { 
      startAngle, 
      endAngle 
    },
    // We omit 'from' here so that subsequent updates 
    // animate from the current animated position.
    config: { tension: 80, friction: 20 },
  });

  return (
    <AnimatedPath
      d={to([springs.startAngle, springs.endAngle], (s, e) => {
        return path({ ...arc, startAngle: s, endAngle: e }) || '';
      })}
      fill={fill}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

export default function AnimatedPieChart() {
  const width = 250;
  const height = 250;

  const [data, setData] = useState<DataItem[]>([
    { id: '1', value: 33 },
    { id: '2', value: 33 },
    { id: '3', value: 34 },
  ]);

  const radius = width / 2;
  const arcGenerator = useMemo(
    () => d3Arc<PieArcDatum<DataItem>>().outerRadius(radius).innerRadius(radius * 0.4),
    [radius]
  );

  const colors = ['#43b284', '#fab255', '#6086d6'];

  const randomizeData = () => {
    setData(prev => prev.map(d => ({
      ...d,
      value: Math.floor(Math.random() * 90) + 10
    })));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={width} height={height}>
        <Group top={height / 2} left={width / 2}>
          <Pie
            data={data}
            pieValue={(d) => d.value}
            outerRadius={radius}
          >
            {(pie) => {
              return pie.arcs.map((arc, i) => (
                <Slice
                  // CRITICAL: The key must be stable (d.id) 
                  // so React doesn't destroy/recreate the component.
                  key={arc.data.id}
                  arc={arc}
                  path={arcGenerator}
                  fill={colors[i]}
                />
              ));
            }}
          </Pie>
        </Group>
      </svg>
      <br />
      <button onClick={randomizeData} style={{ marginTop: 20 }}>
        Randomize
      </button>
    </div>
  );
}