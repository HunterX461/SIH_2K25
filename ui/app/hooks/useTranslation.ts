import { useState } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Home Screen
    tourist_safety: 'Tourist Safety',
    stay_safe_travel_smart: 'Stay safe, travel smart',
    quick_actions: 'Quick Actions',
    emergency_sos: 'Emergency SOS',
    instant_help: 'Instant Help',
    track_location: 'Track Location',
    real_time_monitoring: 'Real-time monitoring',
    emergency_contacts: 'Emergency Contacts',
    manage_contacts: 'Manage contacts',
    safety_score: 'Safety Score',
    current_area_safety: 'Current area safety level',
    recent_alerts: 'Recent Alerts',
    
    // Maps Screen
    your_location: 'Your Location',
    current_position: 'Current position',
    map_legend: 'Map Legend',
    safe_zones: 'Safe Zones',
    danger_zones: 'Danger Zones',
    
    // Emergency Screen
    emergency_assistance: 'Emergency Assistance',
    immediate_help_available: 'Immediate help available 24/7',
    emergency_active: 'EMERGENCY ACTIVE',
    help_arriving_in: 'Help arriving in',
    cancel_alert: 'Cancel Alert',
    alert_sent: 'ALERT SENT',
    press_for_emergency_help: 'Press for immediate emergency assistance',
    call_police: 'Call Police',
    send_message: 'Send Message',
    
    // Profile Screen
    edit_profile: 'Edit Profile',
    save: 'Save',
    personal_information: 'Personal Information',
    identification: 'Identification',
    travel_information: 'Travel Information',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    nationality: 'Nationality',
    passport_number: 'Passport Number',
    verification_status: 'Verification Status',
    verify_identity: 'Verify Identity',
    current_location: 'Current Location',
    travel_dates: 'Travel Dates',
    emergency_contact: 'Emergency Contact',
    save_changes: 'Save Changes',
    
    // Settings Screen
    settings: 'Settings',
    customize_your_experience: 'Customize your experience',
    language_accessibility: 'Language & Accessibility',
    language: 'Language',
    font_size: 'Font Size',
    audio_feedback: 'Audio Feedback',
    auto_translate: 'Auto Translate',
    notifications: 'Notifications',
    push_notifications: 'Push Notifications',
    emergency_alerts: 'Emergency Alerts',
    privacy_security: 'Privacy & Security',
    location_tracking: 'Location Tracking',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    support: 'Support',
    help_center: 'Help Center',
    contact_support: 'Contact Support',
    report_issue: 'Report Issue',
    sign_out: 'Sign Out',
  },
  es: {
    // Home Screen
    tourist_safety: 'Seguridad Turística',
    stay_safe_travel_smart: 'Mantente seguro, viaja inteligente',
    quick_actions: 'Acciones Rápidas',
    emergency_sos: 'SOS de Emergencia',
    instant_help: 'Ayuda Instantánea',
    track_location: 'Rastrear Ubicación',
    real_time_monitoring: 'Monitoreo en tiempo real',
    emergency_contacts: 'Contactos de Emergencia',
    manage_contacts: 'Gestionar contactos',
    safety_score: 'Puntuación de Seguridad',
    current_area_safety: 'Nivel de seguridad del área actual',
    recent_alerts: 'Alertas Recientes',
    
    // Maps Screen
    your_location: 'Tu Ubicación',
    current_position: 'Posición actual',
    map_legend: 'Leyenda del Mapa',
    safe_zones: 'Zonas Seguras',
    danger_zones: 'Zonas Peligrosas',
    
    // Emergency Screen
    emergency_assistance: 'Asistencia de Emergencia',
    immediate_help_available: 'Ayuda inmediata disponible 24/7',
    emergency_active: 'EMERGENCIA ACTIVA',
    help_arriving_in: 'Ayuda llegando en',
    cancel_alert: 'Cancelar Alerta',
    alert_sent: 'ALERTA ENVIADA',
    press_for_emergency_help: 'Presiona para asistencia de emergencia inmediata',
    call_police: 'Llamar Policía',
    send_message: 'Enviar Mensaje',
    
    // Profile Screen
    edit_profile: 'Editar Perfil',
    save: 'Guardar',
    personal_information: 'Información Personal',
    identification: 'Identificación',
    travel_information: 'Información de Viaje',
    full_name: 'Nombre Completo',
    email: 'Correo',
    phone: 'Teléfono',
    nationality: 'Nacionalidad',
    passport_number: 'Número de Pasaporte',
    verification_status: 'Estado de Verificación',
    verify_identity: 'Verificar Identidad',
    current_location: 'Ubicación Actual',
    travel_dates: 'Fechas de Viaje',
    emergency_contact: 'Contacto de Emergencia',
    save_changes: 'Guardar Cambios',
    
    // Settings Screen
    settings: 'Configuración',
    customize_your_experience: 'Personaliza tu experiencia',
    language_accessibility: 'Idioma y Accesibilidad',
    language: 'Idioma',
    font_size: 'Tamaño de Fuente',
    audio_feedback: 'Retroalimentación de Audio',
    auto_translate: 'Traducción Automática',
    notifications: 'Notificaciones',
    push_notifications: 'Notificaciones Push',
    emergency_alerts: 'Alertas de Emergencia',
    privacy_security: 'Privacidad y Seguridad',
    location_tracking: 'Rastreo de Ubicación',
    privacy_policy: 'Política de Privacidad',
    terms_of_service: 'Términos de Servicio',
    support: 'Soporte',
    help_center: 'Centro de Ayuda',
    contact_support: 'Contactar Soporte',
    report_issue: 'Reportar Problema',
    sign_out: 'Cerrar Sesión',
  },
  fr: {
    // Home Screen
    tourist_safety: 'Sécurité Touristique',
    stay_safe_travel_smart: 'Restez en sécurité, voyagez intelligemment',
    quick_actions: 'Actions Rapides',
    emergency_sos: 'SOS d\'Urgence',
    instant_help: 'Aide Instantanée',
    track_location: 'Suivi de Position',
    real_time_monitoring: 'Surveillance en temps réel',
    emergency_contacts: 'Contacts d\'Urgence',
    manage_contacts: 'Gérer les contacts',
    safety_score: 'Score de Sécurité',
    current_area_safety: 'Niveau de sécurité de la zone actuelle',
    recent_alerts: 'Alertes Récentes',
    
    // Maps Screen
    your_location: 'Votre Position',
    current_position: 'Position actuelle',
    map_legend: 'Légende de la Carte',
    safe_zones: 'Zones Sûres',
    danger_zones: 'Zones Dangereuses',
    
    // Emergency Screen
    emergency_assistance: 'Assistance d\'Urgence',
    immediate_help_available: 'Aide immédiate disponible 24h/24 et 7j/7',
    emergency_active: 'URGENCE ACTIVE',
    help_arriving_in: 'Aide arrivant dans',
    cancel_alert: 'Annuler l\'Alerte',
    alert_sent: 'ALERTE ENVOYÉE',
    press_for_emergency_help: 'Appuyez pour une assistance d\'urgence immédiate',
    call_police: 'Appeler la Police',
    send_message: 'Envoyer un Message',
    
    // Profile Screen
    edit_profile: 'Modifier le Profil',
    save: 'Enregistrer',
    personal_information: 'Informations Personnelles',
    identification: 'Identification',
    travel_information: 'Informations de Voyage',
    full_name: 'Nom Complet',
    email: 'Email',
    phone: 'Téléphone',
    nationality: 'Nationalité',
    passport_number: 'Numéro de Passeport',
    verification_status: 'Statut de Vérification',
    verify_identity: 'Vérifier l\'Identité',
    current_location: 'Position Actuelle',
    travel_dates: 'Dates de Voyage',
    emergency_contact: 'Contact d\'Urgence',
    save_changes: 'Enregistrer les Modifications',
    
    // Settings Screen
    settings: 'Paramètres',
    customize_your_experience: 'Personnalisez votre expérience',
    language_accessibility: 'Langue et Accessibilité',
    language: 'Langue',
    font_size: 'Taille de Police',
    audio_feedback: 'Retour Audio',
    auto_translate: 'Traduction Automatique',
    notifications: 'Notifications',
    push_notifications: 'Notifications Push',
    emergency_alerts: 'Alertes d\'Urgence',
    privacy_security: 'Confidentialité et Sécurité',
    location_tracking: 'Suivi de Position',
    privacy_policy: 'Politique de Confidentialité',
    terms_of_service: 'Conditions d\'Utilisation',
    support: 'Support',
    help_center: 'Centre d\'Aide',
    contact_support: 'Contacter le Support',
    report_issue: 'Signaler un Problème',
    sign_out: 'Se Déconnecter',
  },
};

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
}

export default useTranslation;