/**
 * Edit Wheel Bottom Sheet
 * Purpose: In-place wheel editing with comprehensive options
 * Features: Emoji picker, color selection, weight adjustment, batch operations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  Switch,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const BOTTOM_SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.9;

const DEFAULT_COLORS = [
  '#FF9E80', '#FFCC80', '#FFF176', '#AED581', '#80CBC4',
  '#81D4FA', '#90CAF9', '#CE93D8', '#F48FB1', '#FFAB91',
  '#FF3B30', '#FF6D00', '#FFD600', '#00C853', '#00BFA5',
  '#00B0FF', '#2979FF', '#651FFF', '#D500F9', '#FF4081',
  '#00ACC1', '#0097A7', '#00838F', '#1976D2', '#1565C0',
  '#283593', '#512DA8', '#3949AB', '#455A64', '#263238',
];

const EMOJI_OPTIONS = ['🤔', '🍕', '🎯', '🎲', '🎭', '🎮', '🏆', '⭐', '🔥', '💡', '🎪', '🎨'];

export default function EditWheelBottomSheet({ 
  visible, 
  onClose, 
  wheelId, 
  onSave 
}) {
  const { wheels, updateWheel, addWheel, settings } = useApp();
  const [wheel, setWheel] = useState(null);
  const [wheelName, setWheelName] = useState('');
  const [wheelEmoji, setWheelEmoji] = useState('🤔');
  const [options, setOptions] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showWeightAdjuster, setShowWeightAdjuster] = useState(null);
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showEmojiInput, setShowEmojiInput] = useState(false);
  const emojiInputRef = useRef(null);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && wheelId && wheelId !== 'new') {
      const foundWheel = wheels.find(w => w.id === wheelId);
      if (foundWheel) {
        setWheel(foundWheel);
        setWheelName(foundWheel.name);
        setWheelEmoji(foundWheel.emoji || '🤔');
        setOptions([...foundWheel.options]);
        setHasChanges(false);
        showBottomSheet();
      }
    } else if (visible && wheelId === 'new') {
      // Create new wheel
      const newWheel = {
        id: 'new',
        name: '',
        emoji: '🤔',
        options: [
          { id: '1', label: '', color: DEFAULT_COLORS[0], weight: 50, enabled: true },
          { id: '2', label: '', color: DEFAULT_COLORS[1], weight: 50, enabled: true },
        ],
      };
      setWheel(newWheel);
      setWheelName('');
      setWheelEmoji('🤔');
      setOptions(newWheel.options);
      setHasChanges(false);
      showBottomSheet();
    } else if (!visible) {
      hideBottomSheet();
    }
  }, [visible, wheelId, wheels]);

  const showBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.4,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset state after animation
      setShowEmojiInput(false);
      setShowColorPicker(null);
      setShowWeightAdjuster(null);
      setShowBatchAdd(false);
      setBatchText('');
    });
  };

  const handleEmojiPress = () => {
    setShowEmojiInput(true);
    setTimeout(() => {
      if (emojiInputRef.current) {
        emojiInputRef.current.focus();
      }
    }, 100);
  };

  const handleEmojiChange = (text) => {
    // Extract first emoji from input
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex);
    if (emojis && emojis.length > 0) {
      setWheelEmoji(emojis[0]);
      setHasChanges(true);
      setShowEmojiInput(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (!wheelName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your wheel.');
      return;
    }

    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      Alert.alert('Insufficient Options', 'Please add at least 2 options with labels.');
      return;
    }

    let savedWheel;

    if (wheelId === 'new') {
      // Create new wheel
      savedWheel = {
        id: Date.now().toString(),
        name: wheelName.trim(),
        emoji: wheelEmoji,
        pinned: false,
        options: validOptions.map(opt => ({
          ...opt,
          label: opt.label.trim(),
        })),
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addWheel(savedWheel);
    } else {
      // Update existing wheel
      savedWheel = {
        ...wheel,
        name: wheelName.trim(),
        emoji: wheelEmoji,
        options: validOptions.map(opt => ({
          ...opt,
          label: opt.label.trim(),
        })),
        updatedAt: new Date().toISOString(),
      };
      updateWheel(savedWheel);
    }

    if (onSave) onSave(savedWheel);
    setHasChanges(false);
    
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onClose();
  };

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      label: '',
      color: DEFAULT_COLORS[options.length % DEFAULT_COLORS.length],
      weight: 50,
      enabled: true,
    };
    setOptions([...options, newOption]);
    setHasChanges(true);
  };

  const removeOption = (optionId) => {
    if (options.length <= 2) {
      Alert.alert('Minimum Options', 'A wheel must have at least 2 options.');
      return;
    }

    Alert.alert(
      'Delete Option',
      'Are you sure you want to delete this option?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setOptions(options.filter(opt => opt.id !== optionId));
          setHasChanges(true);
          if (settings.hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }},
      ]
    );
  };

  const updateOption = (optionId, field, value) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, [field]: value } : opt
    ));
    setHasChanges(true);
  };

  const handleBatchAdd = () => {
    if (!batchText.trim()) return;

    const newOptions = batchText
      .split(/[\n,]/)
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .filter((text, index, arr) => arr.indexOf(text) === index) // Remove duplicates
      .map((text, index) => ({
        id: (Date.now() + index).toString(),
        label: text,
        color: DEFAULT_COLORS[(options.length + index) % DEFAULT_COLORS.length],
        weight: 50,
        enabled: true,
      }));

    setOptions([...options, ...newOptions]);
    setBatchText('');
    setShowBatchAdd(false);
    setHasChanges(true);
  };

  const handleShare = async () => {
    const shareData = {
      name: wheelName,
      emoji: wheelEmoji,
      options: options.filter(opt => opt.label.trim()),
    };

    const shareText = `${wheelEmoji} ${wheelName}\n\nOptions:\n${shareData.options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n')}\n\nCreated with MiniDecider`;

    try {
      await Share.share({
        message: shareText,
        title: wheelName,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share wheel.');
    }
  };

  const handleMoreActions = () => {
    Alert.alert(
      'More Actions',
      'Choose an action',
      [
        { text: 'Duplicate Wheel', onPress: () => Alert.alert('Coming Soon', 'Duplicate functionality will be available soon.') },
        { text: 'Reset Colors', onPress: () => {
          setOptions(options.map((opt, index) => ({
            ...opt,
            color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
          })));
          setHasChanges(true);
        }},
        { text: 'Equalize Weights', onPress: () => {
          setOptions(options.map(opt => ({ ...opt, weight: 50 })));
          setHasChanges(true);
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getWeightPercentage = (weight) => {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    return totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
  };

  if (!visible || !wheel) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY }] }
        ]}
      >
        <SafeAreaView style={styles.sheetContainer}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Question Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUESTION</Text>
              <View style={styles.questionRow}>
                <TouchableOpacity 
                  style={styles.emojiButton}
                  onPress={handleEmojiPress}
                >
                  <Text style={styles.emoji}>{wheelEmoji}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.questionInput}
                  value={wheelName}
                  onChangeText={(text) => {
                    setWheelName(text);
                    setHasChanges(true);
                  }}
                  placeholder="Enter wheel name..."
                  maxLength={50}
                />
              </View>
              
              {/* Hidden emoji input for system keyboard */}
              {showEmojiInput && (
                <TextInput
                  ref={emojiInputRef}
                  style={styles.hiddenEmojiInput}
                  value=""
                  onChangeText={handleEmojiChange}
                  onBlur={() => setShowEmojiInput(false)}
                  autoFocus
                  placeholder="Select emoji..."
                />
              )}
            </View>

            {/* Options Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OPTIONS</Text>
              {options.map((option, index) => (
                <View key={option.id} style={styles.optionRow}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeOption(option.id)}
                  >
                    <FontAwesome5 name="minus" size={16} color="white" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.optionInput}
                    value={option.label}
                    onChangeText={(text) => updateOption(option.id, 'label', text)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={30}
                  />

                  <View style={styles.optionControls}>
                    <TouchableOpacity
                      style={[styles.colorDot, { backgroundColor: option.color }]}
                      onPress={() => setShowColorPicker(option.id)}
                    />
                    <TouchableOpacity
                      style={styles.weightChip}
                      onPress={() => setShowWeightAdjuster(option.id)}
                    >
                      <Text style={styles.weightText}>
                        {getWeightPercentage(option.weight)}% Weight
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add Options */}
              <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                <FontAwesome5 name="plus" size={16} color="#007AFF" />
                <Text style={styles.addOptionText}>Add New Option</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.batchAddButton} 
                onPress={() => setShowBatchAdd(true)}
              >
                <FontAwesome5 name="list" size={16} color="#007AFF" />
                <Text style={styles.batchAddText}>Add Multiple Options</Text>
                <FontAwesome5 name="chevron-right" size={14} color="#999" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Toolbar */}
          <View style={styles.bottomToolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleMoreActions}>
              <FontAwesome5 name="ellipsis-h" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.optionCount}>
              {options.filter(opt => opt.label.trim()).length} options
            </Text>
            
            <TouchableOpacity style={styles.toolbarButton} onPress={handleShare}>
              <FontAwesome5 name="share" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.colorPickerModal}>
              <Text style={styles.colorPickerTitle}>Choose Color</Text>
              <View style={styles.colorGrid}>
                {DEFAULT_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      options.find(opt => opt.id === showColorPicker)?.color === color && styles.colorOptionSelected
                    ]}
                    onPress={() => {
                      updateOption(showColorPicker, 'color', color);
                      setShowColorPicker(null);
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Weight Adjuster Modal */}
      {showWeightAdjuster && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.weightModal}>
              <Text style={styles.weightModalTitle}>Adjust Weight</Text>
              <View style={styles.weightControls}>
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => {
                    const option = options.find(opt => opt.id === showWeightAdjuster);
                    if (option && option.weight > 1) {
                      updateOption(showWeightAdjuster, 'weight', option.weight - 10);
                    }
                  }}
                >
                  <FontAwesome5 name="minus" size={16} color="#007AFF" />
                </TouchableOpacity>
                
                <View style={styles.weightDisplay}>
                  <Text style={styles.weightValue}>
                    {options.find(opt => opt.id === showWeightAdjuster)?.weight || 50}
                  </Text>
                  <Text style={styles.weightPercentage}>
                    {getWeightPercentage(options.find(opt => opt.id === showWeightAdjuster)?.weight || 50)}%
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={() => {
                    const option = options.find(opt => opt.id === showWeightAdjuster);
                    if (option && option.weight < 100) {
                      updateOption(showWeightAdjuster, 'weight', option.weight + 10);
                    }
                  }}
                >
                  <FontAwesome5 name="plus" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.weightDoneButton}
                onPress={() => setShowWeightAdjuster(null)}
              >
                <Text style={styles.weightDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Batch Add Modal */}
      {showBatchAdd && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.batchModal}>
              <View style={styles.batchHeader}>
                <TouchableOpacity onPress={() => setShowBatchAdd(false)}>
                  <Text style={styles.batchCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.batchTitle}>Add Multiple Options</Text>
                <TouchableOpacity onPress={handleBatchAdd}>
                  <Text style={styles.batchAddText}>Add</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.batchInstructions}>
                Enter options separated by new lines or commas. Duplicates will be removed automatically.
              </Text>
              <TextInput
                style={styles.batchTextInput}
                value={batchText}
                onChangeText={setBatchText}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  questionInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  hiddenEmojiInput: {
    position: 'absolute',
    left: -1000,
    opacity: 0,
    height: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 15,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#1A1A1A',
  },
  optionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  weightChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  addOptionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  batchAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  batchAddText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCount: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  colorOptionSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  weightModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  weightModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  weightButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  weightPercentage: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  weightDoneButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  weightDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  batchModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  batchCancelText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  batchAddText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  batchInstructions: {
    fontSize: 14,
    color: '#8E8E93',
    padding: 20,
    paddingTop: 10,
    lineHeight: 20,
  },
  batchTextInput: {
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
  },
});