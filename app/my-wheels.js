/**
 * My Wheels Screen
 * Purpose: Browse, create, and manage decision wheels
 * Features: Default wheel management, templates, search, sorting
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActionSheetIOS,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import EditWheelBottomSheet from '../components/EditWheelBottomSheet';

export default function MyWheelsScreen() {
  const { 
    wheels, 
    deleteWheel, 
    updateWheel, 
    addWheel, 
    settings, 
    currentWheelId, 
    setCurrentWheel 
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [filteredWheels, setFilteredWheels] = useState([]);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editingWheelId, setEditingWheelId] = useState(null);

  // Filter and sort wheels with pinning logic
  useEffect(() => {
    let filtered = wheels;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = wheels.filter(wheel => 
        wheel.name.toLowerCase().includes(query) ||
        wheel.options.some(option => 
          option.label.toLowerCase().includes(query)
        )
      );
    } else {
      // Sort all wheels
      filtered.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
        return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
      });
    }

    setFilteredWheels(filtered);
  }, [wheels, searchQuery, sortOrder]);

  const handleCreateNewWheel = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingWheelId('new');
    setShowEditSheet(true);
  };

  const handleWheelPress = (wheel) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Set as current wheel and navigate to main spin tab
    setCurrentWheel(wheel.id);
    router.navigate('/(tabs)');
  };

  const handleMoreActions = (wheel) => {
    const options = [
      'Rename',
      'Duplicate',
      'Delete',
      'Cancel'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 2,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            // Rename - TODO: Implement rename modal
            Alert.alert('Coming Soon', 'Rename functionality will be available soon.');
          } else if (buttonIndex === 1) {
            // Duplicate
            handleDuplicate(wheel);
          } else if (buttonIndex === 2) {
            // Delete
            handleDelete(wheel);
          }
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        'Wheel Actions',
        'Choose an action',
        [
          { text: 'Rename', onPress: () => Alert.alert('Coming Soon', 'Rename functionality will be available soon.') },
          { text: 'Duplicate', onPress: () => handleDuplicate(wheel) },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: () => {
              handleDelete(wheel);
            }
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleShare = async (wheel) => {
    const shareText = `Check out my "${wheel.name}" decision wheel!\n\nOptions: ${wheel.options.map(opt => opt.label).join(', ')}`;
    
    try {
      await Share.share({
        message: shareText,
        title: wheel.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share wheel.');
    }
  };

  const handleEdit = (wheel) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingWheelId(wheel.id);
    setShowEditSheet(true);
  };

  const handleDuplicate = (wheel) => {
    const duplicatedWheel = {
      ...wheel,
      id: Date.now().toString(),
      name: `${wheel.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addWheel(duplicatedWheel);
    Alert.alert('Success', 'Wheel duplicated successfully!');
  };

  const handleDelete = (wheel) => {
    Alert.alert(
      'Delete Wheel',
      `Are you sure you want to delete "${wheel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deleteWheel(wheel.id);
        }},
      ]
    );
  };

  const handleCreateWheel = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingWheelId('new');
    setShowEditSheet(true);
  };

  const handleCreateFromTemplate = (template) => {
    const newWheel = {
      ...template,
      id: Date.now().toString(),
      isTemplate: false,
      pinned: false,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addWheel(newWheel);
    
    // Set as current wheel and navigate to main spin tab
    setCurrentWheel(newWheel.id);
    router.navigate('/(tabs)');
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderWheelCard = ({ item: wheel }) => {
    const isSelected = wheel.id === currentWheelId;

    return (
      <TouchableOpacity
        style={[
          styles.wheelCard,
          isSelected && styles.wheelCardSelected,
        ]}
        onPress={() => handleWheelPress(wheel)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={styles.wheelEmoji}>{wheel.emoji || '🎯'}</Text>
            <View style={styles.wheelInfo}>
              <Text style={styles.wheelName}>{wheel.name}</Text>
              <Text style={styles.wheelSubtitle}>
                {wheel.options.filter(opt => opt.enabled).length} options
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMoreActions(wheel);
              }}
            >
              <FontAwesome5 name="ellipsis-h" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleShare(wheel);
              }}
            >
              <FontAwesome5 name="share" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleEdit(wheel);
              }}
            >
              <FontAwesome5 name="edit" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="search" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No wheels found</Text>
      <Text style={styles.emptyDescription}>
        Try adjusting your search or create a new wheel
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateWheel}>
        <Text style={styles.createButtonText}>Create Wheel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTemplateSection = () => (
    <View style={styles.templateSection}>
      <Text style={styles.templateTitle}>Templates</Text>
      {TEMPLATE_WHEELS.map((template) => (
        <TouchableOpacity
          key={template.id}
          style={styles.templateCard}
          onPress={() => handleCreateFromTemplate(template)}
        >
          <Text style={styles.templateEmoji}>{template.emoji}</Text>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateSubtitle}>
              {template.options.length} options
            </Text>
          </View>
          <FontAwesome5 name="plus" size={16} color="#007AFF" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'My Wheels',
          headerShown: true,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome5 name="chevron-left" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.sortButton}
              onPress={toggleSort}
            >
              <FontAwesome5 
                name={sortOrder === 'desc' ? 'sort-amount-down' : 'sort-amount-up'} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          ),
        }}
      />

      <EditWheelBottomSheet
        visible={showEditSheet}
        onClose={() => {
          setShowEditSheet(false);
          setEditingWheelId(null);
        }}
        wheelId={editingWheelId}
        onSave={() => {
          // Refresh filtered wheels after save
          // The context will handle the update automatically
        }}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Wheels"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome5 name="times-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredWheels.length > 0 ? (
        <FlatList
          data={filteredWheels}
          renderItem={renderWheelCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.wheelList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={null}
        />
      ) : (
        renderEmptyState()
      )}

      {filteredWheels.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateNewWheel}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
  },
  sortButton: {
    padding: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  wheelList: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for FAB
  },
  wheelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wheelCardSelected: {
    borderColor: '#007AFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wheelEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  wheelInfo: {
    flex: 1,
  },
  wheelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  wheelSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  templateEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});