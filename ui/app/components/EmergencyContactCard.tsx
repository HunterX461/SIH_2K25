import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Phone, MessageSquare, User } from 'lucide-react-native';
import * as Linking from 'expo-linking';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

interface EmergencyContactCardProps {
  contact: EmergencyContact;
}

export function EmergencyContactCard({ contact }: EmergencyContactCardProps) {
  const handleCall = async () => {
    const phoneUrl = `tel:${contact.phone}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
    if (canOpen) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Error', 'Unable to make phone call');
    }
  };

  const handleMessage = async () => {
    const smsUrl = Platform.OS === 'ios' 
      ? `sms:${contact.phone}&body=This is an emergency. I need help. Please respond immediately.`
      : `sms:${contact.phone}?body=This is an emergency. I need help. Please respond immediately.`;
    
    const canOpen = await Linking.canOpenURL(smsUrl);
    
    if (canOpen) {
      Linking.openURL(smsUrl);
    } else {
      Alert.alert('Error', 'Unable to send message');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <User size={20} color="#6B7280" />
        </View>
        <View style={styles.details}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{contact.name}</Text>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.relationship}>{contact.relationship}</Text>
          <Text style={styles.phone}>{contact.phone}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Phone size={20} color="#059669" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
          <MessageSquare size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  relationship: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});