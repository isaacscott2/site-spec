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
  const [cameraCount, setCameraCount] = useState<number>(0);
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <header className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 font-black text-xl">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  SITESPEC <span className="text-blue-500">ENGINEERING</span>
                </h1>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated AI Blueprint Takeoffs & Infrastructure Sizing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 font-medium">GPT-4o Engine Active</span>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition w-full md:w-48 font-medium"
              placeholder="Company Name"
            />
          </div>
        </header>

        {/* Upload & Vision Panel */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              1. Architectural Blueprint Input
            </h2>
            {image && (
              <button
                onClick={() => setImage(null)}
                className="text-xs text-slate-400 hover:text-red-400 transition"
              >
                Clear Drawing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between space-y-4">
              <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition mb-3">
                  📂
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  Click to Upload or Drag CAD Blueprint
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Supports PNG, JPG, or Dark-Mode CAD Exports
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
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-600/20 text-sm"
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
                <div className="text-center space-y-1">
                  <span className="text-2xl opacity-40">🗺️</span>
                  <p className="text-xs text-slate-600">No blueprint loaded in viewer</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Engineering Controls */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Stream Resolution
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              {["1080p", "4MP", "4K"].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-1 text-[11px] font-bold rounded-lg transition ${
                    resolution === res
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NVR Storage</span>
            <div className="text-xl font-black text-white mt-1">{calculateStorageTB()} TB</div>
            <span className="text-[9px] text-slate-400">{retentionDays}-day target</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PoE Power</span>
            <div className="text-xl font-black text-blue-400 mt-1">{calculatePoEWattage()} W</div>
            <span className="text-[9px] text-slate-400">802.3at standard</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conduit Fill</span>
            <div className="text-xl font-black text-white mt-1">3 Cat6</div>
            <span className="text-[9px] text-slate-400">3/4" EMT per NEC</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bandwidth</span>
            <div className="text-xl font-black text-white mt-1">~{calculateMbps()} Mbps</div>
            <span className="text-[9px] text-slate-400">H.265 main profile</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PoE Hardware</span>
            <div className="text-xl font-black text-blue-400 mt-1">{cameraCount > 16 ? "24-Port" : "16-Port"}</div>
            <span className="text-[9px] text-slate-400">Managed PoE+</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Labor</span>
            <div className="text-xl font-black text-white mt-1">{calculateLaborHours()} Hrs</div>
            <span className="text-[9px] text-slate-400">Field + Config</span>
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