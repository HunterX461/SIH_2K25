import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Globe, Bell, Shield, CircleHelp as HelpCircle, LogOut, Moon, Sun, MapPin } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { SettingsSection } from '../components/SettingsSection';
import { PlacesAdminModal } from '../components/PlacesAdminModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [showPlacesAdmin, setShowPlacesAdmin] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    emergencyAlerts: true,
    audioFeedback: false,
    autoTranslate: true,
    fontSize: 'medium',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = () => {
    const languages = ['en', 'es', 'fr'];
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[nextIndex]);
  };

  const handleFontSizeChange = () => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    handleSettingChange('fontSize', sizes[nextIndex]);
  };

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out?')
      : true;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive', 
            onPress: async () => {
              await logout();
              router.replace('/login');
            }
          }
        ]
      );
    } else if (confirmed) {
      await logout();
      router.replace('/login');
    }
  };

  const getLanguageName = (lang: string) => {
    const names: { [key: string]: string } = { en: 'English', es: 'Español', fr: 'Français' };
    return names[lang] || lang;
  };

  const getFontSizeLabel = (size: string) => {
    const labels: { [key: string]: string } = { small: 'Small', medium: 'Medium', large: 'Large' };
    return labels[size] || size;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('customize_your_experience')}</Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Theme */}
          <SettingsSection title="Appearance" icon={theme === 'dark' ? Moon : Sun}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </SettingsSection>

          {/* Language & Accessibility */}
          <SettingsSection title={t('language_accessibility')} icon={Globe}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('language')}</Text>
              <TouchableOpacity style={styles.valueButton} onPress={handleLanguageChange}>
                <Text style={styles.valueText}>{getLanguageName(currentLanguage)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('font_size')}</Text>
              <TouchableOpacity style={styles.valueButton} onPress={handleFontSizeChange}>
                <Text style={styles.valueText}>{getFontSizeLabel(settings.fontSize)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('audio_feedback')}</Text>
              <Switch
                value={settings.audioFeedback}
                onValueChange={(value) => handleSettingChange('audioFeedback', value)}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('auto_translate')}</Text>
              <Switch
                value={settings.autoTranslate}
                onValueChange={(value) => handleSettingChange('autoTranslate', value)}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title={t('notifications')} icon={Bell}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('push_notifications')}</Text>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('emergency_alerts')}</Text>
              <Switch
                value={settings.emergencyAlerts}
                onValueChange={(value) => handleSettingChange('emergencyAlerts', value)}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </SettingsSection>

          {/* Privacy & Security */}
          <SettingsSection title={t('privacy_security')} icon={Shield}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('location_tracking')}</Text>
              <Switch
                value={settings.locationTracking}
                onValueChange={(value) => handleSettingChange('locationTracking', value)}
                trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>{t('privacy_policy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>{t('terms_of_service')}</Text>
            </TouchableOpacity>
          </SettingsSection>

          {/* Support */}
          <SettingsSection title={t('support')} icon={HelpCircle}>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>{t('help_center')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>{t('contact_support')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>{t('report_issue')}</Text>
            </TouchableOpacity>
          </SettingsSection>

          {/* Admin Section */}
          <SettingsSection title="Admin Tools" icon={MapPin}>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => setShowPlacesAdmin(true)}
            >
              <Text style={styles.linkText}>Manage Must-Visit Places</Text>
            </TouchableOpacity>
          </SettingsSection>

          {/* Account */}
          <View style={styles.accountSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#DC2626" />
              <Text style={styles.logoutText}>{t('sign_out')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <PlacesAdminModal 
        visible={showPlacesAdmin}
        onClose={() => setShowPlacesAdmin(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  settingsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  valueButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  valueText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  linkItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    fontSize: 16,
    color: '#DC2626',
  },
  accountSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});