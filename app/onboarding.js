/**
 * Onboarding Screen
 * Purpose: Welcome users and set basic preferences
 * Extend: Add more slides, user analytics, tutorial steps
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const slides = [
  {
    title: 'Welcome to MiniDecider',
    subtitle: 'Decide anything in seconds',
    description: 'Spin wheels, pick with your finger, generate numbers, or flip coins for quick decisions',
    icon: 'magic',
  },
  {
    title: 'Customize Your Experience',
    subtitle: 'Set your preferences',
    description: 'Choose your default settings for haptics and spin duration',
    icon: 'cog',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings, updateSettings } = useApp();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    updateSettings({ onboardingCompleted: true });
    router.replace('/(tabs)');
  };

  const renderSlide = (slide, index) => (
    <View style={styles.slideContent} key={index}>
      <FontAwesome5 name={slide.icon} size={80} color="#007AFF" style={styles.slideIcon} />
      <Text style={styles.slideTitle}>{slide.title}</Text>
      <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
      <Text style={styles.slideDescription}>{slide.description}</Text>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <View style={styles.preferenceItem}>
        <Text style={styles.preferenceLabel}>Enable Haptics</Text>
        <Switch
          value={settings.hapticsEnabled}
          onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
        />
      </View>
      
      <View style={styles.preferenceItem}>
        <Text style={styles.preferenceLabel}>Default Spin Duration</Text>
        <View style={styles.durationOptions}>
          {[3, 4, 5, 6].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                settings.defaultSpinDuration === duration && styles.durationButtonActive
              ]}
              onPress={() => updateSettings({ defaultSpinDuration: duration })}
            >
              <Text style={[
                styles.durationButtonText,
                settings.defaultSpinDuration === duration && styles.durationButtonTextActive
              ]}>
                {duration}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {currentSlide === 0 && renderSlide(slides[0], 0)}
        {currentSlide === 1 && (
          <View style={styles.slideContent}>
            {renderSlide(slides[1], 1)}
            {renderPreferences()}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGetStarted} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  slideIcon: {
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  preferencesContainer: {
    width: '100%',
    marginTop: 30,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  durationButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#666',
  },
  durationButtonTextActive: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});