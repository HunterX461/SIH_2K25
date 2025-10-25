import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

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

interface PlaceFormData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  category: string;
  image_url: string;
}

const CATEGORIES = ['monument', 'temple', 'heritage', 'park', 'museum', 'beach', 'fort', 'palace'];

export function PlacesAdminModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    category: 'monument',
    image_url: '',
  });

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlaces(undefined, user?.token);
      setPlaces(data);
    } catch (error) {
      console.error('Failed to fetch places:', error);
      Alert.alert('Error', 'Failed to load places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchPlaces();
    }
  }, [visible, user?.token, fetchPlaces]);

  const handleCreate = async () => {
    if (!formData.name || !formData.description || !formData.latitude || !formData.longitude) {
      Alert.alert('Validation Error', 'Please fill in all required fields (name, description, latitude, longitude)');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Validation Error', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }

    try {
      await apiService.createPlace(
        user?.token || '',
        formData.name,
        formData.description,
        lat,
        lon,
        formData.category,
        formData.image_url || undefined
      );
      Alert.alert('Success', 'Place created successfully');
      setShowForm(false);
      resetForm();
      fetchPlaces();
    } catch (error) {
      console.error('Failed to create place:', error);
      Alert.alert('Error', 'Failed to create place. Please try again.');
    }
  };

  const handleUpdate = async () => {
    if (!editingPlace) return;

    if (!formData.name || !formData.description || !formData.latitude || !formData.longitude) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      Alert.alert('Validation Error', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }

    try {
      await apiService.updatePlace(user?.token || '', editingPlace.id, {
        name: formData.name,
        description: formData.description,
        latitude: lat,
        longitude: lon,
        category: formData.category,
        image_url: formData.image_url || undefined,
      });
      Alert.alert('Success', 'Place updated successfully');
      setEditingPlace(null);
      setShowForm(false);
      resetForm();
      fetchPlaces();
    } catch (error) {
      console.error('Failed to update place:', error);
      Alert.alert('Error', 'Failed to update place. Please try again.');
    }
  };

  const handleDelete = async (place: Place) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${place.name}"? This will hide it from the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePlace(user?.token || '', place.id);
              Alert.alert('Success', 'Place deleted successfully');
              fetchPlaces();
            } catch (error) {
              console.error('Failed to delete place:', error);
              Alert.alert('Error', 'Failed to delete place. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      description: place.description,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      category: place.category,
      image_url: place.image_url || '',
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingPlace(null);
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      category: 'monument',
      image_url: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlace(null);
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Places</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading places...</Text>
          </View>
        ) : showForm ? (
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingPlace ? 'Edit Place' : 'Add New Place'}
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Taj Mahal"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe the place..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.text }]}>Latitude *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  placeholder="e.g., 27.1751"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.text }]}>Longitude *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  placeholder="e.g., 78.0421"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    formData.category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.text }]}>Image URL (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={formData.image_url}
              onChangeText={(text) => setFormData({ ...formData, image_url: text })}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingPlace ? handleUpdate : handleCreate}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{editingPlace ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.toolbar}>
              <Text style={[styles.toolbarText, { color: colors.textSecondary }]}>
                {places.length} places
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Place</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.placesList} showsVerticalScrollIndicator={false}>
              {places.map((place) => (
                <View key={place.id} style={[styles.placeItem, { backgroundColor: colors.card }]}>
                  <View style={styles.placeInfo}>
                    <Text style={[styles.placeName, { color: colors.text }]}>{place.name}</Text>
                    <Text style={[styles.placeCategory, { color: colors.textSecondary }]}>
                      {place.category}
                    </Text>
                    <Text style={[styles.placeCoords, { color: colors.textSecondary }]} numberOfLines={1}>
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.placeActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(place)}>
                      <Edit size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(place)}>
                      <Trash2 size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toolbarText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  placesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  placeCoords: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  placeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PlacesAdminModal;
