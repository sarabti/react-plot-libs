import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";
import { VisxPieChart } from "./components/pieChart/VisxPieChart";
import VisxBarChartClip from "./components/barChart/VisxBarChartClip";
import VisxBarChartClipAndZoom from "./components/barChart/VisxBarChartClipAndZoom";
import AlertList from "./components/Lists/AlertList";
import alerts from "./data/alerts.json";

function App() {
  return (
    <>
      <div className="w-200 h-120 p-4">
        <AlertList items={alerts} />
      </div>
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
