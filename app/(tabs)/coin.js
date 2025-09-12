/**
 * Coin Flip Screen
 * Purpose: Virtual coin flipping with statistics matching reference design
 * Features: Golden coin with perspective flip, count badges, settings modal
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';

const { width, height } = Dimensions.get('window');
const COIN_SIZE = Math.min(width * 0.6, 240);

export default function CoinFlipScreen() {
  const { settings, coinStats, updateCoinStats } = useApp();
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentSide, setCurrentSide] = useState('heads'); // heads or tails
  const [showSettings, setShowSettings] = useState(false);
  const [coinSettings, setCoinSettings] = useState({
    hapticsEnabled: settings.hapticsEnabled,
    flipDuration: 1.25, // seconds
    soundEnabled: false,
  });

  // Animation values
  const flipRotation = useSharedValue(0);
  const coinScale = useSharedValue(1);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);

    if (coinSettings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Determine result (50/50)
    const willBeHeads = Math.random() < 0.5;
    const targetRotation = willBeHeads ? 0 : 180;
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = Math.floor(fullRotations) * 360 + targetRotation;

    // Animation sequence
    coinScale.value = withSequence(
      withTiming(0.98, { duration: 100 }), // Press down
      withTiming(1, { duration: 100 })
    );

    flipRotation.value = withTiming(
      finalRotation,
      { duration: coinSettings.flipDuration * 1000 },
      (finished) => {
        if (finished) {
          // Ensure we land exactly on heads (0°) or tails (180°)
          flipRotation.value = willBeHeads ? Math.floor(finalRotation / 360) * 360 : Math.floor(finalRotation / 360) * 360 + 180;
          runOnJS(handleFlipComplete)(willBeHeads);
        }
      }
    );
  };

  const handleFlipComplete = (isHeads) => {
    setCurrentSide(isHeads ? 'heads' : 'tails');
    setIsFlipping(false);

    // Update stats
    const newStats = {
      ...coinStats,
      [isHeads ? 'heads' : 'tails']: coinStats[isHeads ? 'heads' : 'tails'] + 1,
      lastResult: isHeads ? 'heads' : 'tails',
      lastFlippedAt: new Date().toISOString(),
    };
    updateCoinStats(newStats);

    // Bounce effect
    coinScale.value = withSequence(
      withTiming(1.02, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );

    if (coinSettings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const resetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'This will reset all flip counts to zero. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          updateCoinStats({
            heads: 0,
            tails: 0,
            lastResult: null,
            lastFlippedAt: null,
          });
          setCurrentSide('heads');
          flipRotation.value = 0;
          
          if (coinSettings.hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }},
      ]
    );
  };

  const saveSettings = () => {
    // Update global settings if haptics changed
    if (coinSettings.hapticsEnabled !== settings.hapticsEnabled) {
      // Note: This would need to be implemented in the context
      // For now, we'll just keep it local to coin flip
    }
    setShowSettings(false);
  };

  // Animated styles
  const coinAnimatedStyle = useAnimatedStyle(() => {
    const normalizedRotation = ((flipRotation.value % 360) + 360) % 360;
    const rotateY = normalizedRotation;

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: coinScale.value },
      ],
    };
  });

  const headsOpacity = useAnimatedStyle(() => ({
    opacity: ((flipRotation.value % 360 + 360) % 360) < 90 || ((flipRotation.value % 360 + 360) % 360) > 270 ? 1 : 0,
  }));

  const tailsOpacity = useAnimatedStyle(() => ({
    opacity: ((flipRotation.value % 360 + 360) % 360) >= 90 && ((flipRotation.value % 360 + 360) % 360) <= 270 ? 1 : 0,
  }));

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Coin Settings</Text>
          <TouchableOpacity onPress={saveSettings}>
            <Text style={styles.modalSaveText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.settingSection}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Haptics</Text>
              <Switch
                value={coinSettings.hapticsEnabled}
                onValueChange={(value) => setCoinSettings(prev => ({
                  ...prev,
                  hapticsEnabled: value
                }))}
              />
            </View>
          </View>

          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>Flip Duration</Text>
            <View style={styles.durationOptions}>
              {[1.0, 1.25, 1.5].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    coinSettings.flipDuration === duration && styles.durationButtonActive
                  ]}
                  onPress={() => setCoinSettings(prev => ({
                    ...prev,
                    flipDuration: duration
                  }))}
                >
                  <Text style={[
                    styles.durationButtonText,
                    coinSettings.flipDuration === duration && styles.durationButtonTextActive
                  ]}>
                    {duration}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />

        {/* Count badges */}
        <View style={styles.countContainer}>
          <View style={styles.countBadge}>
            <View style={styles.coinIcon}>
              <Text style={styles.coinIconText}>H</Text>
            </View>
            <Text style={styles.countNumber}>{coinStats.heads}</Text>
          </View>
          
          <View style={styles.countBadge}>
            <View style={styles.coinIcon}>
              <Text style={styles.coinIconText}>T</Text>
            </View>
            <Text style={styles.countNumber}>{coinStats.tails}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetStats}
        >
          <FontAwesome5 name="redo" size={20} color="#1967FF" />
        </TouchableOpacity>
      </View>

      {/* Coin area */}
      <View style={styles.coinContainer}>
        <Animated.View style={[styles.coin, coinAnimatedStyle]}>
          {/* Heads side */}
          <Animated.View style={[styles.coinSide, styles.headsStyle, headsOpacity]}>
            <View style={styles.coinInner}>
              <View style={styles.outerRing} />
              <View style={styles.middleRing} />
              <View style={styles.centerArea}>
                <View style={styles.laurelWreath}>
                  <FontAwesome5 name="leaf" size={18} color="#FFE394" style={styles.laurelLeft} />
                  <Text style={styles.coinNumber}>1</Text>
                  <FontAwesome5 name="leaf" size={18} color="#FFE394" style={styles.laurelRight} />
                </View>
                <Text style={styles.coinText}>LIBERTY</Text>
              </View>
            </View>
          </Animated.View>

          {/* Tails side */}
          <Animated.View style={[styles.coinSide, styles.tailsStyle, tailsOpacity]}>
            <View style={styles.coinInner}>
              <View style={styles.outerRing} />
              <View style={styles.middleRing} />
              <View style={styles.centerArea}>
                <FontAwesome5 name="university" size={36} color="#FFE394" style={styles.buildingIcon} />
                <Text style={styles.coinTextSmall}>E PLURIBUS UNUM</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.flipButton, isFlipping && styles.flipButtonDisabled]}
          onPress={flipCoin}
          disabled={isFlipping}
        >
          <Text style={styles.flipButtonText}>
            {isFlipping ? 'Flipping...' : 'Flip'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  countContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7C74A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#D9A72F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  coinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE394',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D9A72F',
  },
  countNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  coinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  coin: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    position: 'relative',
  },
  coinSide: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  headsStyle: {
    backgroundColor: '#F7C74A',
  },
  tailsStyle: {
    backgroundColor: '#F7C74A',
    transform: [{ rotateY: '180deg' }],
  },
  coinInner: {
    width: '100%',
    height: '100%',
    borderRadius: COIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 8,
    borderColor: '#FFE394',
  },
  outerRing: {
    position: 'absolute',
    width: COIN_SIZE - 20,
    height: COIN_SIZE - 20,
    borderRadius: (COIN_SIZE - 20) / 2,
    borderWidth: 2,
    borderColor: '#FFE394',
    opacity: 0.6,
  },
  middleRing: {
    position: 'absolute',
    width: COIN_SIZE - 40,
    height: COIN_SIZE - 40,
    borderRadius: (COIN_SIZE - 40) / 2,
    borderWidth: 1,
    borderColor: '#FFE394',
    opacity: 0.4,
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  laurelWreath: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  laurelLeft: {
    transform: [{ rotate: '-25deg' }],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  laurelRight: {
    transform: [{ rotate: '25deg' }],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coinNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  coinText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFE394',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coinTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFE394',
    letterSpacing: 1,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buildingIcon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  flipButton: {
    backgroundColor: '#1967FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#1967FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flipButtonDisabled: {
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 50,
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
    color: '#1967FF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  settingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F9F9F9',
  },
  durationButtonActive: {
    backgroundColor: '#1967FF',
    borderColor: '#1967FF',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  durationButtonTextActive: {
    color: 'white',
  },
});