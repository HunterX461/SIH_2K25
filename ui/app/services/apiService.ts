/**
 * API Service for Tourist Safety Application
 * Handles all backend API calls with authentication
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE || 'http://10.232.121.138:8000';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(error.detail || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{
      access_token: string;
      token_type: string;
      tourist_id: number;
      name: string;
      email: string;
    }>('/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    emergency_contact?: string,
    wallet_address?: string,
    is_guest: boolean = false
  ) {
    return this.request<{
      access_token: string;
      token_type: string;
      tourist_id: number;
      name: string;
      email: string;
    }>('/register', {
      method: 'POST',
      body: { name, email, password, emergency_contact, wallet_address, is_guest },
    });
  }

  async getCurrentUser(token: string) {
    return this.request<{
      id: number;
      name: string;
      email: string;
      emergency_contact?: string;
      latitude?: number;
      longitude?: number;
      is_guest: boolean;
      wallet_address?: string;
      status?: string;
    }>('/me', {
      token,
    });
  }

  async requestPasswordReset(email: string) {
    return this.request<{
      status: string;
      message: string;
      token?: string;
      expires_at?: string;
    }>('/password-reset/request', {
      method: 'POST',
      body: { email },
    });
  }

  async confirmPasswordReset(token: string, new_password: string) {
    return this.request<{
      status: string;
      message: string;
    }>('/password-reset/confirm', {
      method: 'POST',
      body: { token, new_password },
    });
  }

  // Location
  async updateLocation(token: string, latitude: number, longitude: number) {
    return this.request<{
      status: string;
      latitude: number;
      longitude: number;
      tourist_id: number;
      user_status: string;
      in_danger_zone: boolean;
      current_zone?: string;
      danger_zone_info?: {
        zone_name: string;
        risk_level: string;
        zone_id: string;
      };
    }>('/update_location', {
      method: 'POST',
      token,
      body: { latitude, longitude },
    });
  }

  // SOS
  async sendSOS(
    token: string,
    latitude: number,
    longitude: number,
    message?: string
  ) {
    return this.request<{
      status: string;
      alert_id: number;
      encrypted_message: string;
      nearest_police_station: {
        name: string;
        latitude: number;
        longitude: number;
      } | null;
      nearby_tourists_alerted?: number;
      nearby_tourists?: {
        id: number;
        name: string;
        distance_km: number;
      }[];
      timestamp: string;
    }>('/sos', {
      method: 'POST',
      token,
      body: { latitude, longitude, message },
    });
  }

  // Zones
  async getZones(zone_type?: string, token?: string) {
    let endpoint = '/zones';
    if (zone_type) {
      endpoint += `?zone_type=${zone_type}`;
    }
    return this.request<
      {
        zone_id: string;
        name: string;
        risk_level: string;
        zone_type: string;
        color: string;
        coordinates: number[][];
      }[]
    >(endpoint, {
      token,
    });
  }

  async getZoneStatistics(token?: string) {
    return this.request<{
      total_zones: number;
      zone_types: { [key: string]: number };
      risk_levels: { [key: string]: number };
      active_incidents: number;
      total_incidents: number;
      must_visit_places: number;
    }>('/zones/statistics', {
      token,
    });
  }

  async createZone(
    token: string,
    zone_id: string,
    name: string,
    risk_level: string,
    zone_type: string,
    coordinates: number[][]
  ) {
    return this.request<{
      status: string;
      zone_id: string;
    }>('/zones', {
      method: 'POST',
      token,
      body: { zone_id, name, risk_level, zone_type, coordinates },
    });
  }

  // Police Stations
  async getPoliceStations(token?: string) {
    return this.request<
      {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
      }[]
    >('/police_stations', {
      token,
    });
  }

  // Alert History
  async getAlertHistory(token: string) {
    return this.request<
      {
        id: number;
        latitude: number;
        longitude: number;
        message?: string;
        timestamp: string;
      }[]
    >('/alerts/history', {
      token,
    });
  }

  // Get all tourist locations
  async getAllTouristLocations(token?: string) {
    return this.request<
      {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        last_updated: string;
        status: string;
        emergency_contact?: string;
      }[]
    >('/tourists/locations', {
      token,
    });
  }

  // Get active SOS alerts
  async getActiveAlerts(token?: string) {
    return this.request<
      {
        id: number;
        tourist_id: number;
        tourist_name: string;
        latitude: number;
        longitude: number;
        message?: string;
        emergency_contact?: string;
        timestamp: string;
        duration_minutes: number;
      }[]
    >('/alerts/active', {
      token,
    });
  }

  // Update SOS alert status
  async updateAlertStatus(token: string, alert_id: number, status: string) {
    return this.request<{
      status: string;
      alert_id: number;
      new_status: string;
      resolved_at?: string;
    }>(`/alerts/${alert_id}/status`, {
      method: 'PUT',
      token,
      body: { alert_id, status },
    });
  }

  // Get must-visit places
  async getMustVisitPlaces(
    latitude?: number,
    longitude?: number,
    radius_km?: number,
    token?: string
  ) {
    let endpoint = '/must_visit_places';
    const params = new URLSearchParams();
    
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());
    if (radius_km !== undefined) params.append('radius_km', radius_km.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<
      {
        id: number;
        zone_id: string;
        name: string;
        latitude: number;
        longitude: number;
        coordinates: number[][];
        description: string;
        distance_km?: number;
      }[]
    >(endpoint, {
      token,
    });
  }

  // Places CRUD operations
  async getPlaces(category?: string, token?: string) {
    let endpoint = '/places';
    if (category) {
      endpoint += `?category=${category}`;
    }
    return this.request<
      {
        id: number;
        name: string;
        description: string;
        latitude: number;
        longitude: number;
        category: string;
        image_url?: string;
        is_active: boolean;
        created_at: string;
      }[]
    >(endpoint, {
      token,
    });
  }

  async createPlace(
    token: string,
    name: string,
    description: string,
    latitude: number,
    longitude: number,
    category: string,
    image_url?: string
  ) {
    return this.request<{
      id: number;
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      category: string;
      image_url?: string;
      is_active: boolean;
      created_at: string;
    }>('/places', {
      method: 'POST',
      token,
      body: { name, description, latitude, longitude, category, image_url },
    });
  }

  async updatePlace(
    token: string,
    placeId: number,
    updates: {
      name?: string;
      description?: string;
      latitude?: number;
      longitude?: number;
      category?: string;
      image_url?: string;
      is_active?: boolean;
    }
  ) {
    return this.request<{
      id: number;
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      category: string;
      image_url?: string;
      is_active: boolean;
      created_at: string;
    }>(`/places/${placeId}`, {
      method: 'PATCH',
      token,
      body: updates,
    });
  }

  async deletePlace(token: string, placeId: number) {
    return this.request<{
      status: string;
      message: string;
      place_id: number;
    }>(`/places/${placeId}`, {
      method: 'DELETE',
      token,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
