# Video-Based Camera System for Crowd Monitoring

## Overview
This system provides a demonstration of crowd monitoring using pre-recorded video files instead of live CCTV streams. This is useful for testing and demonstration purposes when live CCTV feeds are not available.

## Features
- **Demo Video Support**: Uses local MP4 video files for demonstration
- **AI Detection**: Simulates crowd detection with predefined values
- **Multiple Areas**: Supports Food Court, Bus Terminal, Railway Station, and Residential Camp
- **Status Indicators**: Shows Green/Yellow/Red status based on simulated crowd counts

## Video Files
The following demo video files are used:
- `/videos/food-court-demo.mp4` - Food Court area (3 people, Green status)
- `/videos/bus-terminal-demo.mp4` - Bus Terminal area (5 people, Yellow status)
- `/videos/railway-station-demo.mp4` - Railway Station area (2 people, Green status)
- `/videos/residential-camp-demo.mp4` - Residential Camp area (1 person, Green status)

## Implementation Details

### MonitoringAreas.tsx
- Updated to include video-based camera locations
- Added camera IDs for all demo areas
- Configured to use local video files instead of RTSP streams

### LiveCameraDialog.tsx
- Enhanced to detect video file sources
- Added demo data simulation for crowd counts
- Maintains AI detection interface for real videos

## Usage
1. Navigate to the Crowd Monitoring page
2. Click "View Live Camera" on any demo area (Food Court, Bus Terminal, etc.)
3. The system will load the demo video and show simulated crowd detection
4. Status indicators will show appropriate Green/Yellow/Red status

## Adding Real Videos
To use actual video files:
1. Replace the placeholder files in `/public/videos/` with real MP4 videos
2. Update the demo data in `LiveCameraDialog.tsx` if needed
3. The system will automatically detect and play the videos

## Technical Notes
- Videos are served from the public directory for easy access
- Demo data is hardcoded for demonstration purposes
- Real video detection can be enabled by removing the demo data simulation
- The system maintains compatibility with live CCTV streams and webcam feeds
