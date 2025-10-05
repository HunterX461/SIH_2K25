import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';

const API_URL = process.env.EXPO_PUBLIC_API_BASE || 'http://10.232.121.138:8000';

interface Tourist {
  id: number;
  name: string;
}

export default function MapsWebScreen() {
  const { t } = useTranslation();
  const [touristCount, setTouristCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchAllTourists = async () => {
      try {
        const response = await fetch(`${API_URL}/tourists`);
        if (!response.ok) return;
        const data: Tourist[] = await response.json();
        if (isMounted) {
          setTouristCount(data.length);
        }
      } catch (error) {
        console.error("Failed to fetch tourists:", error);
      }
    };
    
    fetchAllTourists();
    const interval = setInterval(fetchAllTourists, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.webMapPlaceholder}>
        <MapPin size={64} color="#DC2626" />
        <Text style={styles.placeholderTitle}>Live Tourist Dashboard</Text>
        <Text style={styles.placeholderText}>
          Currently tracking <Text style={{fontWeight: 'bold'}}>{touristCount}</Text> active tourists.
        </Text>
        <Text style={styles.placeholderSubtext}>
          Interactive maps with real-time locations and safety zones are available on mobile devices.
        </Text>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('map_legend')}</Text>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'blue' }]} /><Text style={styles.legendText}>Other Tourists</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>{t('safe_zones')}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>{t('danger_zones')}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    webMapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, backgroundColor: '#F9FAFB' },
    placeholderTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 20, marginBottom: 16, textAlign: 'center' },
    placeholderText: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 12, lineHeight: 24 },
    placeholderSubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
    legend: { position: 'absolute', top: 60, left: 16, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    legendTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    legendText: { fontSize: 14, color: '#6B7280' },
});