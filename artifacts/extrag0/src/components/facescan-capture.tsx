import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, Loader2, UploadCloud, AlertCircle, Video, FlipHorizontal } from "lucide-react";
import { fileToDataUrl, buildCaptureMetadata } from "@/lib/verification-api";
import { toast } from "sonner";

interface FaceScanCaptureProps {
  onCaptured: (dataUrl: string, captureMetadata: string) => Promise<void> | void;
  label?: string;
  autoStart?: boolean;
}

/**
 * Live camera capture for the mandatory identity selfie ("FaceScan").
 * Works on desktop, Android and iPhone.
 * Falls back to a plain file picker when camera access is denied.
 */
export function FaceScanCapture({
  onCaptured,
  label = "Selfie segurando o documento",
  autoStart = false,
}: FaceScanCaptureProps) {
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
  const [starting, setStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasDualCamera, setHasDualCamera] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async (overrideFacingMode?: "user" | "environment") => {
    setCameraError(null);
    setStarting(true);
    const mode = overrideFacingMode ?? facingMode;
    try {
      // Check API availability
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      // Detect if device has multiple cameras (for toggle button visibility)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        setHasDualCamera(videoInputs.length > 1);
      } catch {}

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720, max: 1280 },
          height: { ideal: 720, max: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Some mobile browsers need explicit play() after setting srcObject
        try {
          await videoRef.current.play();
        } catch {
          // autoplay may be blocked; the video element handles it via autoPlay attr
        }
      }
      setCameraActive(true);
    } catch (e: any) {
      const msg = e?.name === "NotAllowedError"
        ? "Permissão de câmera negada. Habilite nas configurações do navegador ou envie uma foto."
        : e?.name === "NotFoundError"
        ? "Nenhuma câmera encontrada neste dispositivo."
        : e?.name === "NotReadableError"
        ? "Câmera em uso por outro aplicativo. Feche e tente novamente."
        : "Não foi possível acessar a câmera. Você pode enviar uma foto do dispositivo.";
      setCameraError(msg);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (autoStart) startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror for front camera (user-facing)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
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
    } catch (e: any) {
      // Surface upload failures so the user knows to retry instead of assuming success
      toast.error(e?.message ?? "Falha ao enviar a imagem. Verifique sua conexão e tente novamente.");
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
            onClick={() => startCamera()}
            disabled={starting}
            className="w-full h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 gap-2 text-sm font-semibold"
          >
            {starting ? (
              <><Loader2 size={14} className="animate-spin" /> Iniciando câmera...</>
            ) : (
              <><Camera size={15} /> Ativar câmera e capturar</>
            )}
          </Button>
          {cameraError && (
            <p className="text-[11px] text-amber-400 flex items-start gap-1.5 leading-relaxed">
              <AlertCircle size={11} className="mt-0.5 flex-shrink-0" /> {cameraError}
            </p>
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
            {/* autoPlay + playsInline + muted required for all mobile browsers */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
            {/* face oval guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-primary/60 rounded-full"
                style={{ width: "60%", height: "78%", boxShadow: "0 0 0 9999px rgba(0,0,0,0.38)" }} />
            </div>
            <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-white/80 font-medium">
              Centralize seu rosto no oval
            </p>
            {/* Camera flip button (only on multi-camera devices) */}
            {hasDualCamera && (
              <button
                type="button"
                title="Alternar câmera"
                onClick={() => {
                  const next: "user" | "environment" = facingMode === "user" ? "environment" : "user";
                  setFacingMode(next);
                  stopCamera();
                  setTimeout(() => startCamera(next), 200);
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/55 border border-white/20 flex items-center justify-center text-white/80 hover:bg-black/75 hover:text-white transition-all backdrop-blur-sm"
              >
                <FlipHorizontal size={17} />
              </button>
            )}
          </div>
          <Button type="button" onClick={takeSnapshot} className="w-full h-10 rounded-xl bg-primary text-black font-bold gap-2">
            <Camera size={15} /> Capturar foto
          </Button>
          <button
            type="button"
            onClick={() => { stopCamera(); }}
            className="w-full h-8 text-xs text-white/40 hover:text-white/60"
          >
            Cancelar
          </button>
        </div>
      )}

      {captured && (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 aspect-square">
            <img src={captured} className="w-full h-full object-cover" alt="Captura" />
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
