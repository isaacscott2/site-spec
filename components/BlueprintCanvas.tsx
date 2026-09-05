"use client";

import React, { useState } from "react";

export interface DetectedCamera {
  id: string;
  type: "dome" | "bullet" | "ptz" | "multisensor" | "varifocal" | "unknown";
  confidence: number;
  locationName: string;
  isOutdoor: boolean;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
}

interface BlueprintCanvasProps {
  image: string;
  cameras: DetectedCamera[];
  onUpdateCamera: (id: string, newType: DetectedCamera["type"]) => void;
  onAddCamera: (xPercent: number, yPercent: number) => void;
  onRemoveCamera: (id: string) => void;
}

export function BlueprintCanvas({
  image,
  cameras,
  onUpdateCamera,
  onAddCamera,
  onRemoveCamera,
}: BlueprintCanvasProps) {
  const [selectedCam, setSelectedCam] = useState<DetectedCamera | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only add a new camera drop if the click didn't land directly on an existing reticle
    if ((e.target as HTMLElement).dataset.reticle) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    onAddCamera(xPercent, yPercent);
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none">
      <div
        className="relative w-full h-full flex items-center justify-center cursor-crosshair"
        onClick={handleCanvasClick}
      >
        <img
          src={image}
          alt="Architectural Blueprint"
          className="max-h-full max-w-full object-contain p-2 pointer-events-none"
        />

        {/* Overlay Interactive Bounding Reticles */}
        {cameras.map((cam) => {
          const top = cam.box2d[0] / 10; // Convert 0-1000 normalized scale to percentage
          const left = cam.box2d[1] / 10;

          return (
            <div
              key={cam.id}
              data-reticle="true"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCam(cam);
              }}
              style={{ top: `${top}%`, left: `${left}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition transform hover:scale-125 shadow-lg ${
                cam.type === "ptz"
                  ? "border-amber-400 bg-amber-500/30 text-amber-300 shadow-amber-500/20"
                  : cam.type === "bullet"
                  ? "border-blue-400 bg-blue-500/30 text-blue-300 shadow-blue-500/20"
                  : cam.type === "varifocal"
                  ? "border-purple-400 bg-purple-500/30 text-purple-300 shadow-purple-500/20"
                  : cam.type === "multisensor"
                  ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-emerald-500/20"
                  : "border-red-500 bg-red-500/30 text-red-300 shadow-red-500/20"
              }`}
            >
              <span className="text-[9px] font-mono font-bold pointer-events-none" data-reticle="true">
                {cam.id.replace("CAM-", "")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Camera Type Correction Popup Drawer */}
      {selectedCam && (
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-red-900/60 p-3 rounded-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono shadow-2xl z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold">{selectedCam.id}</span>
              <span className="text-slate-300">({selectedCam.locationName || "Detected Drop"})</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Confidence: {Math.round(selectedCam.confidence * 100)}% | Rating: {selectedCam.isOutdoor ? "Outdoor (IP66/IK10)" : "Indoor"}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 uppercase">Type:</span>
            {(["dome", "bullet", "ptz", "multisensor", "varifocal", "unknown"] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => {
                    onUpdateCamera(selectedCam.id, t);
                    setSelectedCam({ ...selectedCam, type: t });
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                    selectedCam.type === t
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              )
            )}
            <button
              onClick={() => {
                onRemoveCamera(selectedCam.id);
                setSelectedCam(null);
              }}
              className="bg-red-950/80 border border-red-800 hover:bg-red-800 text-red-200 px-2 py-1 rounded text-[10px] font-bold transition ml-2"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedCam(null)}
              className="text-slate-500 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}