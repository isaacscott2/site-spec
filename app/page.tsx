'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { calculateCCTVStorage, calculatePoEBudget, calculateConduitFill } from '@/lib/calculations';
import { QuotePDF } from '@/components/QuotePDF';
import { BlueprintScanner } from '@/components/BlueprintScanner';
import { HardDrive, Zap, Layers, ShieldCheck, FileText } from 'lucide-react';

// Dynamically import PDFDownloadLink to prevent SSR hydration mismatches
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function Home() {
  // CCTV State
  const [cameraCount, setCameraCount] = useState(16);
  const [resolution, setResolution] = useState<'1080p' | '4K'>('1080p');
  const [retentionDays, setRetentionDays] = useState(30);

  // PoE State
  const [wattsPerDevice, setWattsPerDevice] = useState(15.4);
  const [cableDistance, setCableDistance] = useState(60);

  // AI Scanner Handler (Defined before component usage)
  const handleScanComplete = (data: { cameraCount: number; notes?: string }) => {
    if (data.cameraCount) {
      setCameraCount(data.cameraCount);
    }
  };

  // Calculations
  const cctvResults = calculateCCTVStorage({
    cameraCount,
    resolution,
    fps: 30,
    compression: 'H.265',
    retentionDays,
  });

  const poeResults = calculatePoEBudget({
    deviceCount: cameraCount,
    wattsPerDevice,
    cableDistanceMeters: cableDistance,
    cableCategory: 'Cat6',
  });

  const conduitResults = calculateConduitFill({
    conduitSizeInches: 0.75,
    cableODMm: 6.5,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header Bar */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide">
            SiteSpec <span className="text-blue-500">Estimator</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <PDFDownloadLink
            document={
              <QuotePDF
                cameraCount={cameraCount}
                storageTB={cctvResults.requiredStorageTB}
                bandwidth={cctvResults.bandwidthMbps}
                poeWatts={poeResults.recommendedSwitchPoEBudgetWatts}
                conduitCables={conduitResults.maxCablesAllowed}
              />
            }
            fileName="SiteSpec_Technical_Scope.pdf"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-blue-400/30 flex items-center gap-2 transition"
          >
            {/* @ts-ignore */}
            {({ loading }) => (
              <>
                <FileText className="w-4 h-4" />
                {loading ? 'Preparing PDF...' : 'Export Scope PDF'}
              </>
            )}
          </PDFDownloadLink>

          <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 font-semibold">
            Commercial B2B Suite
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* AI Vision Blueprint Scanner */}
        <BlueprintScanner onScanComplete={handleScanComplete} />

        {/* Engineering Calculators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CCTV Calculator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 text-blue-400">
              <HardDrive className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-white">CCTV Storage Sizing</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 flex justify-between mb-2">
                  Camera Count <span>{cameraCount} cameras</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="128"
                  value={cameraCount}
                  onChange={(e) => setCameraCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`py-2 text-sm rounded-lg font-medium border transition ${
                      resolution === '1080p'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    1080p
                  </button>
                  <button
                    onClick={() => setResolution('4K')}
                    className={`py-2 text-sm rounded-lg font-medium border transition ${
                      resolution === '4K'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    4K Ultra HD
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 flex justify-between mb-2">
                  Retention <span>{retentionDays} Days</span>
                </label>
                <input
                  type="range"
                  min="7"
                  max="90"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Storage Req.</span>
                <p className="text-2xl font-bold text-blue-400">
                  {cctvResults.requiredStorageTB} <span className="text-sm font-normal">TB</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Bandwidth</span>
                <p className="text-2xl font-bold text-slate-200">
                  {cctvResults.bandwidthMbps} <span className="text-sm font-normal">Mbps</span>
                </p>
              </div>
            </div>
          </div>

          {/* PoE Power Calculator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 text-amber-400">
              <Zap className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-white">PoE Budget & Loss</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Device Power Rating</label>
                <select
                  value={wattsPerDevice}
                  onChange={(e) => setWattsPerDevice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500"
                >
                  <option value={15.4}>Class 3 (15.4W - Standard IP Cam)</option>
                  <option value={30}>Class 4 (30.0W - PTZ / Heater Cam)</option>
                  <option value={60}>Class 6 (60.0W - High Power AP)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 flex justify-between mb-2">
                  Max Distance <span>{cableDistance} meters</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={cableDistance}
                  onChange={(e) => setCableDistance(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {poeResults.voltageDropWarning && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                  ⚠️ Distance exceeds 90m standard limit. Consider PoE Extender or Fiber link.
                </div>
              )}
            </div>

            <div className="mt-14 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Rec. Switch Budget</span>
                <p className="text-2xl font-bold text-amber-400">
                  {poeResults.recommendedSwitchPoEBudgetWatts} <span className="text-sm font-normal">Watts</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Raw Draw</span>
                <p className="text-2xl font-bold text-slate-200">
                  {poeResults.rawDeviceWatts} <span className="text-sm font-normal">W</span>
                </p>
              </div>
            </div>
          </div>

          {/* Conduit Fill Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 text-emerald-400">
              <Layers className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-white">Conduit Fill (NEC 40%)</h2>
            </div>

            <div className="space-y-4 text-sm text-slate-400">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-xs">Standard EMT Conduit</span>
                <span className="text-slate-200 font-medium">3/4" EMT Conduit</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-xs">Cable Type</span>
                <span className="text-slate-200 font-medium">Cat6 UTP (6.5mm OD)</span>
              </div>
            </div>

            <div className="mt-20 pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-500 uppercase font-semibold">Max Cat6 Cables Allowed</span>
              <p className="text-3xl font-bold text-emerald-400 mt-1">
                {conduitResults.maxCablesAllowed} <span className="text-sm font-normal text-slate-400">cables max</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}