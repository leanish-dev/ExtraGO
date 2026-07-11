import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, Loader2, UploadCloud, AlertCircle } from "lucide-react";
import { fileToDataUrl, buildCaptureMetadata } from "@/lib/verification-api";

interface FaceScanCaptureProps {
  onCaptured: (dataUrl: string, captureMetadata: string) => Promise<void> | void;
  label?: string;
}

/**
 * Live camera capture for the mandatory identity selfie ("FaceScan").
 * Falls back to a plain file picker when camera access is denied or unavailable —
 * still records capture metadata (timestamp, device, source) either way.
 */
export function FaceScanCapture({ onCaptured, label = "Selfie segurando o documento" }: FaceScanCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [captureSource, setCaptureSource] = useState<"camera" | "file_upload">("camera");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e: any) {
      setCameraError("Não foi possível acessar a câmera. Você pode enviar uma foto do dispositivo.");
    }
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const track = streamRef.current?.getVideoTracks()[0];
    lastCameraTrackRef.current = track ?? null;
    setCaptured(dataUrl);
    setCaptureSource("camera");
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    setDone(false);
    startCamera();
  };

  const confirmCapture = async () => {
    if (!captured) return;
    setSubmitting(true);
    try {
      const track = lastCameraTrackRef.current;
      const metadata = buildCaptureMetadata(
        captureSource === "camera"
          ? { cameraLabel: track?.label || "camera", facingMode: (track?.getSettings()?.facingMode as string) ?? "user" }
          : undefined
      );
      await onCaptured(captured, metadata);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    setCaptured(dataUrl);
    setCaptureSource("file_upload");
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-primary/40 bg-primary/5">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0">
          {captured && <img src={captured} className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{label}</p>
          <p className="text-[11px] text-primary/80">FaceScan enviado com sucesso</p>
        </div>
        <Check size={18} className="text-primary flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/3 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Camera size={15} />
        </div>
        <p className="text-sm font-semibold">{label}</p>
      </div>

      {!captured && !cameraActive && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={startCamera}
            className="w-full h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 gap-2 text-sm font-semibold"
          >
            <Camera size={15} /> Ativar câmera e capturar
          </Button>
          {cameraError && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1.5"><AlertCircle size={11} /> {cameraError}</p>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-9 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:border-white/25 flex items-center justify-center gap-2"
          >
            <UploadCloud size={13} /> Ou enviar uma foto do dispositivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {cameraActive && !captured && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-square bg-black">
            <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" playsInline muted />
            <div className="absolute inset-6 border-2 border-primary/50 rounded-full pointer-events-none" />
          </div>
          <Button type="button" onClick={takeSnapshot} className="w-full h-10 rounded-xl bg-primary text-black font-bold gap-2">
            <Camera size={15} /> Capturar foto
          </Button>
        </div>
      )}

      {captured && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 aspect-square">
            <img src={captured} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={retake} disabled={submitting} className="flex-1 h-10 rounded-xl border-white/15 gap-2 text-sm">
              <RefreshCw size={14} /> Refazer
            </Button>
            <Button
              type="button"
              onClick={() => confirmCapture()}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-primary text-black font-bold gap-2 text-sm"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Confirmar
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
