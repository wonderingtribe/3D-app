import React, { useState } from "react";
import { useWorkspace } from '../WorkspaceContext';

const C = {
  bg: "#080a0d",
  panel: "#0e1117",
  panelAlt: "#111620",
  border: "#1a2030",
  borderBright: "#252d3d",
  accent: "#00d4ff",
  accentDim: "#008faa",
  accentGlow: "rgba(0,212,255,0.10)",
  green: "#00e5a0",
  amber: "#ffb340",
  purple: "#a78bfa",
  red: "#ff4d6a",
  text: "#dde4f0",
  textDim: "#7a8aa0",
  textFaint: "#3a4455",
};

const Icon = ({ d, size = 14, stroke = "currentColor", sw = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const sceneObjects = [
  { id: 1, name: "Primary Cube", type: "mesh", x: 0, y: 2, active: true },
  { id: 2, name: "Key Light", type: "light", x: 10, y: 10, active: false },
  { id: 3, name: "Ground Plane", type: "mesh", x: 0, y: 0, active: false },
];

const prefabs = [
  { name: "Standard Box", color: C.accent },
  { name: "Point Light", color: C.amber },
  { name: "Neon Sphere", color: C.purple },
  { name: "Spotlight", color: C.green },
];

const TypeIcon = ({ type }: any) => {
  if (type === "light") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.8">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  );
};

const GridDots = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="smallGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="0.8" fill={C.textFaint} opacity="0.4"/>
      </pattern>
      <pattern id="bigGrid" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="url(#smallGrid)"/>
        <circle cx="60" cy="60" r="1.2" fill={C.textFaint} opacity="0.7"/>
        <line x1="0" y1="60" x2="120" y2="60" stroke={C.border} strokeWidth="0.5" opacity="0.8"/>
        <line x1="60" y1="0" x2="60" y2="120" stroke={C.border} strokeWidth="0.5" opacity="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bigGrid)"/>
  </svg>
);

const SceneEntity = ({ obj, selected, onSelect }: any) => (
  <div
    onClick={() => onSelect(obj.id)}
    style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
      borderRadius: 6, cursor: "pointer", marginBottom: 1,
      background: selected ? C.accentGlow : "transparent",
      border: selected ? `1px solid ${C.accent}33` : "1px solid transparent",
      transition: "all 0.12s",
    }}
    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#ffffff08"; }}
    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
  >
    <TypeIcon type={obj.type} />
    <span style={{ fontSize: 12.5, color: selected ? C.text : C.textDim, fontWeight: selected ? 500 : 400, flex: 1 }}>{obj.name}</span>
    <button
      onClick={e => e.stopPropagation()}
      style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 2, borderRadius: 3, opacity: 0, transition: "opacity 0.1s" }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = C.red; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.color = C.textFaint; }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2 0 01-2,2H8a2,2 0 01-2-2L5,6"/></svg>
    </button>
  </div>
);

const PropRow = ({ label, value, color }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
    <span style={{ fontSize: 11, color: C.textFaint, width: 52, flexShrink: 0, letterSpacing: "0.04em" }}>{label}</span>
    <div style={{
      flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5,
      padding: "4px 8px", fontSize: 12, fontFamily: "monospace",
      color: color || C.text,
    }}>{value}</div>
  </div>
);

export default function SpatialView() {
  const [selected, setSelected] = useState(1);
  const { viewMode, setViewMode } = useWorkspace();
  const [liveSync, setLiveSync] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("Transform");

  const selectedObj = sceneObjects.find(o => o.id === selected);
  const navTabs = [
    { id: "design", label: "UI Design" },
    { id: "engine", label: "Engine Setup" },
    { id: "spatial", label: "Spatial View" },
    { id: "code", label: "Source Code" },
    { id: "pipeline", label: "Asset Pipeline" },
    { id: "settings", label: "Settings" }
  ];

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: C.text, overflow: "hidden", fontSize: 13,
      flex: 1
    }}>
      {/* ── TOOLBAR ── */}
      <div style={{
        height: 36, background: C.panelAlt, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 6, flexShrink: 0,
      }}>
        {[
          { label: "Select", icon: "M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" },
          { label: "Move", icon: "M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" },
          { label: "Rotate", icon: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" },
          { label: "Scale", icon: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" },
        ].map((tool, i) => (
          <button key={tool.label} title={tool.label} style={{
            background: i === 0 ? C.accentGlow : "transparent",
            border: i === 0 ? `1px solid ${C.accent}44` : "1px solid transparent",
            borderRadius: 5, width: 28, height: 26, cursor: "pointer",
            color: i === 0 ? C.accent : C.textDim, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={tool.icon}/></svg>
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: C.border, margin: "0 4px" }}/>

        {["Perspective", "Top", "Front", "Side"].map((v, i) => (
          <button key={v} style={{
            background: i === 0 ? "#ffffff0a" : "transparent", border: "1px solid transparent",
            borderRadius: 5, padding: "3px 8px", cursor: "pointer",
            fontSize: 11, color: i === 0 ? C.text : C.textDim, fontWeight: i === 0 ? 600 : 400,
          }}>{v}</button>
        ))}

        <div style={{ flex: 1 }}/>

        <div
          onClick={() => setLiveSync(s => !s)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "3px 10px",
            borderRadius: 5, border: `1px solid ${liveSync ? C.green + "44" : C.border}`,
            background: liveSync ? "rgba(0,229,160,0.08)" : "transparent",
            cursor: "pointer",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveSync ? C.green : C.textFaint, boxShadow: liveSync ? `0 0 6px ${C.green}` : "none" }}/>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: liveSync ? C.green : C.textFaint }}>LIVE SYNC</span>
        </div>

        <button style={{
          background: "rgba(167,139,250,0.12)", border: `1px solid ${C.purple}44`,
          borderRadius: 5, padding: "3px 10px", cursor: "pointer",
          fontSize: 11, fontWeight: 700, color: C.purple, display: "flex", alignItems: "center", gap: 5,
          letterSpacing: "0.05em",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          SUMMON ARCHITECT
        </button>
      </div>

      {/* ── THREE-COLUMN BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT: SCENE HIERARCHY + SCENES ── */}
        <div style={{
          width: 210, background: C.panel, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
        }}>
          {/* Workspace Tree */}
          <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 0 8px" }}>
            <div style={{
              height: 32, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim }}>Scene</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[
                  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
                  "M12 5v14M5 12h14"
                ].map((d, i) => (
                  <button key={i} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 3, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.textFaint}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d}/></svg>
                  </button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div style={{ padding: "0 8px 6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 8px" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textFaint} strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <input placeholder="Filter..." style={{ background: "none", border: "none", outline: "none", color: C.textDim, fontSize: 11, width: "100%", fontFamily: "inherit" }}/>
              </div>
            </div>
            {/* Objects */}
            <div style={{ padding: "0 6px" }}>
              {sceneObjects.map(obj => (
                <SceneEntity key={obj.id} obj={obj} selected={selected === obj.id} onSelect={setSelected} />
              ))}
            </div>
          </div>

          {/* Prefab Library */}
          <div style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textFaint, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              Prefab Library
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {prefabs.map(p => (
                <button key={p.name} style={{
                  background: `${p.color}0e`, border: `1px solid ${p.color}30`,
                  borderRadius: 6, padding: "6px 6px 5px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${p.color}1a`; e.currentTarget.style.borderColor = `${p.color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${p.color}0e`; e.currentTarget.style.borderColor = `${p.color}30`; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.6">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                  <span style={{ fontSize: 9.5, color: p.color, fontWeight: 600, letterSpacing: "0.02em", textAlign: "center", lineHeight: 1.2 }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scenes */}
          <div style={{ flex: 1, padding: "8px 10px", overflow: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textFaint, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Scenes
              </div>
              <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px", color: C.textFaint, cursor: "pointer", fontSize: 10 }}>+ New</button>
            </div>
            <div style={{
              background: C.bg, border: `1px solid ${C.accent}33`, borderRadius: 6, padding: "7px 10px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Default Setup</div>
                <div style={{ fontSize: 10, color: C.textFaint, marginTop: 1 }}>6:24:58 PM</div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["NEW_MESH", "NEW_LIGHT"].map(t => (
                  <button key={t} style={{
                    background: "transparent", border: `1px solid ${C.border}`,
                    borderRadius: 4, padding: "2px 6px", fontSize: 9, color: C.textFaint,
                    cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em",
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CENTER: VIEWPORT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", minWidth: 0 }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: C.bg }}>
            <GridDots />

            {/* Axis gizmo */}
            <div style={{ position: "absolute", bottom: 16, left: 16, width: 64, height: 64 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <line x1="32" y1="32" x2="54" y2="18" stroke={C.red} strokeWidth="2"/>
                <line x1="32" y1="32" x2="10" y2="18" stroke={C.green} strokeWidth="2"/>
                <line x1="32" y1="32" x2="32" y2="54" stroke={C.accent} strokeWidth="2"/>
                <circle cx="54" cy="18" r="5" fill={C.red}/><text x="54" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">X</text>
                <circle cx="10" cy="18" r="5" fill={C.green}/><text x="10" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">Y</text>
                <circle cx="32" cy="54" r="5" fill={C.accent}/><text x="32" y="58" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">Z</text>
              </svg>
            </div>

            {/* Grid labels */}
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
              {["Perspective", "Shading: Solid"].map(label => (
                <div key={label} style={{
                  background: "rgba(0,0,0,0.6)", border: `1px solid ${C.border}`, borderRadius: 5,
                  padding: "3px 8px", fontSize: 10, color: C.textDim, backdropFilter: "blur(4px)",
                }}>{label}</div>
              ))}
            </div>

            {/* Scene objects (simplified 3D-ish visualization) */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: "40%", height: "40%", border: `1px solid ${C.borderBright}`,
                background: "rgba(255, 255, 255, 0.05)",
                transform: "rotateX(60deg) rotateZ(45deg)", transformStyle: "preserve-3d",
              }}>
                <div style={{
                  position: "absolute", left: "50%", top: "50%", width: 64, height: 64,
                  background: `linear-gradient(45deg, ${C.accentDim}, ${C.accent})`, opacity: 0.8,
                  transform: "translate3d(-50%, -50%, 32px)", border: `1px solid ${C.accent}`,
                  boxShadow: `0 0 20px ${C.accentGlow}`,
                }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* ── RIGHT: INSPECTOR ── */}
        <div style={{ width: 260, background: C.panel, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
           <div style={{
             height: 32, display: "flex", alignItems: "center", justifyContent: "center",
             borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim
           }}>
             Inspector
           </div>
           
           <div style={{ padding: "12px", borderBottom: `1px solid ${C.border}` }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <TypeIcon type={selectedObj?.type} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedObj?.name}</span>
             </div>
             
             <PropRow label="Position" value="0.0, 2.0, 0.0" />
             <PropRow label="Rotation" value="0.0, 0.0, 0.0" />
             <PropRow label="Scale" value="1.0, 1.0, 1.0" />
             
             {selectedObj?.type === "mesh" && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                   <PropRow label="Material" value="Standard" color={C.accent} />
                   <PropRow label="Color" value="#00d4ff" color={C.accent} />
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

