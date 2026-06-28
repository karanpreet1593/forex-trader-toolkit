import { useState } from "react";
import WeekendFramework from "./components/WeekendFramework";
import PreTradeChecklist from "./components/PreTradeChecklist";

function App() {
  const [activeTool, setActiveTool] = useState("weekend");

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Navbar */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #1a1a1a",
        background: "#0d0d0d",
        padding: "0 16px",
      }}>
        {[
          { id: "weekend", label: "📋 WEEKEND FRAMEWORK" },
          { id: "checklist", label: "✅ PRE-TRADE CHECKLIST" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            style={{
              padding: "14px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTool === t.id ? "2px solid #c8a96e" : "2px solid transparent",
              color: activeTool === t.id ? "#c8a96e" : "#555",
              fontSize: 11,
              letterSpacing: 2,
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tool */}
      {activeTool === "weekend" ? <WeekendFramework /> : <PreTradeChecklist />}
    </div>
  );
}

export default App;