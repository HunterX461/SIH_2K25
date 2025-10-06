/**
 * API Service for Tourist Safety Application
 * Handles all backend API calls with authentication
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE || 'http://10.232.121.138:8000';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
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
    }>('/me', {
      token,
    });
  }

  // Location
  async updateLocation(token: string, latitude: number, longitude: number) {
    return this.request<{
      status: string;
      latitude: number;
      longitude: number;
      tourist_id: number;
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
      nearby_tourists?: Array<{
        id: number;
        name: string;
        distance_km: number;
      }>;
      timestamp: string;
    }>('/sos', {
      method: 'POST',
      token,
      body: { latitude, longitude, message },
    });
  }

  // Zones
  async getZones(token?: string) {
    return this.request<
      {
        zone_id: string;
        name: string;
        risk_level: string;
        zone_type: string;
        color: string;
        coordinates: number[][];
      }[]
    >('/zones', {
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
}

export const apiService = new ApiService();
export default apiService;
