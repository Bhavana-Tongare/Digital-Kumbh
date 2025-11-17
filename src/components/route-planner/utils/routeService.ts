
import { Route } from '@/types';

// Build context-aware waypoints from user input so "Via" reflects the chosen places
const buildWaypoints = (start: string, end: string, variant: 'fastest' | 'balanced' | 'safest'): string[] => {
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');
  const s = normalize(start);
  const e = normalize(end);
  const sKey = s.split(',')[0].split(' ')[0];
  const eKey = e.split(',')[0].split(' ')[0];

  if (variant === 'fastest') return [`${sKey} Gate`, 'Main Road', `${eKey} Junction`];
  if (variant === 'balanced') return [`${sKey} Square`, 'Footbridge', `${eKey} Market`];
  return [`${sKey} Lane`, 'Security Post', `${eKey} Walkway`];
};

export const fetchRouteData = (start: string, end: string, maxCrowd: number): Promise<Route[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Heuristic, dynamic alternatives based on text inputs
      const baseDistance = Math.max(0.4, Math.min(3, Math.abs(start.length - end.length) * 0.12 + 1));
      const candidates: Route[] = [
        {
          id: 'fastest',
          startPoint: start,
          endPoint: end,
          distance: Number((baseDistance * 0.9).toFixed(1)),
          estimatedTime: Math.max(8, Math.round(baseDistance * 12)),
          crowdLevel: 'high',
          isBlocked: false,
          waypoints: buildWaypoints(start, end, 'fastest'),
        },
        {
          id: 'balanced',
          startPoint: start,
          endPoint: end,
          distance: Number((baseDistance).toFixed(1)),
          estimatedTime: Math.max(10, Math.round(baseDistance * 14)),
          crowdLevel: 'moderate',
          isBlocked: false,
          waypoints: buildWaypoints(start, end, 'balanced'),
        },
        {
          id: 'safest',
          startPoint: start,
          endPoint: end,
          distance: Number((baseDistance * 1.2).toFixed(1)),
          estimatedTime: Math.max(12, Math.round(baseDistance * 16)),
          crowdLevel: 'low',
          isBlocked: false,
          waypoints: buildWaypoints(start, end, 'safest'),
        }
      ];

      const allowHigh = maxCrowd >= 66;
      const allowModerate = maxCrowd >= 33;
      const filtered = candidates.filter(r => r.crowdLevel === 'low' || (r.crowdLevel === 'moderate' && allowModerate) || (r.crowdLevel === 'high' && allowHigh));
      resolve(filtered);
    }, 400);
  });
};

export const generateRouteCoordinates = (
  startCoordinates: [number, number],
  endCoordinates: [number, number],
  numPoints: number = 5
): Array<[number, number]> => {
  const coordinates: Array<[number, number]> = [startCoordinates];
  
  // Generate intermediate points
  for (let i = 1; i < numPoints - 1; i++) {
    const progress = i / (numPoints - 1);
    
    // Add slight randomization to make path look more natural
    const jitterLng = (Math.random() - 0.5) * 0.005;
    const jitterLat = (Math.random() - 0.5) * 0.005;
    
    const lng = startCoordinates[0] + (endCoordinates[0] - startCoordinates[0]) * progress + jitterLng;
    const lat = startCoordinates[1] + (endCoordinates[1] - startCoordinates[1]) * progress + jitterLat;
    
    coordinates.push([lng, lat]);
  }
  
  coordinates.push(endCoordinates);
  
  return coordinates;
};

// Get default location if geolocation fails
export const getDefaultLocation = (): [number, number] => {
  // Default to Nashik, India coordinates
  return [73.7898, 19.9975];
};

// Function to safely get user location with fallback
export const getUserLocation = (): Promise<[number, number]> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      resolve(getDefaultLocation());
      return;
    }
    
    const locationTimeout = setTimeout(() => {
      console.log("Geolocation timeout");
      resolve(getDefaultLocation());
    }, 5000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(locationTimeout);
        console.log("Got position:", position.coords);
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        clearTimeout(locationTimeout);
        console.log("Geolocation error:", error);
        resolve(getDefaultLocation());
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};
