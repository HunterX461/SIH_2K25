/**
 * Geofencing Module Integration
 * 
 * This module provides helper functions for integrating with the geofencing backend
 * and managing geofencing state. It's designed to work modularly with the existing
 * tourist safety application without modifying UI components.
 * 
 * Features:
 * - Backend API communication (/update_location)
 * - State management for geofencing data
 * - Integration with existing notification system
 * - Modular design for easy extension by other contributors
 * 
 * Usage:
 * - Call GeofencingModule.updateLocationWithBackend(touristId, lat, lon) to sync with backend
 * - Use GeofencingModule.getZones() to get current zone data
 * - Hook into GeofencingModule.onZoneTransition for custom zone event handling
 * 
 * @author Generated for SIH 2K25 Tourism Safety Platform
 * @version 1.0.0
 */

window.GeofencingModule = (function() {
    'use strict';
    
    // Private state
    let _config = {
        backendBaseUrl: '', // Will be set from app settings
        touristId: null,
        lastKnownLocation: null,
        zones: [],
        isEnabled: true,
        debugMode: false
    };
    
    let _callbacks = {
        onZoneTransition: [],
        onLocationUpdate: [],
        onError: []
    };
    
    // Private utility functions
    function _log(message, level = 'info') {
        if (_config.debugMode || level === 'error') {
            console[level]('[GeofencingModule]', message);
        }
    }
    
    function _generateTouristId() {
        // Generate a unique tourist ID based on timestamp and random string
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 9);
        return `tourist_${timestamp}_${randomStr}`;
    }
    
    function _makeApiCall(endpoint, method = 'GET', data = null) {
        const url = _config.backendBaseUrl + endpoint;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        _log(`API call: ${method} ${url}`, 'info');
        
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                _log(`API error: ${error.message}`, 'error');
                _triggerCallbacks('onError', { error, endpoint, method, data });
                throw error;
            });
    }
    
    function _triggerCallbacks(event, data) {
        if (_callbacks[event]) {
            _callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    _log(`Callback error in ${event}: ${error.message}`, 'error');
                }
            });
        }
    }
    
    function _processZoneTransitions(apiResponse) {
        if (!apiResponse) return;
        
        const { entered, exited, current_risks, nearest_police } = apiResponse;
        
        // Handle zone entries
        if (entered && entered.length > 0) {
            entered.forEach(zoneId => {
                const riskZone = current_risks?.find(r => r.zone_id === zoneId);
                const alertType = riskZone ? 
                    (riskZone.risk_level === 'high' ? 'danger' : 'warn') : 'ok';
                const zoneName = riskZone ? riskZone.name : zoneId;
                
                // Trigger existing alert system if available
                if (typeof window.addAlert === 'function') {
                    window.addAlert(alertType, `Entered ${zoneName} zone`);
                }
                
                _triggerCallbacks('onZoneTransition', {
                    type: 'entered',
                    zoneId,
                    zoneName,
                    riskLevel: riskZone?.risk_level || 'normal',
                    timestamp: apiResponse.timestamp
                });
            });
        }
        
        // Handle zone exits
        if (exited && exited.length > 0) {
            exited.forEach(zoneId => {
                const zoneName = _config.zones.find(z => z.zone_id === zoneId)?.name || zoneId;
                
                if (typeof window.addAlert === 'function') {
                    window.addAlert('ok', `Exited ${zoneName} zone`);
                }
                
                _triggerCallbacks('onZoneTransition', {
                    type: 'exited',
                    zoneId,
                    zoneName,
                    timestamp: apiResponse.timestamp
                });
            });
        }
        
        // Update current risks in local state
        _config.currentRisks = current_risks || [];
        
        // Store nearest police information
        _config.nearestPolice = nearest_police;
    }
    
    // Public API
    return {
        /**
         * Initialize the geofencing module
         * @param {Object} options - Configuration options
         * @param {string} options.backendBaseUrl - Base URL for the geofencing API
         * @param {string} options.touristId - Optional tourist ID (auto-generated if not provided)
         * @param {boolean} options.debugMode - Enable debug logging
         */
        init: function(options = {}) {
            _config.backendBaseUrl = options.backendBaseUrl || '';
            _config.touristId = options.touristId || _generateTouristId();
            _config.debugMode = options.debugMode || false;
            
            _log(`Initialized with tourist ID: ${_config.touristId}`);
            
            // Try to load zones from backend if URL is configured
            if (_config.backendBaseUrl) {
                this.loadZones().catch(error => {
                    _log(`Failed to load initial zones: ${error.message}`, 'error');
                });
            }
            
            return this;
        },
        
        /**
         * Update backend base URL (useful when app settings change)
         * @param {string} url - New backend base URL
         */
        setBackendUrl: function(url) {
            _config.backendBaseUrl = url;
            _log(`Backend URL updated: ${url}`);
            return this;
        },
        
        /**
         * Get current tourist ID
         * @returns {string} Current tourist ID
         */
        getTouristId: function() {
            return _config.touristId;
        },
        
        /**
         * Set tourist ID
         * @param {string} touristId - New tourist ID
         */
        setTouristId: function(touristId) {
            _config.touristId = touristId;
            _log(`Tourist ID updated: ${touristId}`);
            return this;
        },
        
        /**
         * Update location with the geofencing backend
         * @param {number} lat - Latitude
         * @param {number} lon - Longitude
         * @returns {Promise} Promise that resolves with backend response
         */
        updateLocationWithBackend: function(lat, lon) {
            if (!_config.backendBaseUrl) {
                _log('Backend URL not configured, skipping backend update', 'warn');
                return Promise.resolve(null);
            }
            
            if (!_config.isEnabled) {
                _log('Geofencing module disabled', 'info');
                return Promise.resolve(null);
            }
            
            const locationData = {
                tourist_id: _config.touristId,
                lat: lat,
                lon: lon
            };
            
            _config.lastKnownLocation = { lat, lon, timestamp: new Date().toISOString() };
            
            return _makeApiCall('/update_location', 'POST', locationData)
                .then(response => {
                    _log('Location updated successfully', 'info');
                    _processZoneTransitions(response);
                    _triggerCallbacks('onLocationUpdate', {
                        location: { lat, lon },
                        response: response
                    });
                    return response;
                });
        },
        
        /**
         * Load available zones from backend
         * @returns {Promise} Promise that resolves with zones data
         */
        loadZones: function() {
            if (!_config.backendBaseUrl) {
                return Promise.reject(new Error('Backend URL not configured'));
            }
            
            return _makeApiCall('/map_zones', 'GET')
                .then(zones => {
                    _config.zones = zones;
                    _log(`Loaded ${zones.length} zones from backend`, 'info');
                    return zones;
                });
        },
        
        /**
         * Get current zones
         * @returns {Array} Array of zone objects
         */
        getZones: function() {
            return _config.zones;
        },
        
        /**
         * Get current risk zones that the tourist is in
         * @returns {Array} Array of current risk zones
         */
        getCurrentRisks: function() {
            return _config.currentRisks || [];
        },
        
        /**
         * Get nearest police station information
         * @returns {Object|null} Nearest police station data
         */
        getNearestPolice: function() {
            return _config.nearestPolice || null;
        },
        
        /**
         * Send SOS request to backend
         * @param {string} message - Emergency message
         * @returns {Promise} Promise that resolves with SOS response
         */
        sendSOS: function(message) {
            if (!_config.backendBaseUrl) {
                return Promise.reject(new Error('Backend URL not configured'));
            }
            
            const sosData = {
                tourist_id: _config.touristId,
                message: message
            };
            
            return _makeApiCall('/sos', 'POST', sosData)
                .then(response => {
                    _log('SOS sent successfully', 'info');
                    if (typeof window.addAlert === 'function') {
                        window.addAlert('danger', 'Emergency alert sent to authorities');
                    }
                    return response;
                });
        },
        
        /**
         * Enable or disable the geofencing module
         * @param {boolean} enabled - Whether to enable the module
         */
        setEnabled: function(enabled) {
            _config.isEnabled = enabled;
            _log(`Geofencing ${enabled ? 'enabled' : 'disabled'}`, 'info');
            return this;
        },
        
        /**
         * Check if geofencing is enabled
         * @returns {boolean} Whether geofencing is enabled
         */
        isEnabled: function() {
            return _config.isEnabled;
        },
        
        /**
         * Add event listener for zone transitions
         * @param {Function} callback - Callback function to call on zone transitions
         */
        onZoneTransition: function(callback) {
            if (typeof callback === 'function') {
                _callbacks.onZoneTransition.push(callback);
            }
            return this;
        },
        
        /**
         * Add event listener for location updates
         * @param {Function} callback - Callback function to call on location updates
         */
        onLocationUpdate: function(callback) {
            if (typeof callback === 'function') {
                _callbacks.onLocationUpdate.push(callback);
            }
            return this;
        },
        
        /**
         * Add event listener for errors
         * @param {Function} callback - Callback function to call on errors
         */
        onError: function(callback) {
            if (typeof callback === 'function') {
                _callbacks.onError.push(callback);
            }
            return this;
        },
        
        /**
         * Get current configuration (for debugging)
         * @returns {Object} Current configuration
         */
        getConfig: function() {
            return Object.assign({}, _config);
        },
        
        /**
         * Integration helper: Hook into existing updateLocation function
         * This function can be called from the main app to sync with backend
         * @param {number} lat - Latitude
         * @param {number} lon - Longitude
         */
        integrateWithLocationUpdate: function(lat, lon) {
            // This is designed to be called from the existing updateLocation function
            if (_config.isEnabled && _config.backendBaseUrl) {
                this.updateLocationWithBackend(lat, lon).catch(error => {
                    _log(`Failed to sync location with backend: ${error.message}`, 'error');
                });
            }
        },
        
        /**
         * Integration helper: Hook into existing panic/emergency system
         * @param {string} emergencyMessage - Emergency message from existing system
         */
        integrateWithEmergencySystem: function(emergencyMessage) {
            if (_config.isEnabled && _config.backendBaseUrl) {
                this.sendSOS(emergencyMessage).catch(error => {
                    _log(`Failed to send SOS to backend: ${error.message}`, 'error');
                });
            }
        }
    };
})();

// Auto-initialize if backend URL is available from app settings
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in the main app context and have access to state
    if (typeof window.state !== 'undefined' && window.state.settings) {
        const backendUrl = window.state.settings.backendUrl;
        if (backendUrl) {
            window.GeofencingModule.init({
                backendBaseUrl: backendUrl,
                debugMode: false // Set to true for development
            });
        }
    }
});