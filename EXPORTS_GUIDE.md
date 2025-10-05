# Module Exports Guide

This document lists all modules and components in the application, showing both named and default exports.

## Components (`/ui/app/components/`)

All component files now have both named and default exports:

### EmergencyContactCard.tsx
- **Named export:** `export function EmergencyContactCard({ contact }: EmergencyContactCardProps)`
- **Default export:** `export default EmergencyContactCard`

### ProfileSection.tsx
- **Named export:** `export function ProfileSection({ title, icon, children }: ProfileSectionProps)`
- **Default export:** `export default ProfileSection`

### QuickActionCard.tsx
- **Named export:** `export function QuickActionCard({ icon, title, subtitle, color, onPress }: QuickActionCardProps)`
- **Default export:** `export default QuickActionCard`

### RecentAlertsCard.tsx
- **Named export:** `export function RecentAlertsCard()`
- **Default export:** `export default RecentAlertsCard`

### SafetyScoreCard.tsx
- **Named export:** `export function SafetyScoreCard({ score, location, onRefresh }: SafetyScoreCardProps)`
- **Default export:** `export default SafetyScoreCard`

### SettingsSection.tsx
- **Named export:** `export function SettingsSection({ title, icon, children }: SettingsSectionProps)`
- **Default export:** `export default SettingsSection`

### TouristIdCard.tsx
- **Named export:** `export function TouristIdCard({ profile }: TouristIdCardProps)`
- **Default export:** `export default TouristIdCard`

## Services (`/ui/app/services/`)

### apiService.ts
- **Named export:** `export const apiService = new ApiService()`
- **Default export:** `export default apiService`

### locationService.ts
- **Named export:** `export const locationService = new LocationService()`
- **Default export:** `export default locationService`

## Hooks (`/ui/app/hooks/`)

### useTranslation.ts
- **Named export:** `export function useTranslation()`
- **Default export:** `export default useTranslation`

## Data (`/ui/app/data/`)

### sampleData.ts
Multiple named exports for individual data sets:
- `export const emergencyContacts`
- `export const safetyZones`
- `export const dangerZones`
- `export const sampleTouristProfiles`
- `export const sampleIncidentReports`
- `export const safetyTips`
- `export const mockApiResponses`

**Default export:** Object containing all data
```typescript
export default {
  emergencyContacts,
  safetyZones,
  dangerZones,
  sampleTouristProfiles,
  sampleIncidentReports,
  safetyTips,
  mockApiResponses,
}
```

## Context (`/ui/app/contexts/`)

### AuthContext.tsx
- **Named exports:**
  - `export function AuthProvider({ children }: { children: ReactNode })`
  - `export function useAuth()`
- **Note:** AuthContext uses named exports only (standard React context pattern)

## Screen Components (`/ui/app/(tabs)/`)

All screen components use default exports:
- `index.tsx` → `export default function HomeScreen()`
- `emergency.tsx` → `export default function EmergencyScreen()`
- `maps.tsx` → `export default function MapsScreen()`
- `maps.web.tsx` → `export default function MapsWebScreen()`
- `profile.tsx` → `export default function ProfileScreen()`
- `settings.tsx` → `export default function SettingsScreen()`

## Login (`/ui/app/`)

### login.tsx
- **Default export:** `export default function LoginScreen()`

## Usage Examples

### Importing with Named Exports
```typescript
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { apiService } from '../services/apiService';
import { useTranslation } from '../hooks/useTranslation';
```

### Importing with Default Exports
```typescript
import EmergencyContactCard from '../components/EmergencyContactCard';
import apiService from '../services/apiService';
import useTranslation from '../hooks/useTranslation';
```

### Importing Sample Data
```typescript
// Import specific data sets
import { emergencyContacts, safetyZones } from '../data/sampleData';

// Import all data at once
import sampleData from '../data/sampleData';
const { emergencyContacts, safetyZones } = sampleData;
```

## Benefits

Having both named and default exports provides flexibility:

1. **Named exports** maintain backward compatibility with existing code
2. **Default exports** allow for easier importing and renaming if needed
3. **Consistency** across all modules in the codebase
4. **IDE support** for auto-imports works better with default exports
