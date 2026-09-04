// components/BlueprintScanner.tsx
'use client';

import { useState } from 'react';
import { Upload, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (data: { cameraCount: number; notes: string }) => void;
}

export function BlueprintScanner({ onScanComplete }: ScannerProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      setLoading(true);
      setScanResult(null);

      try {
        const response = await fetch('/api/blueprint-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setScanResult(`AI detected ${result.data.cameraCount} cameras on blueprint.`);
          onScanComplete({
            cameraCount: result.data.cameraCount || 16,
            notes: result.data.confidenceNotes || '',
          });
        } else {
          setScanResult('Could not process image. Check OpenAI API Key.');
        }
      } catch (err) {
        setScanResult('Error scanning blueprint.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex items-center gap-3 mb-4 text-purple-400">
        <Sparkles className="w-6 h-6" />
        <h2 className="text-lg font-semibold text-white">AI Vision Blueprint Takeoff</h2>
      </div>

      <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 transition rounded-xl p-6 text-center cursor-pointer relative bg-slate-950/50">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-slate-500" />
          <p className="text-sm font-medium text-slate-300">
            Drop blueprint floor plan (PNG/JPG) here or <span className="text-purple-400">browse</span>
          </p>
          <p className="text-xs text-slate-500">AI automatically scans and counts camera symbols</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 mt-4 text-sm text-purple-400 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing architectural symbols using GPT-4o Vision...
        </div>
      )}

      {scanResult && !loading && (
        <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          {scanResult}
        </div>
      )}
    </div>
  );
}
