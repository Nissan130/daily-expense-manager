import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="md:flex">
      <Sidebar active={active} onSelect={setActive} />
      <Dashboard />
    </div>
  );
}
