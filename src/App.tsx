import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";
import { VisxPieChart } from "./components/pieChart/VisxPieChart";
import VisxBarChartClip from "./components/barChart/VisxBarChartClip";
import VisxBarChartClipAndZoom from "./components/barChart/VisxBarChartClipAndZoom";

function App() {
  return (
    <>
      <div className="chart-group">
        <VisxBarChartClipAndZoom />
        <VisxBarChartClip />
      </div>
      <VisxPieChart />
      <VisxIranMap />
      <NivoIranMap />
    </>
  );
}

export default App;
