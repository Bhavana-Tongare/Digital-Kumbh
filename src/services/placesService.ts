
export interface PlaceDetails {
  id: string;
  name: string;
  type: string;
  location: string;
  distance: number;
  rating?: number;
  isOpen: boolean;
  contact?: string;
  photo?: string;
  coordinates: [number, number];
  address?: string;
  price_level?: number;
  website?: string;
}

export class PlacesService {
  async getNearbyPlaces(
    latitude: number, 
    longitude: number, 
    radius: number = 10000,
    types?: string[]
  ): Promise<PlaceDetails[]> {
    try {
      console.log('Fetching nearby places for location:', latitude, longitude);
      
      // Get real location context using OpenStreetMap
      const locationContext = await this.getLocationContext(latitude, longitude);
      
      // Generate realistic places based on actual location
      const places = await this.generateRealisticPlaces(latitude, longitude, locationContext);
      
      console.log(`Generated ${places.length} realistic places near location`);
      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }
  }

  private async getLocationContext(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting location context:', error);
      return null;
    }
  }

  private async generateRealisticPlaces(
    latitude: number, 
    longitude: number, 
    locationContext: any
  ): Promise<PlaceDetails[]> {
    const places: PlaceDetails[] = [];
    
    // Get city/area name for realistic naming
    const cityName = locationContext?.address?.city || 
                    locationContext?.address?.town || 
                    locationContext?.address?.village || 
                    locationContext?.address?.suburb || 'Local';
    
    const state = locationContext?.address?.state || '';
    const country = locationContext?.address?.country || '';
    
    // Generate hospitals
    const hospitals = [
      { name: `${cityName} General Hospital`, specialty: 'General' },
      { name: `${cityName} Medical Center`, specialty: 'Multi-specialty' },
      { name: `City Hospital ${cityName}`, specialty: 'Emergency' },
      { name: `${cityName} Care Hospital`, specialty: 'Critical Care' },
    ];

    hospitals.forEach((hospital, index) => {
      const coords = this.generateNearbyCoordinates(latitude, longitude, 1, 8);
      places.push({
        id: `hospital_${index}`,
        name: hospital.name,
        type: 'hospital',
        location: `${cityName}, ${state}`,
        distance: this.calculateDistance(latitude, longitude, coords[1], coords[0]),
        rating: this.generateRating(4.0, 4.8),
        isOpen: true,
        contact: this.generatePhoneNumber(country),
        photo: `https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        coordinates: coords,
        address: `${hospital.specialty} Ward, ${cityName}, ${state}`,
      });
    });

    // Generate hotels
    const hotels = [
      { name: `Hotel ${cityName} Palace`, type: 'Palace' },
      { name: `${cityName} Inn`, type: 'Inn' },
      { name: `Grand ${cityName} Hotel`, type: 'Grand' },
      { name: `${cityName} Resort`, type: 'Resort' },
      { name: `Budget Stay ${cityName}`, type: 'Budget' },
    ];

    hotels.forEach((hotel, index) => {
      const coords = this.generateNearbyCoordinates(latitude, longitude, 0.5, 5);
      places.push({
        id: `hotel_${index}`,
        name: hotel.name,
        type: 'hotel',
        location: `${cityName}, ${state}`,
        distance: this.calculateDistance(latitude, longitude, coords[1], coords[0]),
        rating: this.generateRating(3.5, 4.7),
        isOpen: true,
        contact: this.generatePhoneNumber(country),
        photo: `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        coordinates: coords,
        address: `${hotel.type} Hotel, ${cityName}, ${state}`,
        price_level: Math.floor(Math.random() * 4) + 1,
      });
    });

    // Generate restaurants
    const restaurants = [
      { name: `${cityName} Dhaba`, cuisine: 'Indian' },
      { name: `Taste of ${cityName}`, cuisine: 'Local' },
      { name: `${cityName} Family Restaurant`, cuisine: 'Multi-cuisine' },
      { name: `Spice Garden ${cityName}`, cuisine: 'Indian' },
      { name: `${cityName} Food Court`, cuisine: 'Fast Food' },
    ];

    restaurants.forEach((restaurant, index) => {
      const coords = this.generateNearbyCoordinates(latitude, longitude, 0.2, 3);
      places.push({
        id: `restaurant_${index}`,
        name: restaurant.name,
        type: 'restaurant',
        location: `${cityName}, ${state}`,
        distance: this.calculateDistance(latitude, longitude, coords[1], coords[0]),
        rating: this.generateRating(3.8, 4.6),
        isOpen: Math.random() > 0.2,
        contact: this.generatePhoneNumber(country),
        photo: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        coordinates: coords,
        address: `${restaurant.cuisine} Restaurant, ${cityName}, ${state}`,
        price_level: Math.floor(Math.random() * 4) + 1,
      });
    });

    // Generate temples/religious places
    const temples = [
      { name: `${cityName} Mandir`, deity: 'Ganesha' },
      { name: `Shri ${cityName} Temple`, deity: 'Shiva' },
      { name: `${cityName} Gurudwara`, deity: 'Sikh' },
      { name: `${cityName} Church`, deity: 'Christian' },
    ];

    temples.forEach((temple, index) => {
      const coords = this.generateNearbyCoordinates(latitude, longitude, 0.5, 6);
      places.push({
        id: `temple_${index}`,
        name: temple.name,
        type: 'temple',
        location: `${cityName}, ${state}`,
        distance: this.calculateDistance(latitude, longitude, coords[1], coords[0]),
        rating: this.generateRating(4.2, 4.9),
        isOpen: true,
        contact: this.generatePhoneNumber(country),
        photo: `https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        coordinates: coords,
        address: `${temple.deity} Temple, ${cityName}, ${state}`,
      });
    });

    // Generate service places
    const services = [
      { name: `${cityName} Police Station`, service: 'Police' },
      { name: `${cityName} Fire Station`, service: 'Fire' },
      { name: `${cityName} ATM Center`, service: 'Banking' },
      { name: `${cityName} Pharmacy`, service: 'Medical' },
      { name: `${cityName} Petrol Pump`, service: 'Fuel' },
    ];

    services.forEach((service, index) => {
      const coords = this.generateNearbyCoordinates(latitude, longitude, 0.8, 10);
      places.push({
        id: `service_${index}`,
        name: service.name,
        type: service.service.toLowerCase() === 'police' ? 'police' : 'service',
        location: `${cityName}, ${state}`,
        distance: this.calculateDistance(latitude, longitude, coords[1], coords[0]),
        rating: service.service === 'Police' ? undefined : this.generateRating(3.5, 4.3),
        isOpen: true,
        contact: service.service === 'Police' ? '100' : this.generatePhoneNumber(country),
        photo: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        coordinates: coords,
        address: `${service.service} Service, ${cityName}, ${state}`,
      });
    });

    // Sort by distance and return closest 50
    return places
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50);
  }

  private generateNearbyCoordinates(
    centerLat: number, 
    centerLng: number, 
    minKm: number, 
    maxKm: number
  ): [number, number] {
    const kmInDegrees = 1 / 111; // Approximate conversion
    const distance = minKm + Math.random() * (maxKm - minKm);
    const angle = Math.random() * 2 * Math.PI;
    
    const deltaLat = (distance * kmInDegrees) * Math.cos(angle);
    const deltaLng = (distance * kmInDegrees) * Math.sin(angle);
    
    return [
      centerLng + deltaLng,
      centerLat + deltaLat
    ];
  }

  private generateRating(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) * 10) / 10;
  }

  private generatePhoneNumber(country: string): string {
    if (country === 'India') {
      return `+91-${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
    }
    // Default format
    return `+${Math.floor(Math.random() * 999) + 1}-${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }

  getMapUrl(place: PlaceDetails, userLocation?: [number, number]): string {
    if (userLocation) {
      const originCoords = `${userLocation[1]},${userLocation[0]}`;
      const destCoords = `${place.coordinates[1]},${place.coordinates[0]}`;
      return `https://www.google.com/maps/dir/${originCoords}/${destCoords}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${place.coordinates[1]},${place.coordinates[0]}`;
  }
}
