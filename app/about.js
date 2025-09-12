/**
 * About & Help Screen
 * Purpose: App information, support, and help resources
 * Extend: Add FAQ search, contact forms, tutorial videos
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Application from 'expo-application';

const FAQ_ITEMS = [
  {
    question: 'How do I create a custom wheel?',
    answer: 'Tap the "+" button on the Spin Wheel tab, enter a name for your wheel, add options with colors and weights, then tap "Create Wheel".',
  },
  {
    question: 'What are option weights?',
    answer: 'Weights determine how likely each option is to be selected. Higher weights mean higher probability. For example, an option with weight 80 is twice as likely to be selected as one with weight 40.',
  },
  {
    question: 'Can I disable options temporarily?',
    answer: 'Yes! When editing a wheel, toggle the "Enabled" switch for any option to temporarily exclude it from spins without deleting it.',
  },
  {
    question: 'How does the finger spinner work?',
    answer: 'Start the game, then have up to 5 people place their fingers on the screen. After 5 seconds, one finger will be randomly selected as the winner.',
  },
  {
    question: 'What happens to duplicates in random numbers?',
    answer: 'You can choose to allow or prevent duplicates in the settings. When duplicates are disabled, each number can only appear once in the results.',
  },
  {
    question: 'How do I export my data?',
    answer: 'Go to Profile > Export Data to download all your wheels and settings as a JSON file for backup or sharing.',
  },
];

export default function AboutScreen() {
  const version = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@minidecider.app?subject=MiniDecider Support');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://minidecider.app');
  };

  const handleRateApp = () => {
    // This would link to app store pages in a real app
    alert('Rate App feature coming soon!');
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderInfoRow = (icon, title, subtitle, onPress) => (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoLeft}>
        <FontAwesome5 name={icon} size={20} color="#007AFF" style={styles.infoIcon} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>{title}</Text>
          {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
          }
        </View>
      </View>
      {onPress && <FontAwesome5 name="chevron-right" size={16} color="#999" />}
    </TouchableOpacity>
  );

  const renderFAQItem = (item, index) => (
    <View key={index} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'About & Help',
          headerShown: true,
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.appIcon}>
            <FontAwesome5 name="magic" size={40} color="#007AFF" />
          </View>
          <Text style={styles.appName}>MiniDecider</Text>
          <Text style={styles.appTagline}>Decide anything in seconds</Text>
          <Text style={styles.appVersion}>Version {version} ({buildNumber})</Text>
        </View>

        {renderSection('App Information', (
          <>
            {renderInfoRow('info-circle', 'Version', `${version} (${buildNumber})`)}
            {renderInfoRow('calendar', 'Last Updated', new Date().toLocaleDateString())}
            {renderInfoRow('mobile-alt', 'Platform', 'iOS, Android, Web')}
            {renderInfoRow('code', 'Built with', 'React Native & Expo')}
          </>
        ))}

        {renderSection('Support & Feedback', (
          <>
            {renderInfoRow('envelope', 'Contact Support', 'Get help with technical issues', handleContactSupport)}
            {renderInfoRow('globe', 'Visit Website', 'Learn more about MiniDecider', handleVisitWebsite)}
            {renderInfoRow('star', 'Rate the App', 'Help us improve with your feedback', handleRateApp)}
          </>
        ))}

        {renderSection('Features', (
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <FontAwesome5 name="compact-disc" size={24} color="#007AFF" />
              <Text style={styles.featureTitle}>Spin Wheels</Text>
              <Text style={styles.featureDescription}>Create custom decision wheels with weighted options</Text>
            </View>
            
            <View style={styles.featureCard}>
              <FontAwesome5 name="hand-pointer" size={24} color="#007AFF" />
              <Text style={styles.featureTitle}>Finger Pick</Text>
              <Text style={styles.featureDescription}>Multi-touch selection for up to 5 participants</Text>
            </View>
            
            <View style={styles.featureCard}>
              <FontAwesome5 name="sort-numeric-down" size={24} color="#007AFF" />
              <Text style={styles.featureTitle}>Random Numbers</Text>
              <Text style={styles.featureDescription}>Generate random numbers with custom ranges</Text>
            </View>
            
            <View style={styles.featureCard}>
              <FontAwesome5 name="coins" size={24} color="#007AFF" />
              <Text style={styles.featureTitle}>Coin Flip</Text>
              <Text style={styles.featureDescription}>Virtual coin flipping with statistics tracking</Text>
            </View>
          </View>
        ))}

        {renderSection('Frequently Asked Questions', (
          <View style={styles.faqContainer}>
            {FAQ_ITEMS.map(renderFAQItem)}
          </View>
        ))}

        {renderSection('Privacy & Terms', (
          <>
            {renderInfoRow('shield-alt', 'Privacy Policy', 'How we protect your data')}
            {renderInfoRow('file-contract', 'Terms of Service', 'App usage terms and conditions')}
            {renderInfoRow('user-secret', 'Data Storage', 'All data stored locally on your device')}
          </>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for quick decisions</Text>
          <Text style={styles.footerSubtext}>© 2024 MiniDecider. All rights reserved.</Text>
        </View>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  faqContainer: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
  },
});