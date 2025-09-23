// Sample data for testing the tourist safety app

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface SafetyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  safetyLevel: number;
  description: string;
}

export interface DangerZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  riskLevel: string;
  description: string;
  warnings: string[];
}

export interface TouristProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  touristId: string;
  emergencyContacts: EmergencyContact[];
  currentLocation: string;
  travelDates: string;
  itinerary: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

// Sample Emergency Contacts
export const emergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Jane Doe',
    phone: '+1 (555) 987-6543',
    relationship: 'Spouse',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Local Police',
    phone: '911',
    relationship: 'Emergency Services',
  },
  {
    id: '3',
    name: 'Embassy',
    phone: '+1 (555) 123-9876',
    relationship: 'US Embassy',
  },
  {
    id: '4',
    name: 'Travel Insurance',
    phone: '+1 (800) 555-0199',
    relationship: 'Insurance Provider',
  },
];

// Sample Safety Zones (based on San Francisco)
export const safetyZones: SafetyZone[] = [
  {
    id: '1',
    name: 'Union Square Shopping District',
    latitude: 37.7879,
    longitude: -122.4075,
    radius: 500,
    safetyLevel: 9,
    description: 'Well-patrolled tourist area with high security presence',
  },
  {
    id: '2',
    name: 'Fisherman\'s Wharf',
    latitude: 37.8080,
    longitude: -122.4177,
    radius: 600,
    safetyLevel: 8,
    description: 'Popular tourist destination with regular police patrols',
  },
  {
    id: '3',
    name: 'Golden Gate Park',
    latitude: 37.7694,
    longitude: -122.4862,
    radius: 800,
    safetyLevel: 7,
    description: 'Large public park, generally safe during daylight hours',
  },
  {
    id: '4',
    name: 'Financial District',
    latitude: 37.7946,
    longitude: -122.3999,
    radius: 700,
    safetyLevel: 8,
    description: 'Business district with good security and lighting',
  },
];

// Sample Danger Zones
export const dangerZones: DangerZone[] = [
  {
    id: '1',
    name: 'Tenderloin District',
    latitude: 37.7849,
    longitude: -122.4094,
    radius: 400,
    riskLevel: 'High',
    description: 'Area with higher crime rates, avoid after dark',
    warnings: [
      'High petty crime rate',
      'Drug-related activities',
      'Avoid walking alone at night',
      'Stay on main streets',
    ],
  },
  {
    id: '2',
    name: 'Mission District (certain areas)',
    latitude: 37.7599,
    longitude: -122.4148,
    radius: 300,
    riskLevel: 'Medium',
    description: 'Some areas have increased crime, exercise caution',
    warnings: [
      'Vehicle break-ins common',
      'Be aware of surroundings',
      'Avoid displaying valuables',
    ],
  },
  {
    id: '3',
    name: 'SoMa Industrial Area',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 250,
    riskLevel: 'Medium',
    description: 'Industrial area with limited foot traffic',
    warnings: [
      'Poor lighting at night',
      'Limited police presence',
      'Few people around',
    ],
  },
];

// Sample Tourist Profiles for testing
export const sampleTouristProfiles: TouristProfile[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    nationality: 'USA',
    passportNumber: 'A12345678',
    touristId: 'TST-2025-001234',
    emergencyContacts: emergencyContacts,
    currentLocation: 'San Francisco, CA',
    travelDates: '2025-01-15 to 2025-01-30',
    itinerary: [
      'Golden Gate Bridge',
      'Alcatraz Island',
      'Fisherman\'s Wharf',
      'Union Square',
      'Lombard Street',
      'Chinatown',
    ],
    verificationStatus: 'verified',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+34 612 345 678',
    nationality: 'Spain',
    passportNumber: 'ESP987654',
    touristId: 'TST-2025-001235',
    emergencyContacts: [
      {
        id: '1',
        name: 'Carlos Garcia',
        phone: '+34 612 987 654',
        relationship: 'Brother',
        isPrimary: true,
      },
    ],
    currentLocation: 'San Francisco, CA',
    travelDates: '2025-01-20 to 2025-02-05',
    itinerary: [
      'Wine Country Tour',
      'Golden Gate Park',
      'Castro District',
      'Mission District',
    ],
    verificationStatus: 'pending',
  },
];

// Sample incident reports for testing
export interface IncidentReport {
  id: string;
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  alertType: 'emergency' | 'medical' | 'crime' | 'assistance';
  status: 'active' | 'resolved' | 'cancelled';
  description?: string;
  emergencyContacts: string[];
  responseTime?: number;
}

export const sampleIncidentReports: IncidentReport[] = [
  {
    id: 'INC-2025-001',
    userId: '1',
    timestamp: '2025-01-15T14:30:00Z',
    location: {
      latitude: 37.7879,
      longitude: -122.4075,
      address: 'Union Square, San Francisco, CA',
    },
    alertType: 'assistance',
    status: 'resolved',
    description: 'Lost wallet, need help locating',
    emergencyContacts: ['1'],
    responseTime: 15,
  },
  {
    id: 'INC-2025-002',
    userId: '2',
    timestamp: '2025-01-16T22:15:00Z',
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'Tenderloin District, San Francisco, CA',
    },
    alertType: 'emergency',
    status: 'active',
    description: 'Feeling unsafe, requesting immediate assistance',
    emergencyContacts: ['1', '2'],
  },
];

// Sample safety tips based on location and context
export const safetyTips = {
  general: [
    'Always keep emergency contacts updated',
    'Share your itinerary with trusted contacts',
    'Keep important documents secure',
    'Stay aware of your surroundings',
    'Trust your instincts',
  ],
  nighttime: [
    'Stick to well-lit, populated areas',
    'Avoid walking alone after dark',
    'Use ride-sharing services when possible',
    'Keep valuables hidden',
    'Stay on main streets',
  ],
  highRisk: [
    'Consider leaving the area if possible',
    'Stay in groups',
    'Keep emergency contacts readily available',
    'Avoid displaying expensive items',
    'Be prepared to call for help quickly',
  ],
  transportation: [
    'Use official taxi services or ride-sharing apps',
    'Check vehicle details before entering',
    'Share ride details with contacts',
    'Keep doors locked during travel',
    'Have backup transportation options',
  ],
};

// Mock API responses for testing
export const mockApiResponses = {
  safetyScore: {
    score: 85,
    factors: {
      timeOfDay: 10,
      location: 8,
      crowdDensity: 9,
      crimeHistory: 7,
      weatherConditions: 9,
    },
    recommendations: [
      'Area is generally safe',
      'Good lighting and foot traffic',
      'Police presence nearby',
    ],
  },
  nearbyServices: [
    {
      type: 'police',
      name: 'Central Police Station',
      distance: '0.5 miles',
      phone: '(415) 315-2400',
      address: '766 Vallejo St, San Francisco, CA 94133',
    },
    {
      type: 'hospital',
      name: 'UCSF Medical Center',
      distance: '1.2 miles',
      phone: '(415) 476-1000',
      address: '505 Parnassus Ave, San Francisco, CA 94143',
    },
    {
      type: 'embassy',
      name: 'US Citizen Services',
      distance: '2.1 miles',
      phone: '(415) 268-7600',
      address: '444 Market St, San Francisco, CA 94111',
    },
  ],
};