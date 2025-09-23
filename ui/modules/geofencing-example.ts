/**
 * Example of how to integrate with the Geofencing Module
 * 
 * This file demonstrates how other modules can extend geofencing functionality
 * without modifying the UI or core geofencing logic.
 */

import { getGeofencingService, useGeofencing, GeofenceEvent } from './geofencing';

/**
 * Example: Analytics Module Integration
 * Track geofencing events for analytics purposes
 */
export class GeofencingAnalytics {
  private events: GeofenceEvent[] = [];

  initialize() {
    const service = getGeofencingService();
    
    // Subscribe to all geofencing events
    service.onGeofenceEvent((event) => {
      this.logEvent(event);
      this.sendToAnalytics(event);
    });
  }

  private logEvent(event: GeofenceEvent) {
    console.log(`[Analytics] Geofence event: ${event.type}`, event);
    this.events.push({
      ...event,
      timestamp: Date.now()
    } as any);
  }

  private async sendToAnalytics(event: GeofenceEvent) {
    // Example: send to analytics service
    try {
      await fetch('/api/analytics/geofence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  getEventHistory() {
    return this.events;
  }
}

/**
 * Example: Emergency Response Integration
 * Automatically trigger additional actions on emergency events
 */
export class EmergencyResponseService {
  private emergencyContacts: string[] = [];

  initialize(contacts: string[] = []) {
    this.emergencyContacts = contacts;
    const service = getGeofencingService();
    
    service.onGeofenceEvent((event) => {
      if (event.type === 'sos_trigger') {
        this.handleEmergency(event);
      } else if (event.type === 'zone_enter' && event.zone?.risk_level === 'high') {
        this.handleHighRiskZoneEntry(event);
      }
    });
  }

  private async handleEmergency(event: GeofenceEvent) {
    console.log('[Emergency] SOS triggered, sending alerts...');
    
    // Send SMS to emergency contacts
    for (const contact of this.emergencyContacts) {
      await this.sendSMS(contact, 'EMERGENCY: Tourist needs immediate assistance');
    }
    
    // Log to emergency system
    await this.logToEmergencySystem(event);
  }

  private async handleHighRiskZoneEntry(event: GeofenceEvent) {
    console.log('[Emergency] High risk zone entered, monitoring closely...');
    
    // Could trigger automated check-ins or elevated monitoring
    setTimeout(() => {
      this.sendCheckInAlert();
    }, 300000); // 5 minute check-in
  }

  private async sendSMS(contact: string, message: string) {
    // Implementation would integrate with SMS service
    console.log(`SMS to ${contact}: ${message}`);
  }

  private async logToEmergencySystem(event: GeofenceEvent) {
    // Log to emergency response system
    console.log('Logged emergency event to response system');
  }

  private sendCheckInAlert() {
    // Send check-in notification to user
    console.log('Check-in alert sent to user');
  }
}

/**
 * Example: React Component Integration
 * Show how to use the geofencing hook in a React component
 * 
 * Note: This would be implemented in a .tsx file in a real component
 */
export function createExampleGeofencingComponent() {
  // This function returns the component logic as a string for documentation
  return `
import React, { useEffect } from 'react';
import { useGeofencing } from '@/modules/geofencing';

export function ExampleGeofencingComponent() {
  const { service, currentLocation, zones, sendSOS, onEvent } = useGeofencing();

  // Subscribe to geofencing events in component
  useEffect(() => {
    const unsubscribe = onEvent((event) => {
      console.log('Component received geofence event:', event);
      
      // Handle specific events in component
      if (event.type === 'zone_enter') {
        // Update local component state, show UI notifications, etc.
      }
    });

    return unsubscribe; // Cleanup subscription
  }, [onEvent]);

  const handleEmergencyClick = async () => {
    const success = await sendSOS('Help needed - emergency button pressed');
    if (success) {
      console.log('SOS sent successfully');
    }
  };

  return (
    <div>
      <h3>Geofencing Status</h3>
      <p>Current Location: {currentLocation ? \`\${currentLocation.lat}, \${currentLocation.lon}\` : 'Unknown'}</p>
      <p>Active Zones: {zones.length}</p>
      <button onClick={handleEmergencyClick}>Send SOS</button>
    </div>
  );
}`;
}

/**
 * Example: Custom Alert Integration  
 * Replace default alert system with custom notification service
 */
export class CustomNotificationService {
  initialize() {
    const service = getGeofencingService();
    
    // Update the alert function to use custom notifications
    service.updateConfig({
      alertFunction: (type, message) => {
        this.showCustomNotification(type, message);
      }
    });
  }

  private showCustomNotification(type: 'warning' | 'info' | 'danger', message: string) {
    // Custom notification implementation
    console.log(`[Custom Alert ${type.toUpperCase()}] ${message}`);
    
    // Could integrate with toast notifications, push notifications, etc.
    // Example: react-hot-toast, react-toastify, or native push notifications
  }
}

// Export initialization function for easy setup
export function initializeGeofencingExtensions() {
  // Initialize all extension services
  const analytics = new GeofencingAnalytics();
  analytics.initialize();

  const emergency = new EmergencyResponseService();
  emergency.initialize(['911', 'emergency-contact@example.com']);

  const notifications = new CustomNotificationService();
  notifications.initialize();

  console.log('Geofencing extensions initialized');
  
  return {
    analytics,
    emergency,
    notifications
  };
}