
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { startCameraWithAI, stopCameraAI, type DetectionResult } from '@/utils/tensorflowDetection';
import { cctvService, type CCTVCamera } from '@/services/cctvService';
import { logCrowdSample } from '@/services/crowdAnalyticsService';
import { useAuth } from '@/context/AuthContext';

// ============= VIDEO SOURCE CONFIGURATION =============
// The video source is now dynamically passed from the location prop
// It will be an RTSP URL for CCTV cameras:
// Format: rtsp://username:password@ip_address:554/stream_path
// Example: rtsp://admin:pswd%40123@102.108.109.102:554/Streaming/Channels/101
// =====================================================

interface LiveCameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    id: string;
    name: string;
    viewUrl: string;
    cctvConfig?: {
      username: string;
      password: string;
      ip: string;
      port: number;
      streamPath: string;
    };
  };
}

const LiveCameraDialog: React.FC<LiveCameraDialogProps> = ({ isOpen, onClose, location }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peopleCount, setPeopleCount] = useState(0);
  const [status, setStatus] = useState<'Green' | 'Yellow' | 'Red'>('Green');
  // Refs to avoid stale values in setInterval
  const peopleCountRef = useRef(0);
  const statusRef = useRef<'Green' | 'Yellow' | 'Red'>('Green');
  useEffect(() => { peopleCountRef.current = peopleCount; }, [peopleCount]);
  useEffect(() => { statusRef.current = status; }, [status]);
  const [statusColor, setStatusColor] = useState('bg-green-100 text-green-800');
  const [showAlert, setShowAlert] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cctvMode, setCctvMode] = useState(false);
  const [cctvStatus, setCctvStatus] = useState<{count: number, status: 'Green' | 'Yellow' | 'Red'}>({count: 0, status: 'Green'});
  const [cctvFrame, setCctvFrame] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  // Playback watchdogs
  const playbackWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlaybackTimeRef = useRef<number>(0);
  const cctvWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const lastCctvFrameAtRef = useRef<number>(0);
  
  // Determine source type from location.viewUrl
  const SOURCE = location.viewUrl;
  const sourceType = SOURCE === '0' || SOURCE.toLowerCase() === 'webcam' 
    ? 'webcam' 
    : SOURCE.toLowerCase().startsWith('rtsp://') 
    ? 'rtsp' 
    : SOURCE.toLowerCase().includes('.mp4') || SOURCE.toLowerCase().includes('.webm') || SOURCE.toLowerCase().includes('.mov')
    ? 'video'
    : 'video';

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Start AI detection for camera or video
  useEffect(() => {
    let cancelled = false;
    let cctvInterval: NodeJS.Timeout | null = null;
    let logInterval: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (videoRef.current) {
        stopCameraAI(videoRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      if (cctvInterval) {
        clearInterval(cctvInterval);
      }
      if (playbackWatchdogRef.current) {
        clearInterval(playbackWatchdogRef.current);
        playbackWatchdogRef.current = null;
      }
      if (cctvWatchdogRef.current) {
        clearInterval(cctvWatchdogRef.current);
        cctvWatchdogRef.current = null;
      }
      if (logInterval) {
        clearInterval(logInterval);
      }
      if (cctvMode && location.cctvConfig) {
        cctvService.stopCCTV(location.id);
      }
      setPeopleCount(0);
      setIsDetecting(false);
      setAiStatus('loading');
      setShowAlert(false);
      setCctvMode(false);
      setCctvFrame(null);
    };

    if (!isOpen) {
      cleanup();
      return;
    }

    setAiStatus('loading');
    setVideoLoaded(false);

    const startDetection = async () => {
      // Wait for the dialog to render and refs to be attached
      for (let i = 0; i < 60 && !cancelled; i++) {
        if (videoRef.current) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      if (cancelled || !videoRef.current) {
        return;
      }

      try {
        if (sourceType === 'webcam') {
          // Webcam mode - live camera feed
          const cameraStream = await startCameraWithAI(
            videoRef.current,
            (result: DetectionResult) => {
              setPeopleCount(result.count);
              if (result.count >= 1 && result.count <= 3) {
                setStatus('Green');
              } else if (result.count >= 4 && result.count <= 6) {
                setStatus('Yellow');
              } else if (result.count >= 7) {
                setStatus('Red');
              } else {
                setStatus('Green');
              }
            },
            canvasRef.current
          );

          if (!cancelled) {
            if (cameraStream) {
              setStream(cameraStream);
              setIsDetecting(true);
              setAiStatus('ready');
              // Start periodic logging every 30 seconds
              // Log immediately once, then every 30s. We allow logging even if not authenticated
              // provided RLS policies permit anon (see migrations).
              logCrowdSample({
                place_id: location.id,
                place_name: location.name,
                count: peopleCountRef.current,
                status: statusRef.current,
              }).catch((e) => console.error('logCrowdSample error', e));
              logInterval = setInterval(() => {
                logCrowdSample({
                  place_id: location.id,
                  place_name: location.name,
                  count: peopleCountRef.current,
                  status: statusRef.current,
                }).catch((e) => console.error('logCrowdSample error', e));
              }, 30000);
            } else {
              setAiStatus('error');
            }
          }
        } else if (sourceType === 'rtsp' || sourceType === 'video') {
          // Check if we have CCTV config for YOLOv8 processing
          if (location.cctvConfig) {
            // Use CCTV service with YOLOv8
            setCctvMode(true);
            const cctvCamera: CCTVCamera = {
              camera_id: location.id,
              username: location.cctvConfig.username,
              password: location.cctvConfig.password,
              ip: location.cctvConfig.ip,
              port: location.cctvConfig.port,
              stream_path: location.cctvConfig.streamPath,
            };

            const started = await cctvService.startCCTV(cctvCamera);
            if (started) {
              setAiStatus('ready');
              setIsDetecting(true);
              
              // Set up video stream from CCTV service
              if (videoRef.current) {
                videoRef.current.src = cctvService.getCCTVStreamUrl(location.id);
                videoRef.current.load();
              }
              
              // Poll for CCTV frames and status updates
              let framePollCount = 0;
              cctvInterval = setInterval(async () => {
                if (cancelled) return;
                
                try {
                  framePollCount++;
                  
                  // Get frame every 2nd poll for better performance
                  if (framePollCount % 2 === 0) {
                    const frameData = await cctvService.getCCTVFrame(location.id);
                    if (frameData && frameData.success && frameData.frame) {
                      const newFrame = `data:image/jpeg;base64,${frameData.frame}`;
                      setCctvFrame(newFrame);
                      lastCctvFrameAtRef.current = Date.now();
                      console.log('✅ Received CCTV frame, count:', frameData.count, 'status:', frameData.status);
                    }
                  }
                  
                  // Get status every poll
                  const statusData = await cctvService.getCCTVStatus(location.id);
                  if (statusData && statusData.success) {
                    setCctvStatus({ count: statusData.count, status: statusData.status });
                    setPeopleCount(statusData.count);
                    setStatus(statusData.status);
                  }
                } catch (error) {
                  console.error('Error fetching CCTV data:', error);
                  // Don't clear frame on error, keep last frame
                }
              }, 300); // Poll every 300ms for better performance

              // CCTV watchdog: if no new frame for >3s, reload stream
              if (!cctvWatchdogRef.current) {
                lastCctvFrameAtRef.current = Date.now();
                cctvWatchdogRef.current = setInterval(async () => {
                  const now = Date.now();
                  if (now - lastCctvFrameAtRef.current > 3000) {
                    try {
                      console.warn('CCTV watchdog: no frames, reloading stream');
                      if (videoRef.current) {
                        videoRef.current.src = cctvService.getCCTVStreamUrl(location.id);
                        await videoRef.current.load();
                        await videoRef.current.play().catch(() => {});
                      }
                      lastCctvFrameAtRef.current = Date.now();
                    } catch (e) {
                      console.error('CCTV watchdog reload error', e);
                    }
                  }
                }, 1500);
              }

              // Start periodic logging every 30 seconds
              if (!user && loggingEnabled) {
                toast({
                  title: 'Login required to store analytics',
                  description: 'Sign in to save crowd data and view it in Analytics.',
                  variant: 'destructive',
                });
                setLoggingEnabled(false);
              }
              if (user) {
                logCrowdSample({
                  place_id: location.id,
                  place_name: location.name,
                  count: peopleCountRef.current,
                  status: statusRef.current,
                }).catch((e) => console.error('logCrowdSample error', e));
              }
              logInterval = setInterval(() => {
                if (user) {
                  logCrowdSample({
                    place_id: location.id,
                    place_name: location.name,
                    count: peopleCountRef.current,
                    status: statusRef.current,
                  }).catch((e) => console.error('logCrowdSample error', e));
                }
              }, 30000);
            } else {
              setAiStatus('error');
            }
          } else {
            // Regular RTSP or Video file mode
            if (videoRef.current) {
              console.log('Loading video from:', SOURCE);
              videoRef.current.src = SOURCE;
              videoRef.current.load();
              
              // Add event listeners for debugging
              videoRef.current.addEventListener('loadstart', () => {
                console.log('Video load started');
                setVideoLoaded(false);
              });
              videoRef.current.addEventListener('loadeddata', () => {
                console.log('Video data loaded');
                setVideoLoaded(true);
              });
              videoRef.current.addEventListener('canplay', () => {
                console.log('Video can play');
                setVideoLoaded(true);
                // Start playing the video automatically
                videoRef.current?.play().catch(console.error);
              });
              videoRef.current.addEventListener('stalled', () => {
                const v = videoRef.current; if (!v) return;
                console.warn('Video stalled - attempting to resume');
                v.play().catch(() => { try { v.load(); v.play(); } catch {} });
              });
              videoRef.current.addEventListener('waiting', () => {
                const v = videoRef.current; if (!v) return;
                console.warn('Video waiting - buffering');
                v.play().catch(() => {});
              });
              videoRef.current.addEventListener('pause', () => {
                const v = videoRef.current; if (!v) return;
                if (!v.ended) {
                  console.warn('Video paused unexpectedly - attempting resume');
                  v.play().catch(() => { try { v.load(); v.play(); } catch {} });
                }
              });
              videoRef.current.addEventListener('ended', () => {
                const v = videoRef.current; if (!v) return;
                v.currentTime = 0; v.play().catch(() => {});
              });
              videoRef.current.addEventListener('error', (e) => {
                console.error('Video load error:', e);
                setVideoLoaded(false);
                // Only show error toast for non-demo videos
                if (!SOURCE.includes('v2.mp4') && !SOURCE.includes('v3.mp4') && !SOURCE.includes('v4.mp4')) {
                  toast({
                    title: 'Video Load Error',
                    description: `Failed to load video: ${SOURCE}`,
                    variant: 'destructive',
                  });
                }
              });
            }
            
            setAiStatus('ready');
            setIsDetecting(true);
            
            // Start real AI detection when video starts playing
            const handleVideoPlay = () => {
              console.log('Video started playing, starting AI detection...');
              const detectionInterval = setInterval(async () => {
                if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                  try {
                    const { detectPeopleWithTensorFlow } = await import('@/utils/tensorflowDetection');
                    const result = await detectPeopleWithTensorFlow(videoRef.current, canvasRef.current, { maxSide: 448 });
                    
                    console.log('AI Detection result:', result);
                    setPeopleCount(result.count);
                    if (result.count >= 1 && result.count <= 3) {
                      setStatus('Green');
                    } else if (result.count >= 4 && result.count <= 6) {
                      setStatus('Yellow');
                    } else if (result.count >= 7) {
                      setStatus('Red');
                    } else {
                      setStatus('Green');
                    }
                  } catch (error) {
                    console.error('Video detection error:', error);
                  }
                }
              }, 1000); // Run detection every second
              
              (videoRef.current as any).detectionInterval = detectionInterval;
            };
            
            // Add multiple event listeners to ensure detection starts
            videoRef.current?.addEventListener('play', handleVideoPlay);
            videoRef.current?.addEventListener('playing', handleVideoPlay);
            
            // Fallback: start detection after a short delay even if video doesn't auto-play
            setTimeout(() => {
              if (videoRef.current && !videoRef.current.paused) {
                handleVideoPlay();
              }
            }, 1200);

            // Playback watchdog for regular videos
            if (!playbackWatchdogRef.current) {
              lastPlaybackTimeRef.current = videoRef.current?.currentTime || 0;
              playbackWatchdogRef.current = setInterval(() => {
                const v = videoRef.current; if (!v) return;
                const nowTime = v.currentTime || 0;
                const advanced = Math.abs(nowTime - lastPlaybackTimeRef.current) > 0.05;
                if (!v.paused && !v.ended && !advanced) {
                  console.warn('Playback watchdog: video appears stuck, attempting recovery');
                  v.play().catch(() => { try { v.load(); v.play(); } catch {} });
                }
                lastPlaybackTimeRef.current = nowTime;
              }, 1000);
            }

            // Start periodic logging every 30 seconds
            if (!user && loggingEnabled) {
              toast({
                title: 'Login required to store analytics',
                description: 'Sign in to save crowd data and view it in Analytics.',
                variant: 'destructive',
              });
              setLoggingEnabled(false);
            }
            if (user) {
              logCrowdSample({
                place_id: location.id,
                place_name: location.name,
                count: peopleCountRef.current,
                status: statusRef.current,
              }).catch((e) => console.error('logCrowdSample error', e));
            }
            logInterval = setInterval(() => {
              if (user) {
                logCrowdSample({
                  place_id: location.id,
                  place_name: location.name,
                  count: peopleCountRef.current,
                  status: statusRef.current,
                }).catch((e) => console.error('logCrowdSample error', e));
              }
            }, 30000);
          }
        }
      } catch (error) {
        console.error('Failed to start detection:', error);
        if (!cancelled) {
          setAiStatus('error');
          toast({
            title: 'Detection Error',
            description: 'Failed to start AI detection',
            variant: 'destructive',
          });
        }
      }
    };

    startDetection();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isOpen, sourceType]);

  // Update status colors and alerts based on count (YOLO-style thresholds)
  useEffect(() => {
    if (peopleCount >= 1 && peopleCount <= 3) {
      setStatus('Green');
      setStatusColor('bg-green-100 text-green-800');
      setShowAlert(false);
    } else if (peopleCount >= 4 && peopleCount <= 6) {
      setStatus('Yellow');
      setStatusColor('bg-yellow-100 text-yellow-800');
      setShowAlert(false);
    } else if (peopleCount >= 7) {
      setStatus('Red');
      setStatusColor('bg-red-100 text-red-800');
      if (!showAlert) {
        setShowAlert(true);
        toast({
          title: "🚨 Red Alert - High Crowd",
          description: `AI detected ${peopleCount} people at ${location.name}. IMMEDIATE ACTION REQUIRED!`,
          variant: "destructive",
        });
      }
    } else {
      setStatus('Green');
      setStatusColor('bg-green-100 text-green-800');
      setShowAlert(false);
    }
  }, [peopleCount, location.name, showAlert]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading CCTV image:', e);
    toast({
      title: 'CCTV Image Error',
      description: 'Failed to load image from CCTV stream. Check backend logs.',
      variant: 'destructive',
    });
    setCctvFrame(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    // Properly stop camera and cleanup
    if (videoRef.current) {
      stopCameraAI(videoRef.current);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setPeopleCount(0);
    setShowAlert(false);
    setIsDetecting(false);
    setAiStatus('loading');
    setIsFullscreen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent forceMount className={isFullscreen ? "w-screen h-screen max-w-none max-h-none p-0 m-0 rounded-none" : "max-w-4xl max-h-[90vh] overflow-auto"}>
        {!isFullscreen && (
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {getLocalizedText(
                `Live Camera - ${location.name}`,
                `लाइव कैमरा - ${location.name}`,
                `लाइव्ह कॅमेरा - ${location.name}`
              )}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className={isFullscreen ? "h-screen flex flex-col" : "space-y-6"}>
          {/* High Crowd Alert */}
          {showAlert && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>🚨 {getLocalizedText("High Crowd Alert", "उच्च भीड़ चेतावनी", "उच्च गर्दी चेतावणी")}</strong>
                <br />
                {getLocalizedText(
                  `High crowd detected at ${location.name}. Please send volunteers immediately.`,
                  `${location.name} में उच्च भीड़ का पता चला है। कृपया तुरंत स्वयंसेवकों को भेजें।`,
                  `${location.name} येथे उच्च गर्दी आढळली आहे. कृपया तातडीने स्वयंसेवकांना पाठवा.`
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* AI Detection Status - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {getLocalizedText("Real-time AI Detection", "रियल-टाइम AI डिटेक्शन", "रिअल-टाइम AI डिटेक्शन")}
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {isDetecting ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm text-blue-700">
                        {cctvMode ? (
                          getLocalizedText(
                            "YOLOv8 actively detecting people in CCTV feed",
                            "YOLOv8 सीसीटीवी फीड में लोगों का सक्रिय पता लगा रहा है",
                            "YOLOv8 सीसीटीव्ही फीडमध्ये लोकांचा सक्रिय शोध करत आहे"
                          )
                        ) : (
                          getLocalizedText(
                            "TensorFlow.js actively detecting people in camera feed",
                            "TensorFlow.js कैमरा फीड में लोगों का सक्रिय पता लगा रहा है",
                            "TensorFlow.js कॅमेरा फीडमध्ये लोकांचा सक्रिय शोध करत आहे"
                          )
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        {cctvMode ? (
                          getLocalizedText(
                            "Starting YOLOv8 detection system...",
                            "YOLOv8 डिटेक्शन सिस्टम शुरू हो रहा है...",
                            "YOLOv8 डिटेक्शन सिस्टम सुरू होत आहे..."
                          )
                        ) : (
                          getLocalizedText(
                            "Starting AI detection system...",
                            "AI डिटेक्शन सिस्टम शुरू हो रहा है...",
                            "AI डिटेक्शन सिस्टम सुरू होत आहे..."
                          )
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Video Feed with YOLOv8-style AI Detection & Bounding Boxes */}
          <div className="relative flex-1">
            <div className={`${isFullscreen ? 'w-full h-full' : 'aspect-video'} bg-gray-900 ${isFullscreen ? 'rounded-none' : 'rounded-lg'} overflow-hidden relative`}>
              {cctvMode ? (
                // CCTV Mode - Show base64 image frames
                cctvFrame ? (
                  <img 
                    src={cctvFrame} 
                    alt="CCTV Live Feed" 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Connecting to CCTV...</p>
                    </div>
                  </div>
                )
              ) : (
                // Regular Video Mode
                <>
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={() => {
                      // Sync canvas dimensions with video for YOLO overlay
                      if (canvasRef.current && videoRef.current) {
                        const rect = videoRef.current.getBoundingClientRect();
                        canvasRef.current.width = videoRef.current.videoWidth || rect.width;
                        canvasRef.current.height = videoRef.current.videoHeight || rect.height;
                        canvasRef.current.style.width = rect.width + 'px';
                        canvasRef.current.style.height = rect.height + 'px';
                      }
                    }}
                    onError={() => {
                      console.error('Video failed to load:', SOURCE);
                    }}
                  />
                  
                  {/* Fallback for video load failure or demo mode */}
                  {(!videoLoaded && sourceType === 'video') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📹</div>
                        <p className="text-lg mb-2">Loading Video Feed</p>
                        <p className="text-sm text-gray-300">AI-powered crowd monitoring for {location.name}</p>
                        <div className="mt-4 p-3 bg-green-900/30 rounded-lg">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm">AI Detection Starting...</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Video: {SOURCE.split('/').pop()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* YOLOv8-style Overlay Canvas for Bounding Boxes */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ 
                      zIndex: 10,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </>
              )}
              
              {aiStatus === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70" style={{ zIndex: 20 }}>
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>{cctvMode ? 
                      getLocalizedText("Loading YOLOv8 Detection...", "YOLOv8 डिटेक्शन लोड हो रहा है...", "YOLOv8 डिटेक्शन लोड होत आहे...") :
                      getLocalizedText("Loading YOLOv8-style AI Detection...", "YOLOv8-style AI डिटेक्शन लोड हो रहा है...", "YOLOv8-style AI डिटेक्शन लोड होत आहे...")
                    }</p>
                  </div>
                </div>
              )}
              {aiStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/70" style={{ zIndex: 20 }}>
                  <div className="text-white text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{getLocalizedText("Camera Access Failed", "कैमरा एक्सेस विफल", "कॅमेरा अॅक्सेस अयशस्वी")}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overlay with count and status */} 
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{peopleCount}</span>
                <span className="text-sm">
                  {getLocalizedText("people", "लोग", "लोक")}
                </span>
                <div className="flex items-center ml-2">
                  {isDetecting ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 ml-1">
                        {getLocalizedText("AI LIVE", "AI लाइव", "AI लाईव्ह")}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 ml-1">
                        {getLocalizedText("STARTING", "शुरू", "सुरुवात")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-black/70 hover:bg-black/80 text-white border-0"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Badge className={statusColor}>
                {getLocalizedText(
                  status,
                  status === 'Green' ? 'सुरक्षित' : status === 'Yellow' ? 'मध्यम' : 'उच्च भीड़',
                  status === 'Green' ? 'सुरक्षित' : status === 'Yellow' ? 'मध्यम' : 'उच्च गर्दी'
                )}
              </Badge>
            </div>
          </div> 

          {/* Real-time Statistics - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{peopleCount}</div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("Real AI Count", "वास्तविक AI गिनती", "वास्तविक AI गणना")}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {isDetecting ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      <span className="text-xs text-green-600">
                        {getLocalizedText("Live", "लाइव", "लाईव्ह")}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-500">
                        {getLocalizedText("Starting", "शुरू", "सुरुवात")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className={`text-2xl font-bold ${
                  status === 'Green' ? 'text-green-600' : 
                  status === 'Yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getLocalizedText(
                    status,
                    status === 'Green' ? 'सुरक्षित' : status === 'Yellow' ? 'मध्यम' : 'उच्च भीड़',
                    status === 'Green' ? 'सुरक्षित' : status === 'Yellow' ? 'मध्यम' : 'उच्च गर्दी'
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("Status", "स्थिति", "स्थिती")}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className={`text-2xl font-bold ${isDetecting ? 'text-green-600' : 'text-gray-400'}`}>
                  {isDetecting ? 'Active' : 'Starting'}
                </div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("AI Detection", "AI डिटेक्शन", "AI डिटेक्शन")}
                </div>
              </div>
            </div>
          )}

          {/* Control Actions - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {getLocalizedText(
                  "🤖 YOLOv8-style Real-time Detection | 🟢 1-3: Green Alert | 🟡 4-6: Yellow Alert | 🔴 7+: Red Alert",
                  "🤖 YOLOv8-style रियल-टाइम डिटेक्शन | 🟢 1-3: हरी चेतावनी | 🟡 4-6: पीली चेतावनी | 🔴 7+: लाल चेतावनी",
                  "🤖 YOLOv8-style रिअल-टाइम डिटेक्शन | 🟢 1-3: हिरवी चेतावणी | 🟡 4-6: पिवळी चेतावणी | 🔴 7+: लाल चेतावणी"
                )}
              </div>
              <Button onClick={handleClose}>
                {getLocalizedText("Close Camera", "कैमरा बंद करें", "कॅमेरा बंद करा")}
              </Button>
            </div>
          )}

          {/* Fullscreen Close Button */}
          {isFullscreen && (
            <div className="absolute bottom-4 right-4">
              <Button onClick={handleClose} variant="destructive">
                {getLocalizedText("Close Camera", "कैमरा बंद करें", "कॅमेरा बंद करा")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveCameraDialog;
