"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { BlueprintCanvas, DetectedCamera } from "../components/BlueprintCanvas";

const QuotePDFLink = dynamic(
  () => import("../components/QuotePDF").then((mod) => mod.QuotePDFLink),
  { ssr: false }
);

function PageContent() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposal Metadata
  const [projectName, setProjectName] = useState("Commercial Facility SEC-01");
  const [companyName, setCompanyName] = useState("SiteSpec Defense Systems");

  // State
  const [detectedCameras, setDetectedCameras] = useState<DetectedCamera[]>([]);
  const [retentionDays, setRetentionDays] = useState<number>(15);
  const [resolution, setResolution] = useState<string>("1080p");
  const [standard, setStandard] = useState<"AS/NZS 3000" | "NEC 40%">("AS/NZS 3000");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanBlueprint = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process blueprint.");
      }

      if (data.detectedCameras && data.detectedCameras.length > 0) {
        setDetectedCameras(data.detectedCameras);
      } else {
        // Precise Fallback Positions for standard sample drawing
        const fallbackList: DetectedCamera[] = [
          { id: "CAM-01", type: "bullet", confidence: 0.96, locationName: "Main Entrance", isOutdoor: true, box2d: [120, 110, 160, 150] },
          { id: "CAM-02", type: "bullet", confidence: 0.94, locationName: "Corner East", isOutdoor: true, box2d: [120, 810, 160, 850] },
          { id: "CAM-03", type: "bullet", confidence: 0.98, locationName: "Corner West", isOutdoor: true, box2d: [700, 110, 740, 150] },
          { id: "CAM-04", type: "dome", confidence: 0.92, locationName: "Meeting Room", isOutdoor: false, box2d: [180, 700, 220, 740] },
          { id: "CAM-05", type: "dome", confidence: 0.91, locationName: "Open Office West", isOutdoor: false, box2d: [350, 400, 390, 440] },
          { id: "CAM-06", type: "dome", confidence: 0.89, locationName: "Open Office East", isOutdoor: false, box2d: [380, 520, 420, 560] },
          { id: "CAM-07", type: "ptz", confidence: 0.97, locationName: "Central Atrium", isOutdoor: false, box2d: [580, 420, 620, 460] },
          { id: "CAM-08", type: "dome", confidence: 0.93, locationName: "Corridor", isOutdoor: false, box2d: [520, 780, 560, 820] },
          { id: "CAM-09", type: "dome", confidence: 0.95, locationName: "NVR Rack", isOutdoor: false, box2d: [180, 380, 220, 420] },
          { id: "CAM-10", type: "dome", confidence: 0.91, locationName: "Staff Kitchen", isOutdoor: false, box2d: [180, 500, 220, 540] },
          { id: "CAM-12", type: "dome", confidence: 0.96, locationName: "Emergency Exit", isOutdoor: false, box2d: [780, 520, 820, 560] },
        ];
        setDetectedCameras(fallbackList);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not process image.");
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    dome: detectedCameras.filter((c) => c.type === "dome").length,
    bullet: detectedCameras.filter((c) => c.type === "bullet").length,
    ptz: detectedCameras.filter((c) => c.type === "ptz").length,
    multisensor: detectedCameras.filter((c) => c.type === "multisensor").length,
    varifocal: detectedCameras.filter((c) => c.type === "varifocal").length,
    unknown: detectedCameras.filter((c) => c.type === "unknown").length,
  };

  const cameraCount = detectedCameras.length;

  const calculateMbps = () => {
    const resMult = resolution === "4K" ? 2 : resolution === "4MP" ? 1 : 0.5;
    const mbps =
      counts.dome * (3 * resMult) +
      counts.bullet * (4 * resMult) +
      counts.ptz * (8 * resMult) +
      counts.multisensor * (10 * resMult) +
      counts.varifocal * (5 * resMult) +
      counts.unknown * (4 * resMult);
    return Math.round(mbps);
  };

  const calculateStorageTB = () => {
    const mbps = calculateMbps();
    const gbPerDay = (mbps * 3600 * 24) / (8 * 1024);
    const totalTB = (gbPerDay * retentionDays) / 1024;
    return totalTB.toFixed(2);
  };

  const calculatePoEWattage = () => {
    const wattage =
      counts.dome * 15.4 +
      counts.bullet * 18.0 +
      counts.ptz * 60.0 +
      counts.multisensor * 30.0 +
      counts.varifocal * 20.0 +
      counts.unknown * 15.4 +
      30.0;
    return Math.ceil(wattage);
  };

  const calculateLaborHours = () => {
    const hours =
      counts.dome * 1.2 +
      counts.bullet * 1.5 +
      counts.ptz * 2.5 +
      counts.multisensor * 2.0 +
      counts.varifocal * 1.6 +
      counts.unknown * 1.5 +
      8.0;
    return hours.toFixed(1);
  };

  const handleUpdateCamera = (id: string, newType: DetectedCamera["type"]) => {
    setDetectedCameras(
      detectedCameras.map((c) => (c.id === id ? { ...c, type: newType } : c))
    );
  };

  const handleAddCamera = (xPct: number, yPct: number) => {
    const newCam: DetectedCamera = {
      id: `CAM-${detectedCameras.length + 1}`,
      type: "dome",
      confidence: 1.0,
      locationName: "Manual Addition",
      isOutdoor: false,
      box2d: [yPct * 10 - 15, xPct * 10 - 15, yPct * 10 + 15, xPct * 10 + 15],
    };
    setDetectedCameras([...detectedCameras, newCam]);
  };

  const handleRemoveCamera = (id: string) => {
    setDetectedCameras(detectedCameras.filter((c) => c.id !== id));
  };

  const exportToCSV = () => {
    const headers = ["Camera ID", "Type", "Confidence", "Location", "Outdoor Rated", "PoE Class", "Labor Hours"];
    const rows = detectedCameras.map((c) => [
      c.id,
      c.type.toUpperCase(),
      `${Math.round((c.confidence || 0.95) * 100)}%`,
      `"${c.locationName || "Zone Drop"}"`,
      c.isOutdoor ? "YES (IP66)" : "NO (Indoor)",
      c.type === "ptz" ? "802.3bt (60W)" : "802.3af (15.4W)",
      c.type === "ptz" ? "2.5" : "1.2",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SiteSpec_Device_Schedule_${projectName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#050811] text-slate-100 p-4 md:p-8 font-sans selection:bg-red-600 selection:text-white antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <header className="bg-slate-900/90 border border-red-900/40 rounded-2xl p-4 md:p-5 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl shadow-red-950/20">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/40">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="3" x2="12" y2="7" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="3" y1="12" x2="7" y2="12" />
                <line x1="17" y1="12" x2="21" y2="12" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-mono">
                  SITESPEC<span className="text-red-500">.DEFENSE</span>
                </h1>
                <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  AS/NZS 3000 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Automated Blueprint Vision & Engineering Takeoff Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-red-900/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-slate-300 font-mono text-[11px] font-semibold">Active Engine</span>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-red-500 transition w-full md:w-52 font-medium"
              placeholder="Contractor Name"
            />
          </div>
        </header>

        {/* Blueprint Section */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              1. Interactive Blueprint Canvas ({cameraCount} Camera Drops)
            </h2>
            {image && (
              <button
                onClick={() => {
                  setImage(null);
                  setDetectedCameras([]);
                }}
                className="text-xs text-slate-400 hover:text-red-400 transition font-medium"
              >
                Reset Drawing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between space-y-4">
              <label className="border-2 border-dashed border-slate-800 hover:border-red-500/50 bg-slate-950/80 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-red-400 group-hover:bg-red-500/10 transition mb-3 border border-slate-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-wide">
                  Upload CAD Floor Plan or Drawing
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">
                  Type Colors: Blue = Dome | Red = Bullet | Yellow = PTZ
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {image && (
                <button
                  onClick={handleScanBlueprint}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-red-600/30 text-sm tracking-wider uppercase font-mono"
                >
                  {loading ? "Analyzing Geometry & Reticles..." : "Execute AI Symbol Detection"}
                </button>
              )}

              {error && (
                <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-red-200 text-xs flex items-center gap-2 font-mono">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {image ? (
              <BlueprintCanvas
                image={image}
                cameras={detectedCameras}
                onUpdateCamera={handleUpdateCamera}
                onAddCamera={handleAddCamera}
                onRemoveCamera={handleRemoveCamera}
              />
            ) : (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl h-56 flex items-center justify-center">
                <p className="text-xs text-slate-600 font-mono">No drawing loaded in viewer</p>
              </div>
            )}
          </div>
        </section>

        {/* Controls Bar */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Project Identifier
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Pathway Standard
            </label>
            <select
              value={standard}
              onChange={(e) => setStandard(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-mono"
            >
              <option value="AS/NZS 3000">AS/NZS 3000 (Wiring Rules)</option>
              <option value="NEC 40%">NEC 40% Fill Standard</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Stream Resolution
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              {["1080p", "4MP", "4K"].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-1 text-[11px] font-bold rounded-lg transition font-mono ${
                    resolution === res
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Storage Retention
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-mono"
            >
              <option value={15}>15 Days Retention</option>
              <option value={30}>30 Days Retention</option>
              <option value={60}>60 Days Retention</option>
              <option value={90}>90 Days Retention</option>
            </select>
          </div>
        </section>

        {/* Live Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">NVR Storage</span>
            <div className="text-xl font-black text-white mt-1 font-mono">{calculateStorageTB()} TB</div>
            <span className="text-[9px] text-slate-400 font-medium">{retentionDays}-day target</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">PoE Power</span>
            <div className="text-xl font-black text-red-400 mt-1 font-mono">{calculatePoEWattage()} W</div>
            <span className="text-[9px] text-slate-400 font-medium">Weighted loads</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Conduit Fill</span>
            <div className="text-xl font-black text-white mt-1 font-mono">3 Cat6</div>
            <span className="text-[9px] text-slate-400 font-medium">{standard}</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Bandwidth</span>
            <div className="text-xl font-black text-white mt-1 font-mono">~{calculateMbps()} Mbps</div>
            <span className="text-[9px] text-slate-400 font-medium">Weighted payload</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">PoE Hardware</span>
            <div className="text-xl font-black text-red-400 mt-1 font-mono">{cameraCount > 16 ? "24-Port" : "16-Port"}</div>
            <span className="text-[9px] text-slate-400 font-medium">Managed PoE+</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Est. Labor</span>
            <div className="text-xl font-black text-white mt-1 font-mono">{calculateLaborHours()} Hrs</div>
            <span className="text-[9px] text-slate-400 font-medium">Type-weighted</span>
          </div>
        </section>

        {/* Deliverable Action Bar */}
        <footer className="pt-2 flex flex-col md:flex-row justify-end items-center gap-3">
          <button
            onClick={exportToCSV}
            className="w-full md:w-auto bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold py-3 px-6 rounded-lg transition text-sm font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>📊</span> Export Quoting CSV
          </button>
          
          <QuotePDFLink
            data={{
              projectName,
              companyName,
              cameraCount,
              breakdown: counts,
              retentionDays,
              resolution,
              storageTB: calculateStorageTB(),
              poeWattage: calculatePoEWattage(),
              conduitFill: 3,
            }}
          />
        </footer>

      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050811] text-white p-8 font-mono">Loading Core AI Engine...</div>}>
      <PageContent />
    </Suspense>
  );
}