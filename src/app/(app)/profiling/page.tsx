'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { profileNeeds } from '@/lib/actions/profiling';
import type { AutomaticallyProfileAccessibilityNeedsOutput } from '@/ai/flows/automatically-profile-accessibility-needs';
import { Camera, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilingPage() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [profile, setProfile] = useState<AutomaticallyProfileAccessibilityNeedsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Could not access the camera. Please check permissions and try again.");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    setError(null);
    setProfile(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result = await profileNeeds({ webcamDataUri: dataUri });
        if ('error' in result) {
          throw new Error(result.error);
        }
        setProfile(result);
        toast({
          title: "Profile Complete",
          description: "Your accessibility needs have been analyzed.",
        });
      } catch (e: any) {
        setError(e.message);
        toast({
          variant: "destructive",
          title: "Profiling Failed",
          description: e.message,
        });
      } finally {
        setIsScanning(false);
        stopCamera();
      }
    }
  }, [toast]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Automated Accessibility Profiling</h1>
        <p className="text-muted-foreground">
          Use your webcam to automatically detect and set up your accessibility needs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Webcam Scan</CardTitle>
          <CardDescription>
            Position yourself clearly in front of the camera and start the scan. This process is secure and private.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}></video>
            {!isCameraOn && <Camera className="w-16 h-16 text-muted-foreground" />}
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {!isCameraOn ? (
            <Button onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {isScanning ? 'Scanning...' : 'Scan My Profile'}
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Stop Camera
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Profile Results</CardTitle>
            <CardDescription>
              Based on the scan, here are the suggested accessibility settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg font-code text-sm overflow-x-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
