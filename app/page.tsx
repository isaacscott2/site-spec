"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const QuotePDFLink = dynamic(
  () => import("../components/QuotePDF").then((mod) => mod.QuotePDFLink),
  { ssr: false }
);

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposal Metadata
  const [projectName, setProjectName] = useState("Commercial Facility SEC-01");
  const [companyName, setCompanyName] = useState("SiteSpec Defense Systems");

  // Engineered Sizing State
  const [cameraCount, setCameraCount] = useState<number>(17);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [resolution, setResolution] = useState<string>("4MP");

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

      const detected = data.cameraCount ?? data.total_cameras ?? data.count ?? 0;
      setCameraCount(detected);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not process image. Check OpenAI API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const calculateMbps = () => {
    const multiplier = resolution === "4K" ? 8 : resolution === "4MP" ? 4 : 2;
    return cameraCount * multiplier;
  };

  const calculateStorageTB = () => {
    const mbps = calculateMbps();
    const gbPerDay = (mbps * 3600 * 24) / (8 * 1024);
    const totalTB = (gbPerDay * retentionDays) / 1024;
    return totalTB.toFixed(2);
  };

  const calculatePoEWattage = () => {
    return Math.ceil(cameraCount * 16.2 + 20);
  };

  const calculateLaborHours = () => {
    return (cameraCount * 1.5 + 8).toFixed(1);
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation / Header Bar */}
        <header className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 md:p-5 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
          <div className="flex items-center gap-3.5">
            {/* Custom SiteSpec Camera/Crosshair Logo */}
            <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-mono">
                  SITESPEC<span className="text-blue-500">.AI</span>
                </h1>
                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Automated Infrastructure Takeoffs & Engineering Sizing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px] font-semibold">GPT-4o Vision</span>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500 transition w-full md:w-52 font-medium"
              placeholder="Company Name"
            />
          </div>
        </header>

        {/* Upload & Vision Panel */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              1. Architectural Blueprint Input
            </h2>
            {image && (
              <button
                onClick={() => setImage(null)}
                className="text-xs text-slate-400 hover:text-red-400 transition font-medium"
              >
                Clear Drawing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between space-y-4">
              <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition mb-3 border border-slate-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-wide">
                  Upload CAD Blueprint or Floor Plan
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">
                  Supports PNG, JPG, or Dark-Mode Vector Exports
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-600/20 text-sm tracking-wide"
                >
                  {loading ? "Analyzing Blueprint Geometry..." : "Run AI Symbol Detection"}
                </button>
              )}

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* Blueprint Preview Box */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl h-56 flex items-center justify-center overflow-hidden relative">
              {image ? (
                <img
                  src={image}
                  alt="Blueprint preview"
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : (
                <div className="text-center space-y-1.5">
                  <svg className="w-8 h-8 text-slate-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A2 2 0 013 15.482V6a2 2 0 011.053-1.764l5-2.5a2 2 0 011.894 0l5 2.5A2 2 0 0117 6v9.482a2 2 0 01-.553 1.254L11 20.482a2 2 0 01-2 0z" />
                  </svg>
                  <p className="text-xs text-slate-600 font-medium">No floor plan loaded in viewer</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Engineering Controls */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Project Identifier
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Scanned Device Count
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setCameraCount(Math.max(0, cameraCount - 1))}
                className="w-7 h-7 bg-slate-900 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition text-xs"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono font-black text-sm text-blue-400">
                {cameraCount} Cams
              </span>
              <button
                onClick={() => setCameraCount(cameraCount + 1)}
                className="w-7 h-7 bg-slate-900 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition text-xs"
              >
                +
              </button>
            </div>
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
                  className={`py-1 text-[11px] font-bold rounded-lg transition ${
                    resolution === res
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
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
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value={15}>15 Days Retention</option>
              <option value={30}>30 Days Retention</option>
              <option value={60}>60 Days Retention</option>
              <option value={90}>90 Days Retention</option>
            </select>
          </div>
        </section>

        {/* Live Calculation Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">NVR Storage</span>
            <div className="text-xl font-black text-white mt-1 font-mono">{calculateStorageTB()} TB</div>
            <span className="text-[9px] text-slate-400 font-medium">{retentionDays}-day target</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">PoE Power</span>
            <div className="text-xl font-black text-blue-400 mt-1 font-mono">{calculatePoEWattage()} W</div>
            <span className="text-[9px] text-slate-400 font-medium">802.3at standard</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Conduit Fill</span>
            <div className="text-xl font-black text-white mt-1 font-mono">3 Cat6</div>
            <span className="text-[9px] text-slate-400 font-medium">3/4" EMT per NEC</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Bandwidth</span>
            <div className="text-xl font-black text-white mt-1 font-mono">~{calculateMbps()} Mbps</div>
            <span className="text-[9px] text-slate-400 font-medium">H.265 main profile</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">PoE Hardware</span>
            <div className="text-xl font-black text-blue-400 mt-1 font-mono">{cameraCount > 16 ? "24-Port" : "16-Port"}</div>
            <span className="text-[9px] text-slate-400 font-medium">Managed PoE+</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Est. Labor</span>
            <div className="text-xl font-black text-white mt-1 font-mono">{calculateLaborHours()} Hrs</div>
            <span className="text-[9px] text-slate-400 font-medium">Field + Config</span>
          </div>
        </section>

        {/* PDF Export Action */}
        <footer className="pt-2 flex justify-end">
          <QuotePDFLink
            data={{
              projectName,
              companyName,
              cameraCount,
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