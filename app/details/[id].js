/**
 * Wheel Detail Screen
 * Purpose: Display and spin a specific wheel
 * Extend: Add spin history, share results, custom animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { G, Path, Text as SvgText, Circle, Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';

// Utility to map angle → option index
// finalDeg: wheel's final rotation in degrees (clockwise positive)
// n: number of options
// baseOffsetDeg: center of option[0] relative to 12 o'clock, clockwise (+)
function pickIndex(finalDeg, n, baseOffsetDeg = 0) {
  const pointerBiasDeg = -15; // Adjust to fix right-side bias
  const seg = 360 / n;
  const norm = ((finalDeg % 360) + 360) % 360; // 0..360
  const a = (baseOffsetDeg + pointerBiasDeg + seg / 2 - norm + 360) % 360;
  return Math.floor(a / seg); // 0..n-1
}

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.9;

export default function WheelDetailScreen() {
  const { id } = useLocalSearchParams();
  const { wheels, updateWheel, settings, addSpinResult } = useApp();
  const [wheel, setWheel] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentResult, setCurrentResult] = useState('???');
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const foundWheel = wheels.find(w => w.id === id);
    if (foundWheel) {
      setWheel(foundWheel);
    } else {
      router.back();
    }
  }, [wheels, id]);

  // Update result based on current wheel rotation
  useEffect(() => {
    if (!wheel || isSpinning) return;
    
    const enabledOptions = wheel.options.filter(opt => opt.enabled);
    if (enabledOptions.length === 0) return;

    const listener = rotationAnim.addListener(({ value }) => {
      const normalizedRotation = ((value % 360) + 360) % 360;
      const degreesPerOption = 360 / enabledOptions.length;
      const pointerAngle = (90 - normalizedRotation + 360) % 360; // Adjust for pointer at top
      const selectedIndex = Math.floor(pointerAngle / degreesPerOption);
      const selectedOption = enabledOptions[selectedIndex];
      
      // Visual feedback only - result is set by spinWheel function
    });

    return () => rotationAnim.removeListener(listener);
  }, [wheel, isSpinning, rotationAnim]);

  const spinWheel = () => {
    if (!wheel || isSpinning) return;

    const enabledOptions = wheel.options.filter(opt => opt.enabled);
    if (enabledOptions.length === 0) {
      Alert.alert('No Options', 'Please enable at least one option to spin the wheel.');
      return;
    }

    setIsSpinning(true);
    setCurrentResult('???');

    // Calculate final rotation
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations for dramatic effect
    const randomStopAngle = Math.random() * 360;
    const currentRotation = rotationAnim._value % 360;
    const finalRotation = currentRotation + fullRotations * 360 + randomStopAngle;

    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Function to handle spin end
    const onSpinEnd = (finalDeg) => {
      const idx = pickIndex(finalDeg, enabledOptions.length, 0);
      const selectedOption = enabledOptions[idx];
      
      setCurrentResult(selectedOption.label);
      setIsSpinning(false);
      
      // Update wheel last used
      const updatedWheel = { ...wheel, updatedAt: new Date().toISOString() };
      updateWheel(updatedWheel);
      setWheel(updatedWheel);

      // Record spin result
      addSpinResult({
        id: Date.now().toString(),
        wheelId: wheel.id,
        winnerOptionId: selectedOption.id,
        timestamp: new Date().toISOString(),
      });

      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    Animated.timing(rotationAnim, {
      toValue: finalRotation,
      duration: settings.defaultSpinDuration * 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onSpinEnd(finalRotation);
    });
  };

  const resetWheel = () => {
    rotationAnim.setValue(0);
    setCurrentResult('???');
  };

  const handleEdit = () => {
    router.push(`/edit/${wheel.id}`);
  };

  const createWheelPath = (options) => {
    if (options.length === 0) return [];

    const centerX = WHEEL_SIZE / 2;
    const centerY = WHEEL_SIZE / 2;
    const radius = WHEEL_SIZE / 2 - 10;
    const degreesPerSlice = 360 / options.length;

    return options.map((option, index) => {
      const startAngle = (index * degreesPerSlice - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * degreesPerSlice - 90) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = degreesPerSlice > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Calculate text position
      const textAngle = (index + 0.5) * degreesPerSlice - 90;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle * (Math.PI / 180));
      const textY = centerY + textRadius * Math.sin(textAngle * (Math.PI / 180));

      return {
        path: pathData,
        color: option.color,
        label: option.label,
        textX,
        textY,
        textAngle,
        opacity: option.enabled ? 1 : 0.4,
      };
    });
  };

  if (!wheel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const enabledOptions = wheel.options.filter(opt => opt.enabled);
  const wheelPaths = createWheelPath(enabledOptions);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with settings and menu */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.headerButton}>
          <FontAwesome5 name="ellipsis-h" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Wheel title */}
      <View style={styles.titleContainer}>
        <Text style={styles.wheelTitle}>{wheel.name}</Text>
      </View>

      {/* Result display */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{currentResult}</Text>
      </View>

      {/* Wheel container with shadow */}
      <View style={styles.wheelContainer}>
        {/* Fixed pointer above wheel */}
        <View style={styles.pointerContainer}>
          <View style={styles.pointer} />
        </View>
        
        <View style={styles.wheelShadow}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{
                  rotate: rotationAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}
          >
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              <G>
                {wheelPaths.map((slice, index) => (
                  <G key={index}>
                    <Path
                      d={slice.path}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth={2}
                      opacity={slice.opacity}
                    />
                    <SvgText
                      x={slice.textX}
                      y={slice.textY}
                      fill="white"
                      fontSize={13}
                      fontWeight="600"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${slice.textAngle}, ${slice.textX}, ${slice.textY})`}
                    >
                      {slice.label.length > 12 ? slice.label.slice(0, 12) + '...' : slice.label}
                    </SvgText>
                  </G>
                ))}
                {/* Center hub */}
                <Circle
                  cx={WHEEL_SIZE / 2}
                  cy={WHEEL_SIZE / 2}
                  r={35}
                  fill="white"
                  stroke="#E0E0E0"
                  strokeWidth={2}
                />
                <Circle
                  cx={WHEEL_SIZE / 2}
                  cy={WHEEL_SIZE / 2}
                  r={20}
                  fill="#F0F0F0"
                />
              </G>
            </Svg>
            {/* Clickable center button overlay */}
            <TouchableOpacity
              style={styles.centerButton}
              onPress={spinWheel}
              disabled={isSpinning}
              activeOpacity={0.7}
            >
              <View style={styles.centerButtonInner} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton}>
          <FontAwesome5 name="ellipsis-h" size={20} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetWheel}>
          <Text style={styles.resetButtonText}>Reset Wheel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleEdit}>
          <FontAwesome5 name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Spin button */}
      <View style={styles.spinButtonContainer}>
        <TouchableOpacity
          style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
          onPress={spinWheel}
          disabled={isSpinning}
        >
          <Text style={styles.spinButtonText}>
            {isSpinning ? 'Spinning...' : 'Spin'}
          </Text>
        </TouchableOpacity>
      </View>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  wheelTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  wheelShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: 'transparent',
  },
  wheel: {
    borderRadius: WHEEL_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  centerButton: {
    position: 'absolute',
    top: WHEEL_SIZE / 2 - 35,
    left: WHEEL_SIZE / 2 - 35,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pointerContainer: {
    position: 'absolute',
    top: WHEEL_SIZE / 2 - 52,
    left: WHEEL_SIZE / 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  centerButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  spinButtonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  spinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: '#999',
    shadowColor: '#999',
  },
  spinButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
});