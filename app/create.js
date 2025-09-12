/**
 * Create Wheel Screen
 * Purpose: Create new decision wheels with options
 * Extend: Add templates, bulk import, AI suggestions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const DEFAULT_COLORS = [
  '#FF9E80', '#FFCC80', '#FFF176', '#AED581', '#80CBC4',
  '#81D4FA', '#90CAF9', '#CE93D8', '#F48FB1', '#FFAB91',
  '#FF3B30', '#FF6D00', '#FFD600', '#00C853', '#00BFA5',
  '#00B0FF', '#2979FF', '#651FFF', '#D500F9', '#FF4081',
  '#00ACC1', '#0097A7', '#00838F', '#1976D2', '#1565C0',
  '#283593', '#512DA8', '#3949AB', '#455A64', '#263238',
];

const PRESET_WHEELS = [
  {
    name: 'What to Eat?',
    options: [
      { label: 'Pizza', color: '#FF9E80', weight: 50, enabled: true },
      { label: 'Sushi', color: '#FFCC80', weight: 50, enabled: true },
      { label: 'Burger', color: '#FFF176', weight: 50, enabled: true },
      { label: 'Pasta', color: '#AED581', weight: 50, enabled: true },
      { label: 'Tacos', color: '#80CBC4', weight: 50, enabled: true },
    ]
  },
  {
    name: '100 Challenge',
    options: Array.from({ length: 100 }, (_, i) => ({
      label: (i + 1).toString(),
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      weight: 50,
      enabled: true,
    }))
  },
  {
    name: 'Truth or Dare',
    options: [
      { label: 'Truth', color: '#81D4FA', weight: 50, enabled: true },
      { label: 'Dare', color: '#FF3B30', weight: 50, enabled: true },
    ]
  },
  {
    name: 'Yes or No',
    options: [
      { label: 'Yes', color: '#00C853', weight: 50, enabled: true },
      { label: 'No', color: '#FF3B30', weight: 50, enabled: true },
    ]
  },
  {
    name: 'Board Games',
    options: [
      { label: 'Monopoly', color: '#FF9E80', weight: 50, enabled: true },
      { label: 'Scrabble', color: '#FFCC80', weight: 50, enabled: true },
      { label: 'Chess', color: '#FFF176', weight: 50, enabled: true },
      { label: 'Risk', color: '#AED581', weight: 50, enabled: true },
      { label: 'Clue', color: '#80CBC4', weight: 50, enabled: true },
      { label: 'Checkers', color: '#81D4FA', weight: 50, enabled: true },
    ]
  },
];

export default function CreateWheelScreen() {
  const { addWheel } = useApp();
  const [wheelName, setWheelName] = useState('');
  const [options, setOptions] = useState([
    { id: '1', label: '', color: DEFAULT_COLORS[0], weight: 50, enabled: true },
    { id: '2', label: '', color: DEFAULT_COLORS[1], weight: 50, enabled: true },
  ]);
  const [showPresets, setShowPresets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length >= 20) {
      Alert.alert('Maximum Options', 'You can add up to 20 options per wheel.');
      return;
    }

    const newOption = {
      id: Date.now().toString(),
      label: '',
      color: DEFAULT_COLORS[options.length % DEFAULT_COLORS.length],
      weight: 50,
      enabled: true,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id) => {
    if (options.length <= 2) {
      Alert.alert('Minimum Options', 'A wheel must have at least 2 options.');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const updateOption = (id, field, value) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const loadPreset = (preset) => {
    setWheelName(preset.name);
    setOptions(preset.options.map((opt, index) => ({
      ...opt,
      id: (index + 1).toString(),
    })));
    setShowPresets(false);
  };

  const validateWheel = () => {
    if (!wheelName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your wheel.');
      return false;
    }

    const enabledOptions = options.filter(opt => opt.enabled && opt.label.trim());
    if (enabledOptions.length < 2) {
      Alert.alert('Insufficient Options', 'Please add at least 2 enabled options with labels.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateWheel()) return;

    setIsSubmitting(true);

    // Filter and clean options
    const validOptions = options
      .filter(opt => opt.label.trim())
      .map(opt => ({
        ...opt,
        label: opt.label.trim(),
      }));

    const newWheel = {
      id: Date.now().toString(),
      name: wheelName.trim(),
      options: validOptions,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      addWheel(newWheel);
      Alert.alert(
        'Success',
        'Wheel created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create wheel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderColorPicker = (selectedColor, onColorChange) => (
    <View style={styles.colorPicker}>
      {DEFAULT_COLORS.map(color => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.colorOptionSelected
          ]}
          onPress={() => onColorChange(color)}
        />
      ))}
    </View>
  );

  const renderPresetModal = () => (
    showPresets && (
      <View style={styles.presetOverlay}>
        <View style={styles.presetModal}>
          <View style={styles.presetHeader}>
            <Text style={styles.presetTitle}>Choose a Preset</Text>
            <TouchableOpacity onPress={() => setShowPresets(false)}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.presetList}>
            {PRESET_WHEELS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.presetItem}
                onPress={() => loadPreset(preset)}
              >
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetDescription}>
                  {preset.options.length} options
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Wheel',
          headerShown: true,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowPresets(true)}
              style={styles.presetButton}
            >
              <FontAwesome5 name="magic" size={16} color="#007AFF" />
              <Text style={styles.presetButtonText}>Presets</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wheel Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter wheel name..."
            value={wheelName}
            onChangeText={setWheelName}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Options</Text>
            <TouchableOpacity style={styles.addButton} onPress={addOption}>
              <FontAwesome5 name="plus" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {options.map((option, index) => (
            <View key={option.id} style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionNumber}>#{index + 1}</Text>
                {options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => removeOption(option.id)}
                    style={styles.removeButton}
                  >
                    <FontAwesome5 name="trash" size={14} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.optionInput}
                placeholder={`Option ${index + 1}`}
                value={option.label}
                onChangeText={(text) => updateOption(option.id, 'label', text)}
                maxLength={30}
              />

              <View style={styles.optionControls}>
                <View style={styles.colorSection}>
                  <Text style={styles.controlLabel}>Color</Text>
                  {renderColorPicker(option.color, (color) => 
                    updateOption(option.id, 'color', color)
                  )}
                </View>

                <View style={styles.weightSection}>
                  <Text style={styles.controlLabel}>Weight: {option.weight}</Text>
                  <View style={styles.weightSlider}>
                    <TouchableOpacity
                      onPress={() => updateOption(option.id, 'weight', Math.max(1, option.weight - 10))}
                      style={styles.weightButton}
                    >
                      <FontAwesome5 name="minus" size={12} color="#007AFF" />
                    </TouchableOpacity>
                    <View style={styles.weightBar}>
                      <View style={[styles.weightFill, { width: `${option.weight}%` }]} />
                    </View>
                    <TouchableOpacity
                      onPress={() => updateOption(option.id, 'weight', Math.min(100, option.weight + 10))}
                      style={styles.weightButton}
                    >
                      <FontAwesome5 name="plus" size={12} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.enabledSection}>
                  <Text style={styles.controlLabel}>Enabled</Text>
                  <Switch
                    value={option.enabled}
                    onValueChange={(enabled) => updateOption(option.id, 'enabled', enabled)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <FontAwesome5 
              name={isSubmitting ? "spinner" : "check"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Wheel'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPresetModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  presetButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  nameInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  optionInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  optionControls: {
    gap: 16,
  },
  colorSection: {},
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  colorOptionSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  weightSection: {},
  weightSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  enabledSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  presetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  presetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  presetList: {
    maxHeight: 400,
  },
  presetItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  presetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 14,
    color: '#666',
  },
});