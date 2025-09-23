# Smart Tourist Safety Monitoring & Incident Response System

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST**. Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

A comprehensive multi-platform tourist safety application consisting of a React Native Expo mobile app, Python geofencing module, and HTML web dashboard for enhanced tourist safety through real-time monitoring, emergency response, and location-based intelligence.

## Prerequisites & Environment Setup

**NEVER CANCEL BUILDS OR LONG-RUNNING COMMANDS**. Commands may take 2+ minutes to complete. Always set appropriate timeouts and wait for completion.

Install required dependencies:
- Node.js v20+ is pre-installed (verified v20.19.5)
- Python 3.12+ is pre-installed (verified v3.12.3)
- System packages for Python dependencies: `sudo apt-get update && sudo apt-get install -y python3-shapely python3-geopy`

## Working Effectively

### React Native Expo Mobile App (`/ui` directory)

**Bootstrap and build the mobile app:**
```bash
cd /home/runner/work/SIH_2K25/SIH_2K25/ui
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps  # Takes ~60 seconds, dependency conflicts resolved with --legacy-peer-deps
npm install ajv@latest          # Required to fix Expo build dependencies
```

**Development server:**
```bash
npm run dev                      # Starts Metro bundler on http://localhost:8081
                                # NEVER CANCEL: Takes 15-30 seconds to start
                                # Set timeout to 60+ seconds
```

**Linting (has known issues):**
```bash
npm run lint                     # Shows 22 warnings, 1 error - this is expected
                                # Takes ~5 seconds
```

**Web build (currently fails):**
```bash
npm run build:web               # FAILS - dependency issues with ajv/dist/compile/codegen
                                # Do not attempt to fix - document as "Web build fails due to dependency conflicts"
```

**Key Components:**
- `/ui/app/(tabs)/` - Main app screens (home, maps, emergency, profile, settings)
- `/ui/app/components/` - Reusable UI components
- `/ui/app/data/sampleData.ts` - Mock data for testing
- `/ui/app/hooks/useTranslation.ts` - Multilingual support
- `/ui/babel.config.js` - Babel configuration with module resolver

### Python Geofencing Module (`/geofencing_module` directory)

**Install dependencies:**
```bash
sudo apt-get install -y python3-shapely python3-geopy  # Takes ~30 seconds, required system packages
```

**Run tests (currently has import issues):**
```bash
cd /home/runner/work/SIH_2K25/SIH_2K25/geofencing_module
python3 -m unittest geofencing_module.tests.test_geofence -v
# FAILS - Missing compute_transitions function, parameter name mismatches
# Do not attempt to fix - document as "Tests fail due to API inconsistencies"
```

**Key Components:**
- `/geofencing_module/geofencing_module/core/geofence.py` - Zone detection logic
- `/geofencing_module/geofencing_module/tests/test_geofence.py` - Unit tests
- `/geofencing_module/geofencing_module/examples/example_usage.py` - Usage examples
- `/geofencing_module/requirements.txt` - Dependencies (shapely==1.8.6 unavailable)

### HTML Web Application (`/index.html`)

**Run the web app:**
```bash
cd /home/runner/work/SIH_2K25/SIH_2K25
python3 -m http.server 8080      # Serves on http://localhost:8080
                                # NEVER CANCEL: Keep running for testing
                                # Works perfectly despite external CDN resource blocks
```

**Functional features verified:**
- Login with wallet/without wallet options
- Tourist ID management with digital verification
- Geofencing zone creation and management
- Emergency panic button with countdown
- Location tracking and manual location updates
- Safety scoring with configurable weights
- Data export/import functionality
- Backend sync configuration

## Validation Scenarios

**ALWAYS manually validate changes with these complete end-to-end scenarios:**

**Mobile App Validation:**
1. Start development server: `cd ui && npm run dev`
2. Wait for Metro bundler to fully start (15-30 seconds)
3. Verify no fatal errors in console output
4. **CRITICAL**: Cannot run on device/simulator - document development server only

**Web App Validation:**
1. Start HTTP server: `python3 -m http.server 8080`
2. Navigate to http://localhost:8080
3. Click "Continue without wallet"
4. Test geofence creation: Add location coordinates, select zone type
5. Test Tourist ID: Fill in profile information
6. Test emergency functionality: Verify panic button shows countdown
7. Verify all sections load without JavaScript errors

**Python Module Validation:**
1. Verify shapely import works: `python3 -c "from shapely.geometry import Point; print('OK')"`
2. Test module structure: `ls geofencing_module/geofencing_module/core/`
3. **CRITICAL**: Unit tests currently fail - do not attempt to run as validation

## Build Times and Timeout Requirements

**NEVER CANCEL these commands - always wait for completion:**

- **UI npm install**: ~60 seconds → Set timeout to 120+ seconds
- **UI development server startup**: ~30 seconds → Set timeout to 60+ seconds  
- **UI lint**: ~5 seconds → Set timeout to 30+ seconds
- **Python dependency install**: ~30 seconds → Set timeout to 60+ seconds
- **Web server startup**: Instant → No timeout needed

## Known Issues and Workarounds

**UI Mobile App:**
- Web build fails due to ajv dependency conflicts - **DO NOT ATTEMPT TO FIX**
- ESLint shows 22 warnings, 1 error - **EXPECTED, DO NOT FIX**
- Expo CLI not globally installed - use `npm run` scripts only
- Use `--legacy-peer-deps` flag for npm install to resolve conflicts

**Python Geofencing Module:**
- `shapely==1.8.6` in requirements.txt doesn't exist - use system package instead
- Unit tests fail due to API inconsistencies in geofence.py - **DO NOT ATTEMPT TO FIX**
- Missing `compute_transitions` standalone function - method exists on ZoneManager class
- `radius_meters` vs `radius_m` parameter naming inconsistency

**HTML Web Application:**
- External CDN resources (Google Fonts, Tailwind CSS) blocked - **EXPECTED, APP STILL WORKS**
- No build process required - static HTML file
- All functionality works despite CDN blocks

## Common File Locations

**Frequently modified files:**
- `/ui/app/(tabs)/emergency.tsx` - Emergency screen with SOS functionality
- `/ui/app/data/sampleData.ts` - Mock data for tourist profiles and safety zones
- `/geofencing_module/geofencing_module/core/geofence.py` - Zone detection algorithms
- `/index.html` - Complete web application in single file

**Configuration files:**
- `/ui/package.json` - Mobile app dependencies and scripts
- `/ui/babel.config.js` - Babel configuration with aliases
- `/geofencing_module/requirements.txt` - Python dependencies
- `/geofencing_module/setup.py` - Python package configuration

**Key directories:**
- `/ui/app/(tabs)/` - Main mobile app screens
- `/ui/app/components/` - Reusable UI components  
- `/geofencing_module/geofencing_module/core/` - Core geofencing logic
- `/geofencing_module/geofencing_module/tests/` - Test files

## Testing and CI/CD

**No automated CI/CD pipelines exist** - validate changes manually using the scenarios above.

**Before committing changes:**
1. Run UI lint: `cd ui && npm run lint` (expect warnings)
2. Start and test web app: Complete validation scenario above
3. Verify Python imports: `python3 -c "import geofencing_module.core.geofence"`
4. **CRITICAL**: Always test complete user workflows, not just build success

## Architecture Overview

**Three main components:**
1. **Mobile App** (`/ui/`) - React Native with Expo for iOS/Android
2. **Geofencing Module** (`/geofencing_module/`) - Python package for location-based zones
3. **Web Dashboard** (`/index.html`) - HTML/CSS/JS for web access

**Data flow:**
- Mobile app contains sample data and UI components
- Geofencing module provides zone detection algorithms
- Web dashboard offers complete standalone functionality
- No backend integration currently active (all data stored locally)

## Sample Data Available

The codebase includes comprehensive test data:
- Tourist profiles (John Doe, Maria Garcia)  
- Safety zones (Union Square, Fisherman's Wharf, Golden Gate Park)
- Danger zones (Tenderloin District, Mission District, SoMa Industrial)
- Emergency contacts and incident reports
- Location data for San Francisco area

**Use existing sample data for testing instead of creating new mock data**.