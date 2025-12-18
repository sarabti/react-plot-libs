import NivoIranMap from "./components/geoChart/NivoIranMap";
import "./App.css";
import VisxIranMap from "./components/geoChart/VisxIranMap";

function App() {
  return (
    <>
      <VisxIranMap />
      <NivoIranMap />
    </>
  );
}

export default App;
