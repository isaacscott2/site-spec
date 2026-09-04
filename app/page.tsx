"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import PDF link to prevent SSR canvas build errors on Vercel
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

  // Handle Image Upload & Conversion to Base64
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

  // Trigger Vision AI Scan
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

      // Robust fallback checking for API response key names
      const detected = data.cameraCount ?? data.total_cameras ?? data.count ?? 0;
      setCameraCount(detected);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not process image. Check OpenAI API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Calculation Engine (BICSI / IEEE standard estimates)
  const calculateStorageTB = () => {
    const MbpsPerCam = resolution === "4K" ? 8 : resolution === "4MP" ? 4 : 2;
    const totalGBPerDay = (cameraCount * MbpsPerCam * 3600 * 24) / (8 * 1024 * 1024);
    return ((totalGBPerDay * retentionDays) / 1024).toFixed(2);
  };

  const calculatePoEWattage = () => {
    // 15.4W nominal PoE budget per port + 20W switch baseline overhead
    return Math.ceil(cameraCount * 16.2 + 20);
  };

  const calculateConduitFill = () => {
    // NEC 40% fill standard rule for 3/4" EMT with standard Cat6
    return Math.min(cameraCount, 3);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Block */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              SITESPEC <span className="text-blue-500">ENGINEERING</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated AI Takeoffs & Electrical Infrastructure Sizing
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
              placeholder="Company Name"
            />
          </div>
        </header>

        {/* Blueprint Upload & AI Scanning Panel */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            1. Upload Architectural Floor Plan
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/2 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />

              {image && (
                <button
                  onClick={handleScanBlueprint}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Scanning Blueprint with Vision AI..." : "Run AI Symbol Detection"}
                </button>
              )}

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Blueprint Preview Window */}
            <div className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-lg h-48 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt="Blueprint preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-600">No blueprint loaded</span>
              )}
            </div>
          </div>
        </section>

        {/* Verification & Manual Override Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Project Name / ID
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Scanned IP Camera Count
            </label>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setCameraCount(Math.max(0, cameraCount - 1))}
                className="w-8 h-8 bg-slate-900 text-slate-300 font-bold rounded hover:bg-slate-800"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono font-bold text-lg text-blue-400">
                {cameraCount} Cams
              </span>
              <button
                onClick={() => setCameraCount(cameraCount + 1)}
                className="w-8 h-8 bg-slate-900 text-slate-300 font-bold rounded hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Storage Retention Goal
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value={15}>15 Days Retention</option>
              <option value={30}>30 Days Retention</option>
              <option value={60}>60 Days Retention</option>
              <option value={90}>90 Days Retention</option>
            </select>
          </div>
        </section>

        {/* Calculated Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Calculated NVR Storage</span>
            <div className="text-3xl font-extrabold text-slate-100 mt-2">{calculateStorageTB()} TB</div>
            <p className="text-xs text-slate-400 mt-1">Based on {retentionDays}-day retention profile</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Recommended PoE Budget</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-2">{calculatePoEWattage()} W</div>
            <p className="text-xs text-slate-400 mt-1">IEEE 802.3at standard allowance</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Max EMT Conduit Fill</span>
            <div className="text-3xl font-extrabold text-slate-100 mt-2">{calculateConduitFill()} Cables</div>
            <p className="text-xs text-slate-400 mt-1">3/4" EMT per NEC 40% rule</p>
          </div>
        </section>

        {/* PDF Export Action */}
        <footer className="pt-4 flex justify-end">
          <QuotePDFLink
            data={{
              projectName,
              companyName,
              cameraCount,
              retentionDays,
              storageTB: calculateStorageTB(),
              poeWattage: calculatePoEWattage(),
              conduitFill: calculateConduitFill(),
            }}
          />
        </footer>

      </div>
    </main>
  );
}