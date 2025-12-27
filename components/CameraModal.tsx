
import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, Upload, ImageIcon } from 'lucide-react';
import { Button } from './UI';

interface CameraModalProps {
  onCapture: (image: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose, title = 'Tirar Foto' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [mode, setMode] = useState<'camera' | 'upload' | 'choose'>('choose');

  const startCamera = async () => {
    setMode('camera');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('Não foi possível acessar a câmera. Tente fazer upload de uma imagem.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(imageData);
        onClose();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      onCapture(imageData);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Choose Mode - Initial screen
  if (mode === 'choose') {
    return (
      <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center animate-fade-in p-6">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center safe-area-top">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={handleClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Options */}
        <div className="max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            Como você quer adicionar a imagem?
          </h2>

          {/* Camera Option */}
          <button
            onClick={startCamera}
            className="w-full p-6 bg-surfaceHighlight border border-white/10 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Camera size={28} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Usar Câmera</p>
              <p className="text-sm text-textMuted">Tire uma foto do documento</p>
            </div>
          </button>

          {/* Upload Option */}
          <button
            onClick={openFileSelector}
            className="w-full p-6 bg-surfaceHighlight border border-white/10 rounded-2xl hover:border-secondary/50 transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
              <Upload size={28} className="text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Fazer Upload</p>
              <p className="text-sm text-textMuted">Selecione uma imagem da galeria</p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p className="text-xs text-textMuted text-center mt-6">
            Formatos aceitos: JPG, PNG, WEBP (máx. 10MB)
          </p>
        </div>
      </div>
    );
  }

  // Camera Mode
  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-black/50 absolute top-0 w-full z-20 safe-area-top">
        <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>
        <button onClick={handleClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
        {cameraError ? (
          <div className="text-white text-center p-6 max-w-sm">
            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} className="text-danger" />
            </div>
            <p className="mb-6 text-base">{cameraError}</p>
            <div className="space-y-3">
              <Button onClick={openFileSelector} className="w-full">
                <Upload size={18} /> Fazer Upload de Imagem
              </Button>
              <Button onClick={handleClose} variant="ghost" className="w-full">
                Cancelar
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Document Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[85%] h-[65%] border-2 border-white/50 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl -mt-[2px] -ml-[2px]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl -mt-[2px] -mr-[2px]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl -mb-[2px] -ml-[2px]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl -mb-[2px] -mr-[2px]"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Posicione o documento aqui
                </div>
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Capture Controls */}
      {!cameraError && (
        <div className="p-6 bg-black/80 flex justify-center items-center gap-6 safe-area-bottom z-20">
          {/* Upload alternative */}
          <button
            onClick={() => { setMode('choose'); stopCamera(); }}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ImageIcon size={24} className="text-white" />
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
          </button>

          {/* Spacing placeholder */}
          <div className="w-14 h-14"></div>
        </div>
      )}
    </div>
  );
};
