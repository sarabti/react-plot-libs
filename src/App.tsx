import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";
import { VisxPieChart } from "./components/pieChart/VisxPieChart";
import VisxBarChartZoom from "./components/barChart/VisxBarChartZoom";
import VisxBarChartClip from "./components/barChart/VisxBarChartClip";

function App() {
  return (
    <>
      <div className="chart-group">
        <VisxBarChartZoom />
        <VisxBarChartClip />
      </div>
      <VisxPieChart />
      <VisxIranMap />
      <NivoIranMap />
    </>
  );
}

export default App;
