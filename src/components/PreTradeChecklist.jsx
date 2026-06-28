import { useState, useEffect } from "react";

const F = { family: "'Inter', 'Segoe UI', Arial, sans-serif" };

const sections = [
  {
    id: "fundamental", label: "Fundamentals", color: "#c0392b",
    items: [
      "Is there a clear macro catalyst (rate decision, war, policy change)?",
      "Has the catalyst actually happened — not just expected?",
      "Does the fundamental thesis align with the technical setup?",
      "Am I trading the news or trading the reaction to news?",
    ],
  },
  {
    id: "technical_daily", label: "Daily Timeframe", color: "#3a6fd8",
    items: [
      "Is price at a clear key level (support, resistance, ATH)?",
      "Is there a strong daily confirmation candle (bearish engulf, pin bar, etc.)?",
      "Is the overall daily trend in my favor OR am I counter-trend?",
      "If counter-trend — do I have extra confirmation before entering?",
    ],
  },
  {
    id: "technical_4h", label: "4H Timeframe", color: "#3a6fd8",
    items: [
      "Has 4H structure changed in my direction?",
      "Is there a lower high (for shorts) or higher low (for longs) on 4H?",
      "Has 4H broken a key level that confirms my daily bias?",
      "Am I waiting for 4H close — not just a wick — as confirmation?",
    ],
  },
  {
    id: "entry", label: "Entry & Risk", color: "#27ae60",
    items: [
      "Is my stop loss placed at a logical level (beyond structure)?",
      "Is my risk max 1% of account?",
      "Is my Risk:Reward minimum 1:2?",
      "Is my entry based on price action — not just a feeling or hope?",
    ],
  },
  {
    id: "management", label: "Trade Management", color: "#3a8fd8",
    items: [
      "Do I have a clear take profit target defined before entry?",
      "Have I set a time stop (exit if nothing happens in X days)?",
      "If holding 3+ days with no movement — is the thesis still valid?",
      "Am I holding out of conviction, or out of hope?",
    ],
  },
  {
    id: "rules", label: "Rule Check", color: "#c0392b",
    items: [
      "Did I wait for my confirmation candle before entering?",
      "Did I check both 4H structure AND daily candle?",
      "Am I following my system — or making an exception this time?",
      "Would I take this same trade again tomorrow with fresh eyes?",
    ],
  },
];

export default function PreTradeChecklist() {
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ptc_checked")) || {}; } catch { return {}; }
  });
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    localStorage.setItem("ptc_checked", JSON.stringify(checked));
  }, [checked]);

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSection = (id) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((checkedCount / totalItems) * 100);
  const resetAll = () => { if (window.confirm("Reset checklist?")) setChecked({}); };

  const readiness =
    pct === 100 ? { label: "Ready to Trade ✓", color: "#27ae60" } :
    pct >= 75 ? { label: "Almost Ready", color: "#f39c12" } :
    pct >= 50 ? { label: "Needs More Confirmation", color: "#e67e22" } :
    { label: "Do Not Enter", color: "#c0392b" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8", fontFamily: F.family, padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Trade Entry Protocol</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Pre-Trade Checklist</div>
        <div style={{ fontSize: 14, color: "#aaa", borderLeft: "3px solid #c0392b", paddingLeft: 12 }}>
          Complete every section before pulling the trigger.
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
          <span style={{ color: "#aaa", fontWeight: 600 }}>{checkedCount}/{totalItems} checks complete</span>
          <span style={{ color: readiness.color, fontWeight: 700 }}>{readiness.label}</span>
        </div>
        <div style={{ height: 6, background: "#222", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: readiness.color, transition: "width 0.3s ease", borderRadius: 3 }} />
        </div>
      </div>

      {sections.map((section) => {
        const sectionChecked = section.items.filter((_, i) => checked[`${section.id}-${i}`]).length;
        const isCollapsed = collapsed[section.id];
        return (
          <div key={section.id} style={{ marginBottom: 12 }}>
            <div onClick={() => toggleSection(section.id)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#141414",
              border: "1px solid #2a2a2a", borderLeft: `4px solid ${section.color}`,
              cursor: "pointer", userSelect: "none", borderRadius: "4px 4px 0 0",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>{section.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: sectionChecked === section.items.length ? "#27ae60" : "#888" }}>
                  {sectionChecked}/{section.items.length}
                </span>
                <span style={{ fontSize: 12, color: "#666" }}>{isCollapsed ? "▶" : "▼"}</span>
              </div>
            </div>
            {!isCollapsed && (
              <div style={{ border: "1px solid #1e1e1e", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                {section.items.map((item, i) => {
                  const key = `${section.id}-${i}`;
                  const isChecked = !!checked[key];
                  return (
                    <div key={key} onClick={() => toggle(key)} style={{
                      display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
                      borderBottom: i < section.items.length - 1 ? "1px solid #1a1a1a" : "none",
                      cursor: "pointer", background: isChecked ? "#0a150a" : "transparent", transition: "background 0.15s",
                    }}>
                      <div style={{
                        width: 20, height: 20,
                        border: isChecked ? "2px solid #27ae60" : "2px solid #444",
                        borderRadius: 4, flexShrink: 0, marginTop: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isChecked ? "#27ae60" : "transparent", transition: "all 0.15s",
                      }}>
                        {isChecked && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{
                        fontSize: 14, lineHeight: 1.6,
                        color: isChecked ? "#4a7a4a" : "#d0d0d0",
                        textDecoration: isChecked ? "line-through" : "none",
                        transition: "color 0.15s",
                      }}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 28, padding: "16px 18px", background: "#0f0808", border: "1px solid #3a1a1a", borderLeft: "4px solid #c0392b", fontSize: 14, color: "#cc9966", lineHeight: 1.9, borderRadius: 4 }}>
        ⚠️ <strong>Your Rule:</strong> No entry without a confirmation candle + 4H structure change + valid daily setup.<br />
        A thesis alone is not a trade.
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button onClick={resetAll} style={{
          background: "transparent", border: "1px solid #333", color: "#888",
          padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.family, borderRadius: 4,
        }}>
          Reset Checklist
        </button>
      </div>
    </div>
  );
}
