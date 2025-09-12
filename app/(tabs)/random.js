/**
 * Random Number Generator Screen  
 * Purpose: Generate random numbers with configurable ranges
 * Extend: Add number history, export results, custom algorithms
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../../contexts/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;
export default function RandomNumberScreen() {
  const { settings, rngConfig, updateRngConfig } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [currentResult, setCurrentResult] = useState(rngConfig.lastResults || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempConfig, setTempConfig] = useState(rngConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const generateNumbers = async () => {
    if (rngConfig.count > (rngConfig.max - rngConfig.min + 1) && !rngConfig.allowDuplicates) {
      Alert.alert(
        'Invalid Configuration',
        'Count cannot be greater than the range when duplicates are not allowed.'
      );
      return;
    }

    setIsGenerating(true);
    
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Simulate generation delay for better UX
    setTimeout(() => {
      const results = [];
      const usedNumbers = new Set();

      for (let i = 0; i < rngConfig.count; i++) {
        let randomNum;
        let attempts = 0;
        
        do {
          randomNum = Math.floor(Math.random() * (rngConfig.max - rngConfig.min + 1)) + rngConfig.min;
          attempts++;
          
          // Prevent infinite loop
          if (attempts > 1000) break;
        } while (!rngConfig.allowDuplicates && usedNumbers.has(randomNum));

        results.push(randomNum);
        usedNumbers.add(randomNum);
      }

      setCurrentResult(results);
      updateRngConfig({ ...rngConfig, lastResults: results });
      setIsGenerating(false);

      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 800);
  };

  const handleOpenSettings = () => {
    setTempConfig({ ...rngConfig });
    setHasChanges(false);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setShowSettings(false);
            setHasChanges(false);
          }},
        ]
      );
    } else {
      setShowSettings(false);
    }
  };

  const validateAndSaveSettings = () => {
    let finalConfig = { ...tempConfig };

    // Validate and auto-fix min/max
    if (finalConfig.min > finalConfig.max) {
      const temp = finalConfig.min;
      finalConfig.min = finalConfig.max;
      finalConfig.max = temp;
      Alert.alert('Swapped min/max', 'Minimum and maximum values have been swapped.');
    }

    // Validate count
    if (finalConfig.count <= 0) {
      Alert.alert('Invalid Count', 'Count must be greater than 0.');
      return;
    }

    if (finalConfig.count > 20) {
      finalConfig.count = 20;
      Alert.alert('Count Limited', 'Count has been limited to 20.');
    }

    // Validate duplicates constraint
    const maxUnique = finalConfig.max - finalConfig.min + 1;
    if (!finalConfig.allowDuplicates && finalConfig.count > maxUnique) {
      Alert.alert(
        'Count Exceeds Unique Values',
        `Count cannot exceed ${maxUnique} when duplicates are not allowed.`
      );
      return;
    }

    updateRngConfig(finalConfig);
    setShowSettings(false);
    setHasChanges(false);

    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const copyToClipboard = async () => {
    if (!currentResult || currentResult.length === 0) {
      Alert.alert('Nothing to copy', 'Generate some numbers first.');
      return;
    }

    const resultText = currentResult.join(', ');
    try {
      await Clipboard.setStringAsync(resultText);
      Alert.alert('Copied!', `Copied ${currentResult.length} result${currentResult.length > 1 ? 's' : ''}`);
      
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const updateTempConfig = (field, value) => {
    setTempConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const isValidConfig = () => {
    if (tempConfig.count <= 0 || tempConfig.count > 20) return false;
    
    const maxUnique = tempConfig.max - tempConfig.min + 1;
    if (!tempConfig.allowDuplicates && tempConfig.count > maxUnique) return false;
    
    return true;
  };

  const renderResult = () => {
    if (!currentResult) {
      return (
        <View style={styles.emptyResultContainer}>
          <FontAwesome5 name="dice" size={60} color="#C7C7CC" />
          <Text style={styles.emptyResultText}>Tap "Generate" to create random numbers</Text>
        </View>
      );
    }

    if (currentResult.length === 1) {
      return (
        <View style={styles.singleResultContainer}>
          <Text style={styles.singleResultNumber}>{currentResult[0]}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={currentResult}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.multiResultContainer}
        renderItem={({ item, index }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultNumber}>{item}</Text>
          </View>
        )}
      />
    );
  };

  const renderConfigBottomSheet = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseSettings}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCloseSettings}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity 
            onPress={validateAndSaveSettings}
            disabled={!isValidConfig()}
          >
            <Text style={[
              styles.modalSaveText,
              !isValidConfig() && styles.modalSaveTextDisabled
            ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Range Section */}
          <View style={styles.configSection}>
            <View style={styles.configRow}>
              <FontAwesome5 name="arrows-alt-h" size={20} color="#007AFF" style={styles.configIcon} />
              <Text style={styles.configLabel}>Range</Text>
            </View>
            <View style={styles.rangeInputs}>
              <TextInput
                style={styles.rangeInput}
                value={tempConfig.min.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  updateTempConfig('min', num);
                }}
                keyboardType="numeric"
                placeholder="Min"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={styles.rangeInput}
                value={tempConfig.max.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 100;
                  updateTempConfig('max', num);
                }}
                keyboardType="numeric"
                placeholder="Max"
              />
            </View>
          </View>

          {/* Count Section */}
          <View style={styles.configSection}>
            <View style={styles.configRow}>
              <FontAwesome5 name="hashtag" size={20} color="#007AFF" style={styles.configIcon} />
              <Text style={styles.configLabel}>Count</Text>
            </View>
            <TextInput
              style={styles.countInput}
              value={tempConfig.count.toString()}
              onChangeText={(text) => {
                const num = Math.min(20, Math.max(1, parseInt(text) || 1));
                updateTempConfig('count', num);
              }}
              keyboardType="numeric"
              placeholder="Count (1-20)"
            />
            <Text style={styles.configDescription}>
              Number of results to generate (1-20)
            </Text>
          </View>

          {/* Allow Duplicates Section */}
          <View style={styles.configSection}>
            <View style={styles.configRow}>
              <FontAwesome5 name="sync" size={20} color="#007AFF" style={styles.configIcon} />
              <View style={styles.configTextContainer}>
                <Text style={styles.configLabel}>Allow Duplicate Results</Text>
                <Text style={styles.configDescription}>
                  When disabled, each number appears only once
                </Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={tempConfig.allowDuplicates}
                onValueChange={(value) => updateTempConfig('allowDuplicates', value)}
              />
            </View>
          </View>

          {/* Validation Info */}
          {!tempConfig.allowDuplicates && (
            <View style={styles.validationInfo}>
              <FontAwesome5 name="info-circle" size={16} color="#FF9500" />
              <Text style={styles.validationText}>
                Maximum unique values in range: {tempConfig.max - tempConfig.min + 1}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        
        <View style={styles.rangeDisplay}>
          <Text style={styles.rangeText}>
            {rngConfig.min} ~ {rngConfig.max}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={copyToClipboard}
        >
          <FontAwesome5 name="clipboard" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.contentArea}>
        {isGenerating ? (
          <View style={styles.generatingContainer}>
            <FontAwesome5 name="dice" size={60} color="#007AFF" />
            <Text style={styles.generatingText}>Generating...</Text>
          </View>
        ) : (
          renderResult()
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateNumbers}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            Generate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleOpenSettings}
        >
          <FontAwesome5 name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {renderConfigBottomSheet()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  rangeDisplay: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contentArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyResultText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
  },
  singleResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  singleResultNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  multiResultContainer: {
    padding: 10,
  },
  resultCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 5,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  generatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generatingText: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 20,
    fontWeight: '500',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 0,
    paddingLeft: 80, // Move buttons 40px more to the right
    gap: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: '#C7C7CC',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  configSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  configRowWithSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configIcon: {
    marginRight: 15,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  configTextContainer: {
    flex: 1,
  },
  switchContainer: {
    alignItems: 'flex-end',
    paddingTop: 5,
  },
  configDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    textAlign: 'center',
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  countInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    textAlign: 'center',
  },
  validationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  validationText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
});