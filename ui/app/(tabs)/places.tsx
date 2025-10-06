import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Star, Heart } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { mustVisitPlaces } from '../data/sampleData';

export default function PlacesScreen() {
  const { t } = useTranslation();

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= Math.floor(rating) ? '#FBBF24' : '#D1D5DB'}
            fill={star <= Math.floor(rating) ? '#FBBF24' : 'transparent'}
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Must-Visit Places</Text>
        <Text style={styles.subtitle}>
          Popular tourist attractions in Mumbai - safe zones with high ratings
        </Text>
      </View>

      {/* Places List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mustVisitPlaces.map((place) => (
          <View key={place.id} style={styles.placeCard}>
            {/* Header Row */}
            <View style={styles.placeHeader}>
              <View style={styles.placeHeaderLeft}>
                <Text style={styles.placeName}>{place.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{place.category}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <Heart size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {/* Rating */}
            {renderStars(place.rating)}

            {/* Description */}
            <Text style={styles.description}>{place.description}</Text>

            {/* Location */}
            <View style={styles.locationRow}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </Text>
            </View>

            {/* Highlights */}
            <View style={styles.highlightsContainer}>
              {place.highlights.slice(0, 3).map((highlight, index) => (
                <View key={index} style={styles.highlightChip}>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton}>
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>View on Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Add to Itinerary</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeHeaderLeft: {
    flex: 1,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  favoriteButton: {
    padding: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  highlightChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 11,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
