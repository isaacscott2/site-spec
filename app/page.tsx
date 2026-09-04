"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const QuotePDFLink = dynamic(
  () => import("../components/QuotePDF").then((mod) => mod.QuotePDFLink),
  { ssr: false }
);

export interface CameraBreakdown {
  dome: number;
  bullet: number;
  ptz: number;
  multisensor: number;
}

function PageContent() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposal Metadata
  const [projectName, setProjectName] = useState("Commercial Facility SEC-01");
  const [companyName, setCompanyName] = useState("SiteSpec Defense Systems");

  // Engineered Sizing State
  const [cameraCount, setCameraCount] = useState<number>(17);
  const [breakdown, setBreakdown] = useState<CameraBreakdown>({
    dome: 10,
    bullet: 4,
    ptz: 2,
    multisensor: 1,
  });
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

      const detected = data.cameraCount ?? 0;
      setCameraCount(detected);

      if (data.breakdown) {
        setBreakdown(data.breakdown);
      } else {
        setBreakdown({
          dome: Math.ceil(detected * 0.6),
          bullet: Math.floor(detected * 0.25),
          ptz: Math.floor(detected * 0.1),
          multisensor: Math.floor(detected * 0.05),
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not process image. Check OpenAI API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Weighted Sizing Calculations
  const calculateMbps = () => {
    const resMultiplier = resolution === "4K" ? 2 : resolution === "4MP" ? 1 : 0.5;
    const domeMbps = breakdown.dome * (3 * resMultiplier);
    const bulletMbps = breakdown.bullet * (4 * resMultiplier);
    const ptzMbps = breakdown.ptz * (8 * resMultiplier);
    const multiMbps = breakdown.multisensor * (10 * resMultiplier);
    return Math.round(domeMbps + bulletMbps + ptzMbps + multiMbps);
  };

  const calculateStorageTB = () => {
    const mbps = calculateMbps();
    const gbPerDay = (mbps * 3600 * 24) / (8 * 1024);
    const totalTB = (gbPerDay * retentionDays) / 1024;
    return totalTB.toFixed(2);
  };

  const calculatePoEWattage = () => {
    const domeW = breakdown.dome * 15.4;
    const bulletW = breakdown.bullet * 18.0;
    const ptzW = breakdown.ptz * 60.0;
    const multiW = breakdown.multisensor * 30.0;
    return Math.ceil(domeW + bulletW + ptzW + multiW + 30);
  };

  const calculateLaborHours = () => {
    const hours =
      breakdown.dome * 1.2 +
      breakdown.bullet * 1.5 +
      breakdown.ptz * 2.5 +
      breakdown.multisensor * 2.0 +
      8.0;
    return hours.toFixed(1);
  };

  const updateCameraBreakdown = (key: keyof CameraBreakdown, delta: number) => {
    const newVal = Math.max(0, breakdown[key] + delta);
    const updated = { ...breakdown, [key]: newVal };
    setBreakdown(updated);
    setCameraCount(updated.dome + updated.bullet + updated.ptz + updated.multisensor);
  };

  return (
    <main className="min-h-screen bg-[#050811] text-slate-100 p-4 md:p-8 font-sans selection:bg-red-600 selection:text-white antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
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
                  CLASSIFIED / PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Automated Multi-Device Blueprint Sizing & Infrastructure Takeoffs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-red-900/30 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-slate-300 font-mono text-[11px] font-semibold">Categorized AI Vision</span>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-red-500 transition w-full md:w-52 font-medium"
              placeholder="Defense Contractor Name"
            />
          </div>
        </header>

        {/* Blueprint Upload Panel */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              1. Tactical Floor Plan Scan
            </h2>
            {image && (
              <button
                onClick={() => setImage(null)}
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
                  Upload CAD Blueprint or Floor Plan
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-medium">
                  Detects Domes, Bullets, PTZs, and Multisensor Symbols
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
                  {loading ? "Analyzing Device Types..." : "Execute Categorized AI Scan"}
                </button>
              )}

              {error && (
                <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-red-200 text-xs flex items-center gap-2 font-mono">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* Blueprint Preview Window */}
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
                  <p className="text-xs text-slate-600 font-mono">No drawing loaded in viewer</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Device Type Schedule */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono mb-3">
            2. Detected Device Type Schedule ({cameraCount} Total Units)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Interior Domes</span>
                <span className="text-[9px] text-slate-500 font-mono">15.4W PoE | 1.2 hrs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button onClick={() => updateCameraBreakdown("dome", -1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">-</button>
                <span className="font-mono text-xs font-bold text-red-400 w-4 text-center">{breakdown.dome}</span>
                <button onClick={() => updateCameraBreakdown("dome", 1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">+</button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Perimeter Bullets</span>
                <span className="text-[9px] text-slate-500 font-mono">18.0W PoE | 1.5 hrs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button onClick={() => updateCameraBreakdown("bullet", -1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">-</button>
                <span className="font-mono text-xs font-bold text-red-400 w-4 text-center">{breakdown.bullet}</span>
                <button onClick={() => updateCameraBreakdown("bullet", 1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">+</button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-200 block">PTZ High-Power</span>
                <span className="text-[9px] text-slate-500 font-mono">60.0W PoE+ | 2.5 hrs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button onClick={() => updateCameraBreakdown("ptz", -1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">-</button>
                <span className="font-mono text-xs font-bold text-red-400 w-4 text-center">{breakdown.ptz}</span>
                <button onClick={() => updateCameraBreakdown("ptz", 1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">+</button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-200 block">180° / Multisensor</span>
                <span className="text-[9px] text-slate-500 font-mono">30.0W PoE+ | 2.0 hrs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button onClick={() => updateCameraBreakdown("multisensor", -1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">-</button>
                <span className="font-mono text-xs font-bold text-red-400 w-4 text-center">{breakdown.multisensor}</span>
                <button onClick={() => updateCameraBreakdown("multisensor", 1)} className="w-5 h-5 bg-slate-800 text-xs rounded font-bold">+</button>
              </div>
            </div>
          </div>
        </section>

        {/* Tactical Controls */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Live Calculation Cards Grid */}
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
            <span className="text-[9px] text-slate-400 font-medium">3/4" EMT per NEC</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Bandwidth</span>
            <div className="text-xl font-black text-white mt-1 font-mono">~{calculateMbps()} Mbps</div>
            <span className="text-[9px] text-slate-400 font-medium">Weighted streams</span>
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

        {/* PDF Export Action */}
        <footer className="pt-2 flex justify-end">
          <QuotePDFLink
            data={{
              projectName,
              companyName,
              cameraCount,
              breakdown,
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
    <Suspense fallback={<div className="min-h-screen bg-[#050811] text-white p-8 font-mono">Loading SiteSpec Core Engine...</div>}>
      <PageContent />
    </Suspense>
  );
}