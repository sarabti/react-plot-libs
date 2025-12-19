import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";
import { VisxPieChart } from "./components/pieChart/VisxPieChart";
import { NivoPieChart } from "./components/pieChart/NivoPieChart";

function App() {
  return (
    <>
      <div className="chart-group">
        <VisxPieChart />
        <NivoPieChart />
      </div>
      <VisxIranMap />
      <NivoIranMap />
    </>
  );
}

export default App;
