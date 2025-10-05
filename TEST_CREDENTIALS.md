# Test Credentials Documentation

## Overview

Test credentials have been implemented to allow for offline development and testing without requiring a backend connection.

## Test Account Details

**Email:** `test@gmail.com`  
**Password:** `test123`

## How It Works

The test credentials are implemented in `/ui/app/contexts/AuthContext.tsx` in the `login` function. When these specific credentials are entered:

1. The authentication bypasses the backend API call
2. A local test user is created with the following details:
   - **ID:** 999
   - **Name:** Test User
   - **Email:** test@gmail.com
   - **Token:** test-token-{timestamp}
   - **Emergency Contact:** +1 (555) 000-0000
   - **Guest Status:** false

3. The user data is stored in local storage (web) or AsyncStorage (mobile)
4. The user is immediately logged in and redirected to the main app

## Usage

### On the Login Screen

1. Open the app and navigate to the login screen
2. Enter email: `test@gmail.com`
3. Enter password: `test123`
4. Click "Login"
5. You will be logged in without any backend connection

### Code Implementation

```typescript
// In AuthContext.tsx login function
if (email === 'test@gmail.com' && password === 'test123') {
  const userData: User = {
    id: 999,
    name: 'Test User',
    email: 'test@gmail.com',
    token: 'test-token-' + Date.now(),
    emergency_contact: '+1 (555) 000-0000',
    is_guest: false
  };
  setUser(userData);
  await storage.setItem('user', JSON.stringify(userData));
  return;
}
```

## Benefits

1. **Offline Development:** Test the app without a running backend
2. **Quick Testing:** Instant login without database setup
3. **Demo Purposes:** Show the app functionality without backend infrastructure
4. **Development Speed:** Faster iteration during UI development

## Security Note

⚠️ **Important:** These test credentials are for development only. In production:
- Remove or disable the test credentials bypass
- Use environment variable to control test mode
- Implement proper authentication with backend
- Use secure credential management

## Testing Other Features

With the test credentials, you can test:
- ✅ Navigation through all app screens
- ✅ Profile viewing and editing
- ✅ Emergency contacts display
- ✅ Settings functionality
- ✅ UI components and layouts
- ⚠️ API-dependent features will not work (need backend)

## Disabling Test Credentials

To disable test credentials in production, wrap the bypass code in a development check:

```typescript
if (__DEV__ && email === 'test@gmail.com' && password === 'test123') {
  // ... test user creation
}
```

Or use an environment variable:

```typescript
if (process.env.EXPO_PUBLIC_ENABLE_TEST_CREDENTIALS === 'true' && 
    email === 'test@gmail.com' && password === 'test123') {
  // ... test user creation
}
```

## Related Files

- `/ui/app/contexts/AuthContext.tsx` - Test credentials implementation
- `/ui/app/login.tsx` - Login screen where credentials are entered
- `/INTEGRATION_GUIDE.md` - General integration documentation
