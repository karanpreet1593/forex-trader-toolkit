import { useState, useEffect } from "react";

const PAIRS = ["USDJPY", "EURUSD", "GBPUSD", "AUDUSD", "USDCAD", "XAUUSD", "GBPJPY", "EURJPY", "Custom"];
const NEWS_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const emptyTrade = () => ({
  pair: "", customPair: "", bias: "",
  weekly: { trend: "", atKeyLevel: "", candleType: "", notes: "" },
  daily: { aligned: "", structure: "", notes: "" },
  h4: { structureChange: "", pattern: "", entryTrigger: "" },
  risk: { entry: "", sl: "", tp: "", rr: "" },
  news: "", confidence: "", status: "watching",
});

const emptyNews = () => NEWS_DAYS.reduce((acc, d) => ({ ...acc, [d]: "" }), {});

const CONFIDENCE_COLORS = { High: "#27ae60", Medium: "#f39c12", Low: "#c0392b" };
const BIAS_COLORS = { Long: "#27ae60", Short: "#c0392b", Neutral: "#aaa" };

const F = { family: "'Inter', 'Segoe UI', Arial, sans-serif" };

export default function WeekendFramework() {
  const [step, setStep] = useState(0);
  const [weekDate, setWeekDate] = useState(() => localStorage.getItem("wf_weekDate") || "");
  const [marketMood, setMarketMood] = useState(() => localStorage.getItem("wf_marketMood") || "");
  const [news, setNews] = useState(() => { try { return JSON.parse(localStorage.getItem("wf_news")) || emptyNews(); } catch { return emptyNews(); } });
  const [trades, setTrades] = useState(() => { try { return JSON.parse(localStorage.getItem("wf_trades")) || [emptyTrade()]; } catch { return [emptyTrade()]; } });
  const [activeTrade, setActiveTrade] = useState(0);
  const [activeSection, setActiveSection] = useState("weekly");

  useEffect(() => {
    localStorage.setItem("wf_weekDate", weekDate);
    localStorage.setItem("wf_marketMood", marketMood);
    localStorage.setItem("wf_news", JSON.stringify(news));
    localStorage.setItem("wf_trades", JSON.stringify(trades));
  }, [weekDate, marketMood, news, trades]);

  const updateTrade = (idx, path, value) => {
    setTrades((prev) => prev.map((t, i) => {
      if (i !== idx) return t;
      if (path.includes(".")) {
        const [section, key] = path.split(".");
        return { ...t, [section]: { ...t[section], [key]: value } };
      }
      return { ...t, [path]: value };
    }));
  };

  const addTrade = () => {
    if (trades.length >= 5) return;
    setTrades((prev) => [...prev, emptyTrade()]);
    setActiveTrade(trades.length);
    setActiveSection("weekly");
  };

  const removeTrade = (idx) => {
    if (trades.length === 1) return;
    setTrades((prev) => prev.filter((_, i) => i !== idx));
    setActiveTrade(Math.max(0, idx - 1));
  };

  const calcRR = (trade) => {
    const entry = parseFloat(trade.risk.entry);
    const sl = parseFloat(trade.risk.sl);
    const tp = parseFloat(trade.risk.tp);
    if (!entry || !sl || !tp) return "";
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (risk === 0) return "";
    return (reward / risk).toFixed(2);
  };

  const resetWeek = () => {
    if (!window.confirm("Reset all data for this week?")) return;
    setWeekDate(""); setMarketMood(""); setNews(emptyNews()); setTrades([emptyTrade()]); setActiveTrade(0);
  };

  const t = trades[activeTrade] || trades[0];
  const rr = calcRR(t);
  const sections = [
    { id: "weekly", label: "WEEKLY" },
    { id: "daily", label: "DAILY" },
    { id: "h4", label: "4H" },
    { id: "risk", label: "RISK" },
  ];
  const completedTrades = trades.filter(t => t.pair && t.bias && t.weekly.trend && t.daily.aligned && t.h4.entryTrigger && t.risk.sl && t.risk.tp).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8", fontFamily: F.family, padding: "24px 20px", maxWidth: 700, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>Weekend Analysis Protocol</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Trade Planning Framework</div>
        <div style={{ fontSize: 14, color: "#aaa" }}>Complete every Sunday before markets open Monday.</div>
      </div>

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {["Week Setup", "Pair Analysis", "Summary"].map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 6px",
            background: step === i ? "#1a1a1a" : "transparent",
            border: step === i ? "1px solid #444" : "1px solid #222",
            borderBottom: step === i ? "2px solid #c8a96e" : "2px solid transparent",
            color: step === i ? "#c8a96e" : "#888",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.family,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* STEP 0 — WEEK SETUP */}
      {step === 0 && (
        <div>
          <Section title="Week Identifier">
            <Field label="Week of">
              <input type="text" placeholder="e.g. Jun 30 – Jul 4, 2026" value={weekDate}
                onChange={(e) => setWeekDate(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Overall Market Mood">
              <div style={{ display: "flex", gap: 10 }}>
                {["Risk-On", "Risk-Off", "Uncertain"].map((m) => (
                  <Chip key={m} label={m} active={marketMood === m} onClick={() => setMarketMood(m)}
                    color={m === "Risk-On" ? "#27ae60" : m === "Risk-Off" ? "#c0392b" : "#aaa"} />
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Key News Next Week">
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>
              Mark all red-folder events. Avoid entries 30 mins before major releases.
            </div>
            {NEWS_DAYS.map((day) => (
              <Field key={day} label={day}>
                <input type="text" placeholder="e.g. NFP 8:30am USD, BOJ Gov speaks"
                  value={news[day]} onChange={(e) => setNews((prev) => ({ ...prev, [day]: e.target.value }))}
                  style={inputStyle} />
              </Field>
            ))}
          </Section>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={resetWeek} style={{ ...ghostBtn, color: "#c0392b", borderColor: "#3a1a1a" }}>Reset Week</button>
            <NavButton onClick={() => setStep(1)}>Next: Pair Analysis →</NavButton>
          </div>
        </div>
      )}

      {/* STEP 1 — PAIR ANALYSIS */}
      {step === 1 && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {trades.map((tr, i) => (
              <button key={i} onClick={() => { setActiveTrade(i); setActiveSection("weekly"); }} style={{
                padding: "7px 14px",
                background: activeTrade === i ? "#1e1e1e" : "transparent",
                border: activeTrade === i ? "1px solid #c8a96e" : "1px solid #333",
                color: activeTrade === i ? "#c8a96e" : "#aaa",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.family, borderRadius: 4,
              }}>
                {tr.pair || `Pair ${i + 1}`}
                {tr.bias && <span style={{ marginLeft: 6, color: BIAS_COLORS[tr.bias] }}>{tr.bias === "Long" ? "▲" : tr.bias === "Short" ? "▼" : "–"}</span>}
              </button>
            ))}
            {trades.length < 5 && (
              <button onClick={addTrade} style={{ padding: "7px 14px", background: "transparent", border: "1px dashed #333", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: F.family, borderRadius: 4 }}>
                + Add Pair
              </button>
            )}
          </div>

          {/* Pair header */}
          <div style={{ background: "#111", border: "1px solid #222", padding: 16, marginBottom: 18, borderRadius: 6 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Pair</div>
                <select value={t.pair} onChange={(e) => updateTrade(activeTrade, "pair", e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">Select pair...</option>
                  {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {t.pair === "Custom" && (
                  <input type="text" placeholder="Enter pair..." value={t.customPair}
                    onChange={(e) => updateTrade(activeTrade, "customPair", e.target.value)}
                    style={{ ...inputStyle, width: "100%", marginTop: 8 }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Bias</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Long", "Short", "Neutral"].map((b) => (
                    <Chip key={b} label={b} active={t.bias === b} onClick={() => updateTrade(activeTrade, "bias", b)} color={BIAS_COLORS[b]} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Confidence</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["High", "Medium", "Low"].map((c) => (
                    <Chip key={c} label={c} active={t.confidence === c} onClick={() => updateTrade(activeTrade, "confidence", c)} color={CONFIDENCE_COLORS[c]} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                flex: 1, padding: "9px",
                background: activeSection === s.id ? "#1a1a1a" : "transparent",
                border: "1px solid #222",
                borderBottom: activeSection === s.id ? "2px solid #c8a96e" : "2px solid transparent",
                color: activeSection === s.id ? "#c8a96e" : "#aaa",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.family,
              }}>
                {s.label}
              </button>
            ))}
          </div>

          {activeSection === "weekly" && (
            <Section title="Weekly Chart Analysis">
              <Field label="Weekly Trend">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Strong Uptrend", "Weak Uptrend", "Ranging", "Weak Downtrend", "Strong Downtrend"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.weekly.trend === opt}
                      onClick={() => updateTrade(activeTrade, "weekly.trend", opt)}
                      color={opt.includes("Up") ? "#27ae60" : opt.includes("Down") ? "#c0392b" : "#aaa"} small />
                  ))}
                </div>
              </Field>
              <Field label="Price at Key Level?">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Yes – Resistance", "Yes – Support", "Yes – ATH/ATL", "No – Mid Range"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.weekly.atKeyLevel === opt}
                      onClick={() => updateTrade(activeTrade, "weekly.atKeyLevel", opt)} color="#c8a96e" small />
                  ))}
                </div>
              </Field>
              <Field label="Weekly Candle Close">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Strong Bear", "Weak Bear", "Doji/Indecision", "Weak Bull", "Strong Bull"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.weekly.candleType === opt}
                      onClick={() => updateTrade(activeTrade, "weekly.candleType", opt)}
                      color={opt.includes("Bear") ? "#c0392b" : opt.includes("Bull") ? "#27ae60" : "#aaa"} small />
                  ))}
                </div>
              </Field>
              <Field label="Weekly Notes">
                <textarea placeholder="Key observations, zones marked, double tops/bottoms..."
                  value={t.weekly.notes} onChange={(e) => updateTrade(activeTrade, "weekly.notes", e.target.value)}
                  style={{ ...inputStyle, height: 80, resize: "vertical", width: "100%" }} />
              </Field>
            </Section>
          )}

          {activeSection === "daily" && (
            <Section title="Daily Chart Analysis">
              <Field label="Daily Aligned with Weekly?">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Yes – Fully Aligned", "Partially", "No – Counter Trend"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.daily.aligned === opt}
                      onClick={() => updateTrade(activeTrade, "daily.aligned", opt)}
                      color={opt.includes("Fully") ? "#27ae60" : opt.includes("No") ? "#c0392b" : "#f39c12"} small />
                  ))}
                </div>
              </Field>
              <Field label="Daily Structure">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Higher Highs/Lows", "Lower Highs/Lows", "Break of Structure Up", "Break of Structure Down", "Ranging"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.daily.structure === opt}
                      onClick={() => updateTrade(activeTrade, "daily.structure", opt)} color="#c8a96e" small />
                  ))}
                </div>
              </Field>
              <Field label="Daily Notes">
                <textarea placeholder="S/R levels, gaps, imbalances, key candles to watch..."
                  value={t.daily.notes} onChange={(e) => updateTrade(activeTrade, "daily.notes", e.target.value)}
                  style={{ ...inputStyle, height: 80, resize: "vertical", width: "100%" }} />
              </Field>
            </Section>
          )}

          {activeSection === "h4" && (
            <Section title="4H Chart Analysis">
              <Field label="4H Structure Change?">
                <div style={{ display: "flex", gap: 8 }}>
                  {["Yes", "Not Yet", "No"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.h4.structureChange === opt}
                      onClick={() => updateTrade(activeTrade, "h4.structureChange", opt)}
                      color={opt === "Yes" ? "#27ae60" : opt === "No" ? "#c0392b" : "#aaa"} />
                  ))}
                </div>
              </Field>
              <Field label="4H Pattern Forming">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Double Top", "Double Bottom", "Bear Flag", "Bull Flag", "Consolidation", "None"].map((opt) => (
                    <Chip key={opt} label={opt} active={t.h4.pattern === opt}
                      onClick={() => updateTrade(activeTrade, "h4.pattern", opt)} color="#c8a96e" small />
                  ))}
                </div>
              </Field>
              <Field label="Entry Trigger I Am Waiting For">
                <textarea placeholder="e.g. Bearish engulfing on 4H below 161.8, confirmed close..."
                  value={t.h4.entryTrigger} onChange={(e) => updateTrade(activeTrade, "h4.entryTrigger", e.target.value)}
                  style={{ ...inputStyle, height: 80, resize: "vertical", width: "100%" }} />
              </Field>
            </Section>
          )}

          {activeSection === "risk" && (
            <Section title="Risk Parameters">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Entry Price">
                  <input type="number" placeholder="e.g. 161.800" value={t.risk.entry}
                    onChange={(e) => updateTrade(activeTrade, "risk.entry", e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Stop Loss">
                  <input type="number" placeholder="e.g. 162.099" value={t.risk.sl}
                    onChange={(e) => updateTrade(activeTrade, "risk.sl", e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Take Profit">
                  <input type="number" placeholder="e.g. 159.761" value={t.risk.tp}
                    onChange={(e) => updateTrade(activeTrade, "risk.tp", e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Risk % of Account">
                  <input type="text" placeholder="e.g. 1%" value={t.risk.rr}
                    onChange={(e) => updateTrade(activeTrade, "risk.rr", e.target.value)} style={inputStyle} />
                </Field>
              </div>

              {rr && (
                <div style={{
                  marginTop: 18, padding: "14px 18px",
                  background: parseFloat(rr) >= 2 ? "#0a1a0a" : "#1a0a0a",
                  border: `1px solid ${parseFloat(rr) >= 2 ? "#27ae60" : "#c0392b"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 6,
                }}>
                  <span style={{ fontSize: 14, color: "#aaa", fontWeight: 600 }}>Risk : Reward</span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: parseFloat(rr) >= 2 ? "#27ae60" : "#c0392b" }}>
                    1 : {rr}
                  </span>
                  <span style={{ fontSize: 13, color: parseFloat(rr) >= 2 ? "#27ae60" : "#c0392b", fontWeight: 600 }}>
                    {parseFloat(rr) >= 2 ? "✓ Acceptable" : "✗ Too Low"}
                  </span>
                </div>
              )}

              <Field label="Key News Risk for This Pair">
                <input type="text" placeholder="e.g. NFP Thursday — avoid entry Wed evening"
                  value={t.news} onChange={(e) => updateTrade(activeTrade, "news", e.target.value)}
                  style={{ ...inputStyle, width: "100%" }} />
              </Field>
            </Section>
          )}

          {trades.length > 1 && (
            <div style={{ marginTop: 8, textAlign: "right" }}>
              <button onClick={() => removeTrade(activeTrade)} style={{ ...ghostBtn, color: "#c0392b", borderColor: "#3a1a1a" }}>
                Remove This Pair
              </button>
            </div>
          )}

          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
            <NavButton onClick={() => setStep(0)}>← Back</NavButton>
            <NavButton onClick={() => setStep(2)}>View Summary →</NavButton>
          </div>
        </div>
      )}

      {/* STEP 2 — SUMMARY */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>Week of {weekDate || "—"}</div>
            {marketMood && (
              <div style={{
                display: "inline-block", padding: "6px 16px",
                background: marketMood === "Risk-On" ? "#0a1a0a" : marketMood === "Risk-Off" ? "#1a0a0a" : "#111",
                border: `1px solid ${marketMood === "Risk-On" ? "#27ae60" : marketMood === "Risk-Off" ? "#c0392b" : "#555"}`,
                fontSize: 13, fontWeight: 600,
                color: marketMood === "Risk-On" ? "#27ae60" : marketMood === "Risk-Off" ? "#c0392b" : "#aaa",
                borderRadius: 4,
              }}>
                {marketMood} Environment
              </div>
            )}
          </div>

          {Object.values(news).some(Boolean) && (
            <Section title="Key Events This Week">
              {NEWS_DAYS.filter((d) => news[d]).map((d) => (
                <div key={d} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid #1a1a1a", fontSize: 14 }}>
                  <span style={{ color: "#c8a96e", minWidth: 36, fontWeight: 700 }}>{d}</span>
                  <span style={{ color: "#e0e0e0" }}>{news[d]}</span>
                </div>
              ))}
            </Section>
          )}

          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>
            Watchlist — {completedTrades}/{trades.length} setups complete
          </div>

          {trades.map((tr, i) => {
            const tradeRR = calcRR(tr);
            const pairName = tr.pair === "Custom" ? tr.customPair : tr.pair;
            return (
              <div key={i} style={{ marginBottom: 14, border: "1px solid #222", background: "#0d0d0d", borderRadius: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1a1a1a", background: "#111", borderRadius: "6px 6px 0 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>{pairName || `Pair ${i + 1}`}</span>
                    {tr.bias && (
                      <span style={{ fontSize: 12, color: BIAS_COLORS[tr.bias], border: `1px solid ${BIAS_COLORS[tr.bias]}`, padding: "2px 10px", borderRadius: 4, fontWeight: 600 }}>
                        {tr.bias.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {tr.confidence && <span style={{ fontSize: 13, color: CONFIDENCE_COLORS[tr.confidence], fontWeight: 600 }}>{tr.confidence} Conf</span>}
                    {tradeRR && <span style={{ fontSize: 14, color: parseFloat(tradeRR) >= 2 ? "#27ae60" : "#c0392b", fontWeight: 700 }}>1:{tradeRR} RR</span>}
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[
                      ["Weekly Trend", tr.weekly.trend],
                      ["Weekly Candle", tr.weekly.candleType],
                      ["Daily Aligned", tr.daily.aligned],
                      ["4H Structure", tr.h4.structureChange],
                      ["Entry", tr.risk.entry ? `@ ${tr.risk.entry}` : ""],
                      ["SL / TP", tr.risk.sl && tr.risk.tp ? `${tr.risk.sl} / ${tr.risk.tp}` : ""],
                    ].map(([label, val]) => (
                      <div key={label} style={{ fontSize: 13 }}>
                        <span style={{ color: "#888" }}>{label}: </span>
                        <span style={{ color: val ? "#c8a96e" : "#444", fontWeight: val ? 600 : 400 }}>{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                  {tr.h4.entryTrigger && (
                    <div style={{ padding: "10px 12px", background: "#0a0f0a", border: "1px solid #1a2a1a", fontSize: 13, color: "#7abf7a", lineHeight: 1.6, borderRadius: 4 }}>
                      ⏳ Waiting for: {tr.h4.entryTrigger}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 24, padding: "16px 18px", background: "#0a0808", border: "1px solid #2a1a1a", borderLeft: "4px solid #c0392b", fontSize: 14, color: "#cc9966", lineHeight: 1.9, borderRadius: 4 }}>
            ⚠️ <strong>Rules Before Monday</strong><br />
            No entry without confirmation candle + 4H structure change.<br />
            Max 1% risk per trade. Minimum 1:2 RR.<br />
            No trading 30 mins before red news events.<br />
            If no clean setup appears — do nothing. Cash is a position.
          </div>

          <div style={{ marginTop: 24 }}>
            <NavButton onClick={() => setStep(1)}>← Back to Analysis</NavButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e1e1e", textTransform: "uppercase", letterSpacing: 1.5 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 7, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick, color, small }) {
  return (
    <button onClick={onClick} style={{
      padding: small ? "5px 10px" : "7px 14px",
      background: active ? `${color}25` : "transparent",
      border: `1px solid ${active ? color : "#333"}`,
      color: active ? color : "#aaa",
      fontSize: small ? 12 : 13,
      fontWeight: active ? 600 : 400,
      cursor: "pointer", fontFamily: F.family, marginBottom: 6, borderRadius: 4, transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

function NavButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "1px solid #444", color: "#c8a96e",
      padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.family, borderRadius: 4,
    }}>
      {children}
    </button>
  );
}

const ghostBtn = {
  background: "transparent", border: "1px solid #333", color: "#aaa",
  padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: F.family, borderRadius: 4,
};

const inputStyle = {
  background: "#1a1a1a", border: "1px solid #333", color: "#e8e8e8",
  padding: "10px 12px", fontSize: 14, fontFamily: F.family,
  width: "100%", outline: "none", boxSizing: "border-box", borderRadius: 4,
};
