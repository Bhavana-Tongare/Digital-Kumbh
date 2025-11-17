
import { Route, EmergencyContact, NearbyPlace } from '@/types';

export const mockRoutes: Route[] = [
  {
    id: '1',
    startPoint: 'Main Entrance',
    endPoint: 'Ganesh Temple',
    distance: 1.2,
    estimatedTime: 15,
    crowdLevel: 'low',
    isBlocked: false,
    waypoints: ['Parking Lot', 'Admin Building', 'Cafeteria'],
  },
  {
    id: '2',
    startPoint: 'Parking Lot',
    endPoint: ' हनुमान मंदिर',
    distance: 0.8,
    estimatedTime: 10,
    crowdLevel: 'moderate',
    isBlocked: false,
    waypoints: ['Main Entrance', 'Gardens'],
  },
  {
    id: '3',
    startPoint: 'Cafeteria',
    endPoint: 'Shivaji Maharaj Statue',
    distance: 1.5,
    estimatedTime: 20,
    crowdLevel: 'high',
    isBlocked: false,
    waypoints: ['Admin Building', 'Parking Lot', 'Gardens'],
  },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Police Control Room',
    phoneNumber: '100',
    type: 'police',
  },
  {
    id: '2',
    name: 'Ambulance Service',
    phoneNumber: '108',
    type: 'ambulance',
  },
  {
    id: '3',
    name: 'Fire Department',
    phoneNumber: '101',
    type: 'fire',
  },
  {
    id: '4',
    name: 'Disaster Management',
    phoneNumber: '1078',
    type: 'disaster',
  },
  {
    id: '5',
    name: 'Women Helpline',
    phoneNumber: '1091',
    type: 'women',
  },
  {
    id: '6',
    name: 'Child Helpline',
    phoneNumber: '1098',
    type: 'child',
  },
  {
    id: '7',
    name: 'Temple Security',
    phoneNumber: '0253-2574330',
    type: 'general',
  }
];

export const mockNearbyPlaces: NearbyPlace[] = [
  {
    id: '1',
    name: 'Hotel Pilgrim Stay',
    type: 'hotel',
    location: '200m from Main Temple',
    distance: 0.2,
    rating: 4.5,
    isOpen: true,
    contact: '+91-9876543210',
    photo: '/assets/hotel1.jpg'
  },
  {
    id: '2',
    name: 'Devotee Restaurant',
    type: 'restaurant',
    location: 'Near Bus Stand',
    distance: 0.5,
    rating: 4.2,
    isOpen: true,
    contact: '+91-9876543211',
  },
  {
    id: '3',
    name: 'City Hospital',
    type: 'hospital',
    location: 'College Road',
    distance: 1.2,
    isOpen: true,
    contact: '+91-02532574444',
  },
  {
    id: '4',
    name: 'Police Station',
    type: 'police',
    location: 'Main Road',
    distance: 0.8,
    isOpen: true,
    contact: '100',
  },
  {
    id: '5',
    name: 'Ganesh Temple',
    type: 'temple',
    location: 'Temple Complex',
    distance: 0.1,
    rating: 4.9,
    isOpen: true,
  }
];
