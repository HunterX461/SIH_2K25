import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal,
  Image 
} from 'react-native';
import { MapPin, Star, X, ExternalLink } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { useRouter } from 'expo-router';

interface Place {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export function MustVisitPlaces() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPlaces(undefined, user?.token);
      setPlaces(data);
    } catch (err) {
      console.error('Failed to fetch places:', err);
      setError('Failed to load places. Please try again later.');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handlePlacePress = (place: Place) => {
    setSelectedPlace(place);
    setModalVisible(true);
  };

  const handleShowOnMap = () => {
    if (selectedPlace) {
      setModalVisible(false);
      // Navigate to maps with place coordinates
      // We'll pass the place data via route params
      router.push({
        pathname: '/(tabs)/maps',
        params: {
          focusLat: selectedPlace.latitude.toString(),
          focusLon: selectedPlace.longitude.toString(),
          focusName: selectedPlace.name,
        }
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'monument': return '#DC2626';
      case 'temple': return '#7C3AED';
      case 'heritage': return '#F59E0B';
      case 'park': return '#059669';
      case 'museum': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    // All categories use MapPin for consistency
    return MapPin;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Star size={20} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>Must Visit Places</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#DC2626" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading places...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Star size={20} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>Must Visit Places</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPlaces} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (places.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Star size={20} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>Must Visit Places</Text>
        </View>
        
        {/* Horizontal Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.placesScroll}
          contentContainerStyle={styles.placesScrollContent}
        >
          {places.map((place) => {
            const categoryColor = getCategoryColor(place.category);
            const CategoryIcon = getCategoryIcon(place.category);
            
            return (
              <TouchableOpacity 
                key={place.id} 
                style={[styles.placeCard, { backgroundColor: colors.background }]}
                onPress={() => handlePlacePress(place)}
                activeOpacity={0.7}
              >
                {place.image_url ? (
                  <Image 
                    source={{ uri: place.image_url }} 
                    style={styles.placeImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: categoryColor + '20' }]}>
                    <CategoryIcon size={32} color={categoryColor} />
                  </View>
                )}
                
                <View style={styles.placeContent}>
                  <View style={styles.placeHeader}>
                    <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                      <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {place.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.placeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {place.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedPlace && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedPlace.image_url ? (
                  <Image 
                    source={{ uri: selectedPlace.image_url }} 
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[
                    styles.modalPlaceholderImage, 
                    { backgroundColor: getCategoryColor(selectedPlace.category) + '20' }
                  ]}>
                    <MapPin size={48} color={getCategoryColor(selectedPlace.category)} />
                  </View>
                )}

                <View style={styles.modalBody}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedPlace.name}
                  </Text>
                  
                  <View style={[
                    styles.modalCategoryBadge, 
                    { backgroundColor: getCategoryColor(selectedPlace.category) + '20' }
                  ]}>
                    <Text style={[
                      styles.modalCategoryText, 
                      { color: getCategoryColor(selectedPlace.category) }
                    ]}>
                      {selectedPlace.category.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                    {selectedPlace.description}
                  </Text>

                  <View style={styles.locationInfo}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                      {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.showOnMapButton}
                    onPress={handleShowOnMap}
                  >
                    <ExternalLink size={20} color="#FFFFFF" />
                    <Text style={styles.showOnMapButtonText}>Show on Map</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  placesScroll: {
    flexDirection: 'row',
  },
  placesScrollContent: {
    paddingRight: 20,
  },
  placeCard: {
    width: 240,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  placeImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeContent: {
    padding: 12,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  placeDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E7EB',
  },
  modalPlaceholderImage: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  modalCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  showOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  showOnMapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MustVisitPlaces;
