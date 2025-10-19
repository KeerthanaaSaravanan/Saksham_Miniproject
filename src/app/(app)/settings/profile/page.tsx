
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Camera,
  Upload,
  User,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  Video,
  VideoOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

const gradeConfig = {
  'Class 6': { subjects: true },
  'Class 7': { subjects: true },
  'Class 8': { subjects: true },
  'Class 9': { subjects: true },
  'Class 10': { subjects: true },
  'Class 11': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  'Class 12': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  College: {
    streams: ['Engineering', 'Arts and Science', 'Medical', 'Law', 'Architecture'],
  },
  'Competitive Exam': { streams: ['UPSC', 'TNPSC', 'GATE', 'CSAT'] },
};

export default function ProfileSettingsPage() {
  const { user, isUserLoading } = useUser();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setProfileImage(user.photoURL || `https://picsum.photos/seed/${user.uid}/128/128`);
      // In a real app, you'd fetch grade/stream from your Firestore user profile document
      setGrade('Class 10'); // Placeholder
    }
  }, [user]);

  const selectedGradeConfig = gradeConfig[grade as keyof typeof gradeConfig];
  
  const userInitial = name.split(' ').map((n) => n[0]).join('') || 'U';


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError(
          'Could not access the camera. Please check browser permissions.'
        );
      }
    } else {
      setCameraError('Camera not supported on this device.');
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  },[]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/png');
      setProfileImage(dataUri);
      stopCamera();
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setIsSaving(true);
    
    // In a real app, you would upload the image to Firebase Storage if it's a new data URI
    // For this example, we'll just save the name and the (potentially long) data URI to the profile.
    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: profileImage,
      });

      // Also update grade/stream in your Firestore database here.
      console.log('Saving profile:', { name, grade, stream, profileImage });

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      // Ensure camera is turned off on component unmount
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn, stopCamera]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Update your avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {isUserLoading ? (
                 <Skeleton className="w-32 h-32 rounded-full" />
              ) : (
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={profileImage} alt={name} />
                  <AvatarFallback className="text-4xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              )}

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2" /> Upload
                  </TabsTrigger>
                  <TabsTrigger value="webcam">
                    <Camera className="mr-2" /> Webcam
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2" />
                    Choose a file
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </TabsContent>
                <TabsContent value="webcam" className="mt-4 space-y-4">
                  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}
                    ></video>
                     {!isCameraOn && (
                      <div className="text-center text-muted-foreground">
                        <Camera className="w-16 h-16 mx-auto" />
                        <p>Camera is off</p>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  
                  {cameraError && (
                     <Alert variant="destructive">
                       <AlertCircle className="h-4 w-4" />
                       <AlertTitle>Camera Error</AlertTitle>
                       <AlertDescription>{cameraError}</AlertDescription>
                     </Alert>
                  )}

                  <div className="flex gap-2">
                    {!isCameraOn ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={startCamera}
                      >
                        <Video className="mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full"
                          onClick={captureImage}
                        >
                          <Camera className="mr-2" />
                          Capture
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={stopCamera}
                        >
                          <VideoOff className="mr-2" />
                          Stop Camera
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and grade level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {isUserLoading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
               ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline-block mr-2" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">
                      <GraduationCap className="inline-block mr-2" /> Grade / Level
                    </Label>
                    <Select
                      value={grade}
                      onValueChange={(value) => {
                        setGrade(value);
                        setStream('');
                      }}
                    >
                      <SelectTrigger id="grade" className="h-12 text-base">
                        <SelectValue placeholder="Select your grade or level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(gradeConfig).map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {grade && selectedGradeConfig?.streams && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="stream">Stream / Exam</Label>
                      <Select value={stream} onValueChange={setStream} required>
                        <SelectTrigger id="stream" className="h-12 text-base">
                          <SelectValue placeholder="Select your stream or exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGradeConfig.streams.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                onClick={handleSaveChanges}
                disabled={isSaving || isUserLoading}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

    