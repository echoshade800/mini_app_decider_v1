/**
 * Profile & Settings Screen
 * Purpose: App preferences and data management
 * Extend: Add themes, cloud sync, user accounts, analytics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';

export default function ProfileScreen() {
  const { settings, updateSettings, wheels } = useApp();
  const [showDefaultWheelPicker, setShowDefaultWheelPicker] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export all your wheels and settings to a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // TODO: Implement data export
          Alert.alert('Coming Soon', 'Data export functionality will be available in a future update.');
        }},
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This feature will allow you to import wheels and settings from a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: () => {
          // TODO: Implement data import
          Alert.alert('Coming Soon', 'Data import functionality will be available in a future update.');
        }},
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your wheels, settings, and statistics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          // TODO: Implement app reset
          Alert.alert('Coming Soon', 'App reset functionality will be available in a future update.');
        }},
      ]
    );
  };

  const renderSettingRow = (icon, title, subtitle, rightComponent) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <FontAwesome5 name={icon} size={20} color="#007AFF" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </View>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {renderSection('General', (
          <>
            {renderSettingRow(
              'bell',
              'Enable Haptics',
              'Feel vibrations for interactions',
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              />
            )}
            
            {renderSettingRow(
              'clock',
              'Default Spin Duration',
              `Currently set to ${settings.defaultSpinDuration} seconds`,
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
            )}
          </>
        ))}

        {renderSection('Data Management', (
          <>
            {renderSettingRow(
              'download',
              'Export Data',
              'Download your wheels and settings',
              <TouchableOpacity onPress={handleExportData}>
                <FontAwesome5 name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>
            )}
            
            {renderSettingRow(
              'upload',
              'Import Data',
              'Restore wheels and settings from file',
              <TouchableOpacity onPress={handleImportData}>
                <FontAwesome5 name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </>
        ))}

        {renderSection('Statistics', (
          <>
            {renderSettingRow(
              'compact-disc',
              'Total Wheels',
              `${wheels.length} wheels created`,
              null
            )}
            
            {renderSettingRow(
              'heart',
              'Favorite Wheels',
              `${wheels.filter(w => w.favorite).length} wheels favorited`,
              null
            )}
          </>
        ))}

        {renderSection('Support', (
          <>
            {renderSettingRow(
              'info-circle',
              'About & Help',
              'App info, FAQs, and support',
              <TouchableOpacity onPress={() => router.push('/about')}>
                <FontAwesome5 name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </>
        ))}

        {renderSection('Danger Zone', (
          <>
            {renderSettingRow(
              'exclamation-triangle',
              'Reset App',
              'Delete all data and restore defaults',
              <TouchableOpacity onPress={handleResetApp}>
                <FontAwesome5 name="chevron-right" size={16} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>MiniDecider v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for quick decisions</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 35,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  durationButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  durationButtonTextActive: {
    color: 'white',
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
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});