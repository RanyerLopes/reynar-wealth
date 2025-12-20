
import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './UI';

interface CameraModalProps {
  onCapture: (image: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose, title = 'Tirar Foto' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Prefer back camera for docs
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Não foi possível acessar a câmera. Verifique as permissões do dispositivo.');
      }
    };

    startCamera();

    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
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
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(imageData);
        onClose();
      }
    }
  };

  const handleClose = () => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
      onClose();
  };

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
        {error ? (
          <div className="text-white text-center p-6 max-w-sm">
            <p className="mb-6 text-lg">{error}</p>
            <Button onClick={handleClose} variant="secondary">Voltar</Button>
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
      {!error && (
        <div className="p-8 bg-black/80 flex justify-center items-center safe-area-bottom z-20">
            <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group transition-all active:scale-95"
            >
            <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
            </button>
        </div>
      )}
    </div>
  );
};
