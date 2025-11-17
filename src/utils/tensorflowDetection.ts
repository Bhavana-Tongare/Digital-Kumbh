
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { toast } from "@/hooks/use-toast";

// Types for our camera detection
export interface DetectionResult {
  count: number;
  status: 'Green' | 'Yellow' | 'Red';
  image?: string;
  detections?: any[];
}

let model: cocoSsd.ObjectDetection | null = null;
let modelBase: 'mobilenet_v2' | 'lite_mobilenet_v2' = 'lite_mobilenet_v2';

// Initialize TensorFlow.js and load the COCO-SSD model
const initializeModel = async (): Promise<cocoSsd.ObjectDetection> => {
  if (model) return model;
  
  try {
    console.log('Initializing TensorFlow.js...');
    // Set backend to webgl for better performance
    await tf.setBackend('webgl');
    try { (tf as any).env().set('WEBGL_FORCE_F16_TEXTURES', true); } catch {}
    try { (tf as any).env().set('WEBGL_PACK', true); } catch {}
    await tf.ready();
    
    console.log('Loading COCO-SSD model (lite backbone)...');
    model = await cocoSsd.load({ base: modelBase });
    console.log('Model loaded successfully');
    
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    toast({
      title: "Model Loading Error",
      description: "Could not load AI detection model. Using fallback detection.",
      variant: "destructive",
    });
    throw error;
  }
};

// Enhanced people detection with YOLO-style bounding boxes and alerts (exported for video use)
export const detectPeopleWithTensorFlow = async (
  videoElement: HTMLVideoElement,
  canvasElement?: HTMLCanvasElement,
  options?: { maxSide?: number }
): Promise<DetectionResult> => {
  try {
    // Initialize model if not already loaded
    const detectionModel = await initializeModel();
    
    // Create a canvas to capture the video frame (downscale for performance)
    const canvas = canvasElement || document.createElement('canvas');
    const videoWidth = videoElement.videoWidth || 640;
    const videoHeight = videoElement.videoHeight || 480;
    const maxSide = options?.maxSide ?? 512; // cap longer side
    const scale = Math.min(1, maxSide / Math.max(videoWidth, videoHeight));
    const targetWidth = Math.max(160, Math.round(videoWidth * scale));
    const targetHeight = Math.max(120, Math.round(videoHeight * scale));
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    // Clear canvas and draw the current video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Ensure overlay canvas matches video display size
    if (canvasElement && canvasElement !== canvas) {
      const displayW = videoElement.clientWidth || videoWidth;
      const displayH = videoElement.clientHeight || videoHeight;
      canvasElement.width = displayW;
      canvasElement.height = displayH;
    }
    
    // Run detection on the canvas
    const predictions = await detectionModel.detect(canvas);
    
    // Filter predictions to only include people with higher confidence (like YOLOv8)
    const peopleDetections = predictions.filter(prediction => 
      prediction.class === 'person' && prediction.score > 0.6
    );
    
    const peopleCount = peopleDetections.length;
    
    // Draw bounding boxes and labels (YOLO-style visualization)
    peopleDetections.forEach((detection, index) => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw green bounding box (like YOLOv8)
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw person label with background (like YOLOv8)
      const label = `Person ${(detection.score * 100).toFixed(0)}%`;
      const fontSize = Math.max(12, canvas.width * 0.02);
      ctx.font = `${fontSize}px Arial`;
      
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      
      // Background rectangle for text
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x, y - textHeight - 4, textWidth + 8, textHeight + 4);
      
      // Text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x + 4, y - 4);
    });
    
    // Determine status based on count (exact YOLOv8 Python thresholds)
    let status: 'Green' | 'Yellow' | 'Red';
    let alertText: string;
    
    if (peopleCount >= 1 && peopleCount <= 3) {
      status = 'Green';
      alertText = `Green Alert - Count: ${peopleCount}`;
    } else if (peopleCount >= 4 && peopleCount <= 6) {
      status = 'Yellow';
      alertText = `Yellow Alert - Count: ${peopleCount}`;
    } else if (peopleCount >= 7) {
      status = 'Red';
      alertText = `Red Alert - Count: ${peopleCount}`;
    } else {
      status = 'Green';
      alertText = "No Person Detected";
    }
    
    // Draw alert text overlay (YOLO-style top-left alert)
    if (canvasElement) {
      const fontSize = Math.max(16, canvas.width * 0.025);
      ctx.font = `${fontSize}px Arial`;
      
      const textMetrics = ctx.measureText(alertText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      
      const padding = 10;
      const x = 20;
      const y = 40;
      
      // Background rectangle (black like YOLOv8)
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - padding/2, y - textHeight - padding/2, textWidth + padding, textHeight + padding);
      
      // Alert text with color based on status
      let textColor = '#FFFFFF';
      if (status === 'Green') textColor = '#00FF00';
      else if (status === 'Yellow') textColor = '#FFFF00';
      else if (status === 'Red') textColor = '#FF0000';
      
      ctx.fillStyle = textColor;
      ctx.fillText(alertText, x, y);
    }
    
    // Get the processed image with bounding boxes
    const image = canvas.toDataURL('image/jpeg', 0.7);
    
    console.log(`🎯 YOLOv8-style Detection: ${peopleCount} people | Status: ${status} | Confidences:`, 
      peopleDetections.map(d => d.score.toFixed(3)));
    
    return { 
      count: peopleCount, 
      status, 
      image,
      detections: peopleDetections
    };
    
  } catch (error) {
    console.error('TensorFlow detection error:', error);
    return { count: 0, status: 'Green' };
  }
};

// Enhanced camera access with YOLO-style real-time detection and overlay
export const startCameraWithAI = async (
  videoElement: HTMLVideoElement | null,
  onDetection: (result: DetectionResult) => void,
  overlayCanvasElement?: HTMLCanvasElement | null
): Promise<MediaStream | null> => {
  if (!videoElement) {
    toast({
      title: "Error",
      description: "Video element not found",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Connect the stream to the video element
    videoElement.srcObject = stream;
    
    // Make sure video starts playing
    await videoElement.play().catch(error => {
      console.error("Error playing video:", error);
      toast({
        title: "Video Error",
        description: "Could not start video playback",
        variant: "destructive",
      });
    });
    
    // Start YOLO-style AI detection after video is ready
    setTimeout(() => {
      const detectionInterval = setInterval(async () => {
        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
          try {
            // Run detection with optional canvas overlay (YOLO-style)
            const result = await detectPeopleWithTensorFlow(videoElement, overlayCanvasElement || undefined);
            onDetection(result);
            
            // YOLO-style alert conditions (exact match with Python code)
            if (result.count >= 7) {
              toast({
                title: "🚨 RED ALERT - High Crowd Detected!",
                description: `AI detected ${result.count} people - IMMEDIATE ACTION REQUIRED!`,
                variant: "destructive",
              });
            } else if (result.count >= 4 && result.count <= 6) {
              toast({
                title: "⚠️ YELLOW ALERT - Moderate Crowd",
                description: `AI detected ${result.count} people - Monitor closely`,
                variant: "default",
              });
            } else if (result.count >= 1 && result.count <= 3) {
              console.log(`✅ GREEN ALERT - Safe crowd level: ${result.count} people`);
            }
          } catch (error) {
            console.error("YOLOv8-style detection error:", error);
          }
        }
      }, 800); // Reduce interval to improve responsiveness with downscaled frames
      
      // Store the interval ID for cleanup
      (videoElement as any).detectionInterval = detectionInterval;
    }, 1000);
    
    return stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    toast({
      title: "Camera Access Error",
      description: "Could not access camera. Please check permissions and try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Stop camera and cleanup
export const stopCameraAI = (videoElement: HTMLVideoElement | null) => {
  if (!videoElement) return;
  
  // Clear detection interval
  if ((videoElement as any).detectionInterval) {
    clearInterval((videoElement as any).detectionInterval);
  }
  
  // Stop all tracks in the stream
  const stream = videoElement.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
};
