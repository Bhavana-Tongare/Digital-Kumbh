import cv2
from ultralytics import YOLO
from urllib.parse import quote
import base64
import json
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import threading
import time
import torch

app = Flask(__name__)
CORS(app)

# Global variables for camera management
active_cameras = {}
camera_threads = {}

class CCTVCamera:
    def __init__(self, camera_id, username, password, ip, port, stream_path):
        self.camera_id = camera_id
        self.username = username
        self.password = password
        self.ip = ip
        self.port = port
        self.stream_path = stream_path
        self.cap = None
        self.model = None
        self.is_running = False
        self.latest_count = 0
        self.latest_status = "Green"
        self.latest_frame = None
        
    def build_rtsp_url(self):
        u = quote(self.username, safe='')
        p = quote(self.password, safe='')
        return f"rtsp://{u}:{p}@{self.ip}:{self.port}/{self.stream_path}"
    
    def start_detection(self):
        if self.is_running:
            return
            
        self.is_running = True
        
        # Load YOLOv8 model with PyTorch compatibility fix
        try:
            # Fix for PyTorch 2.6+ weights_only issue
            torch.serialization.add_safe_globals(['ultralytics.nn.tasks.DetectionModel'])
            self.model = YOLO("yolov8n.pt")
        except Exception as e:
            print(f"Error loading YOLOv8 model: {e}")
            # Fallback: try with weights_only=False
            import torch.serialization
            original_load = torch.load
            torch.load = lambda *args, **kwargs: original_load(*args, **kwargs, weights_only=False)
            self.model = YOLO("yolov8n.pt")
            torch.load = original_load
        
        # Build RTSP URL
        rtsp_url = self.build_rtsp_url()
        
        # Open camera stream
        self.cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
        
        if not self.cap.isOpened():
            print(f"❌ Could not connect to CCTV stream for {self.camera_id}")
            self.is_running = False
            return False
        
        print(f"✅ CCTV stream connected successfully for {self.camera_id}")
        
        # Start detection loop in separate thread
        detection_thread = threading.Thread(target=self._detection_loop)
        detection_thread.daemon = True
        detection_thread.start()
        
        return True
    
    def _detection_loop(self):
        frame_count = 0
        while self.is_running and self.cap and self.cap.isOpened():
            try:
                ret, frame = self.cap.read()
                if not ret:
                    print(f"No video frame detected for {self.camera_id}")
                    time.sleep(0.5)  # Wait before retrying
                    continue
                
                # Only run detection every 3rd frame for better performance
                frame_count += 1
                if frame_count % 3 == 0:
                    # Run YOLO inference
                    results = self.model(frame, stream=True)
                    person_count = 0
                    
                    for result in results:
                        for box in result.boxes:
                            cls = int(box.cls[0])
                            if cls == 0:  # "person"
                                person_count += 1
                                x1, y1, x2, y2 = map(int, box.xyxy[0])
                                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                                cv2.putText(frame, "Person", (x1, y1 - 10),
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
                    # Determine alert level
                    if 1 <= person_count <= 3:
                        alert_text = f"Green Alert - Count: {person_count}"
                        color = (0, 255, 0)
                        status = "Green"
                    elif 4 <= person_count <= 6:
                        alert_text = f"Yellow Alert - Count: {person_count}"
                        color = (0, 255, 255)
                        status = "Yellow"
                    elif person_count >= 7:
                        alert_text = f"Red Alert - Count: {person_count}"
                        color = (0, 0, 255)
                        status = "Red"
                    else:
                        alert_text = "No Person Detected"
                        color = (255, 255, 255)
                        status = "Green"
                    
                    # Draw alert text
                    font_scale = 0.6
                    thickness = 2
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    
                    (text_w, text_h), baseline = cv2.getTextSize(alert_text, font, font_scale, thickness)
                    x, y = 20, 40
                    
                    cv2.rectangle(frame, (x - 5, y - text_h - 5), (x + text_w + 5, y + 5), (0, 0, 0), -1)
                    cv2.putText(frame, alert_text, (x, y), font, font_scale, color, thickness, cv2.LINE_AA)
                    
                    # Update latest data
                    self.latest_count = person_count
                    self.latest_status = status
                
                # Always update frame for smooth video
                frame_resized = cv2.resize(frame, (640, 480))
                self.latest_frame = frame_resized
                
                time.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                print(f"Error in detection loop for {self.camera_id}: {e}")
                time.sleep(1)  # Wait before retrying
    
    def stop_detection(self):
        self.is_running = False
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()

# API Endpoints
@app.route('/api/cctv/start', methods=['POST'])
def start_cctv():
    data = request.json
    camera_id = data.get('camera_id')
    username = data.get('username', 'admin')
    password = data.get('password', 'pswd@cctv')
    ip = data.get('ip', '102.16.34.20')
    port = data.get('port', 554)
    stream_path = data.get('stream_path', 'Streaming/Channels/101')
    
    if camera_id in active_cameras:
        return jsonify({'success': True, 'message': 'Camera already running'})
    
    camera = CCTVCamera(camera_id, username, password, ip, port, stream_path)
    success = camera.start_detection()
    
    if success:
        active_cameras[camera_id] = camera
        return jsonify({'success': True, 'message': 'CCTV started successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to start CCTV'})

@app.route('/api/cctv/stop/<camera_id>', methods=['POST'])
def stop_cctv(camera_id):
    if camera_id in active_cameras:
        active_cameras[camera_id].stop_detection()
        del active_cameras[camera_id]
        return jsonify({'success': True, 'message': 'CCTV stopped successfully'})
    return jsonify({'success': False, 'message': 'Camera not found'})

@app.route('/api/cctv/status/<camera_id>', methods=['GET'])
def get_cctv_status(camera_id):
    if camera_id in active_cameras:
        camera = active_cameras[camera_id]
        return jsonify({
            'success': True,
            'count': camera.latest_count,
            'status': camera.latest_status,
            'is_running': camera.is_running
        })
    return jsonify({'success': False, 'message': 'Camera not found'})

@app.route('/api/cctv/frame/<camera_id>', methods=['GET'])
def get_cctv_frame(camera_id):
    try:
        if camera_id in active_cameras:
            camera = active_cameras[camera_id]
            if camera.latest_frame is not None and camera.is_running:
                # Encode frame as base64 with compression
                _, buffer = cv2.imencode('.jpg', camera.latest_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                return jsonify({
                    'success': True,
                    'frame': frame_base64,
                    'count': camera.latest_count,
                    'status': camera.latest_status
                })
            else:
                return jsonify({'success': False, 'message': 'Camera not ready or no frame available'})
        else:
            return jsonify({'success': False, 'message': 'Camera not found'})
    except Exception as e:
        print(f"Error getting frame for {camera_id}: {e}")
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/api/cctv/stream/<camera_id>')
def stream_cctv(camera_id):
    if camera_id not in active_cameras:
        return "Camera not found", 404
    
    camera = active_cameras[camera_id]
    
    def generate_frames():
        while camera.is_running:
            if camera.latest_frame is not None:
                _, buffer = cv2.imencode('.jpg', camera.latest_frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.1)
    
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("🚀 Starting CCTV Service with YOLOv8...")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

