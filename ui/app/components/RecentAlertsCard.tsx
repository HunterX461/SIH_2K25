import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle, Clock } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';

export function RecentAlertsCard() {
  const { t } = useTranslation();

  const recentAlerts = [
    {
      id: '1',
      type: 'warning',
      message: 'High crime area detected nearby',
      timestamp: '2 hours ago',
      location: 'Downtown District',
    },
    {
      id: '2',
      type: 'info',
      message: 'Welcome to San Francisco Safe Zone',
      timestamp: '4 hours ago',
      location: 'Union Square',
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#DC2626';
      case 'info': return '#059669';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('recent_alerts')}</Text>
      
      {recentAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent alerts</Text>
        </View>
      ) : (
        <View style={styles.alertsList}>
          {recentAlerts.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.alertItem}>
              <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(alert.type)}15` }]}>
                <AlertTriangle size={16} color={getAlertColor(alert.type)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <View style={styles.alertMeta}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                  <Text style={styles.alertLocation}>• {alert.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
});