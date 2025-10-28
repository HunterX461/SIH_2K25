# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive mobile application designed to enhance tourist safety through real-time monitoring, emergency response, and location-based safety intelligence.

## 🚀 Features

### Core Safety Features
- **Real-time Location Tracking**: GPS-based monitoring with geofencing alerts
- **Emergency SOS System**: One-touch emergency alerts with location sharing
- **AI-powered Safety Scoring**: Dynamic area risk assessment based on multiple factors
- **Digital Tourist ID**: Secure KYC verification and digital identification
- **Emergency Contact Management**: Quick access to pre-configured emergency contacts

### User Experience
- **Multilingual Support**: Available in English, Spanish, and French
- **Accessibility Features**: Text-to-speech, adjustable font sizes, high contrast
- **Intuitive Interface**: Emergency-focused design with large touch targets
- **Real-time Notifications**: Instant alerts for safety zone changes

### Technology Stack
- **Frontend**: React Native with Expo Router
- **Maps**: React Native Maps with Google Maps integration
- **Location Services**: Expo Location API
- **State Management**: React Hooks
- **Navigation**: Tab-based navigation with stack navigation
- **Icons**: Lucide React Native icons

## 📱 App Structure

### Main Screens
1. **Home Dashboard**: Safety score, quick actions, recent alerts
2. **Maps**: Real-time location with safety zones visualization
3. **Emergency**: SOS button and emergency contact management
4. **Profile**: Digital Tourist ID and personal information
5. **Settings**: Preferences, language, and accessibility options

### Key Components
- `SafetyScoreCard`: Displays AI-calculated area safety score
- `TouristIdCard`: Digital identification with verification status
- `EmergencyContactCard`: Emergency contact management with quick actions
- `QuickActionCard`: Fast access to critical safety features

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Studio (for testing)

### Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd tourist-safety-app
   npm install
   ```

2. **Environment Configuration**
   The `.env` file contains the backend API configuration:
   ```
   EXPO_PUBLIC_API_BASE=http://localhost:8000
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   ```
   
   The default backend URL is `http://localhost:8000` for local development. If testing on a physical device or emulator on a different network, update `EXPO_PUBLIC_API_BASE` with your computer's local IP address (e.g., `http://192.168.1.x:8000`).

3. **Run the Application**
   ```bash
   npm run dev
   ```

4. **Open on Device**
   - Scan QR code with Expo Go app
   - Or run in iOS/Android simulator

## 🔧 Configuration

### Google Maps Setup
1. Enable Google Maps SDK in Google Cloud Console
2. Generate API key with Maps SDK permissions
3. Add key to environment configuration

### Firebase Setup (Future Implementation)
1. Create Firebase project
2. Enable Firestore and Authentication
3. Configure security rules for user data

## 🌍 Multilingual Support

The app supports three languages with complete translations:
- **English (en)**: Default language
- **Spanish (es)**: Full translation available
- **French (fr)**: Full translation available

Language switching is available in Settings and persists across app sessions.

## 🔒 Security Features

### Data Protection
- Secure storage of personal information
- Encrypted emergency contact data
- Privacy-focused location tracking

### Emergency Response
- Instant SOS alerts to predefined contacts
- Location sharing with emergency services
- Automatic incident logging

## 🧪 Testing Data

The app includes comprehensive sample data for testing:

### Sample Tourist Profiles
- John Doe (USA) - Verified status
- Maria Garcia (Spain) - Pending verification

### Predefined Safety Zones
- Union Square Shopping District (High Safety)
- Fisherman's Wharf (High Safety)
- Golden Gate Park (Medium Safety)
- Financial District (High Safety)

### Danger Zones
- Tenderloin District (High Risk)
- Mission District areas (Medium Risk)
- SoMa Industrial Area (Medium Risk)

## 🔮 Future Enhancements

### Backend Integration
- RESTful API development with Node.js/Express
- Firebase Firestore for data persistence
- Real-time notification system
- Admin dashboard for incident management

### Advanced Features
- ML-powered risk prediction
- Social safety features
- Offline emergency capabilities
- Integration with local emergency services

### AI Improvements
- Enhanced safety scoring algorithm
- Predictive risk assessment
- Behavioral pattern analysis
- Crowd-sourced safety data

## 🏗 Architecture

### Component Structure
```
app/
├── (tabs)/                 # Tab navigation screens
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── services/              # Business logic services
└── data/                  # Sample data and types
```

### Key Services
- `locationService`: GPS and geofencing logic
- `useTranslation`: Multilingual support hook
- Sample data providers for testing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and inquiries:
- Create an issue in the repository
- Contact the development team
- Check documentation for common issues

---

**Built with ❤️ for tourist safety worldwide**