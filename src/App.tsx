import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";
import { VisxPieChart } from "./components/pieChart/VisxPieChart";
import VisxBarChart from "./components/barChart/VisxBarChart";

function App() {
  return (
    <>
      <div className="chart-group">
        <VisxPieChart />
        <VisxBarChart />
      </div>
      <VisxIranMap />
      <NivoIranMap />
    </>
  );
}

export default App;
