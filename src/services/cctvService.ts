// CCTV Service for communicating with Python YOLOv8 backend
const CCTV_API_BASE = 'http://localhost:5000/api/cctv';

export interface CCTVCamera {
  camera_id: string;
  username: string;
  password: string;
  ip: string;
  port: number;
  stream_path: string;
}

export interface CCTVStatus {
  success: boolean;
  count: number;
  status: 'Green' | 'Yellow' | 'Red';
  is_running: boolean;
}

export interface CCTVFrame {
  success: boolean;
  frame: string; // base64 encoded image
  count: number;
  status: 'Green' | 'Yellow' | 'Red';
}

class CCTVService {
  private activeCameras: Set<string> = new Set();

  async startCCTV(cameraConfig: CCTVCamera): Promise<boolean> {
    try {
      const response = await fetch(`${CCTV_API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cameraConfig),
      });

      const result = await response.json();
      
      if (result.success) {
        this.activeCameras.add(cameraConfig.camera_id);
        console.log(`✅ CCTV started for ${cameraConfig.camera_id}`);
        return true;
      } else {
        console.error(`❌ Failed to start CCTV for ${cameraConfig.camera_id}:`, result.message);
        return false;
      }
    } catch (error) {
      console.error('Error starting CCTV:', error);
      return false;
    }
  }

  async stopCCTV(cameraId: string): Promise<boolean> {
    try {
      const response = await fetch(`${CCTV_API_BASE}/stop/${cameraId}`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        this.activeCameras.delete(cameraId);
        console.log(`✅ CCTV stopped for ${cameraId}`);
        return true;
      } else {
        console.error(`❌ Failed to stop CCTV for ${cameraId}:`, result.message);
        return false;
      }
    } catch (error) {
      console.error('Error stopping CCTV:', error);
      return false;
    }
  }

  async getCCTVStatus(cameraId: string): Promise<CCTVStatus | null> {
    try {
      const response = await fetch(`${CCTV_API_BASE}/status/${cameraId}`);
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          count: result.count,
          status: result.status,
          is_running: result.is_running,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting CCTV status:', error);
      return null;
    }
  }

  async getCCTVFrame(cameraId: string): Promise<CCTVFrame | null> {
    try {
      const response = await fetch(`${CCTV_API_BASE}/frame/${cameraId}`);
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          frame: result.frame,
          count: result.count,
          status: result.status,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting CCTV frame:', error);
      return null;
    }
  }

  getCCTVStreamUrl(cameraId: string): string {
    return `${CCTV_API_BASE}/stream/${cameraId}`;
  }

  isCameraActive(cameraId: string): boolean {
    return this.activeCameras.has(cameraId);
  }

  getActiveCameras(): string[] {
    return Array.from(this.activeCameras);
  }

  // Cleanup all active cameras
  async cleanup(): Promise<void> {
    const stopPromises = Array.from(this.activeCameras).map(cameraId => 
      this.stopCCTV(cameraId)
    );
    await Promise.all(stopPromises);
    this.activeCameras.clear();
  }
}

export const cctvService = new CCTVService();

