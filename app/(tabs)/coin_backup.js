/**
 * Coin Flip Screen - Backup copy
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoinFlipScreen() {
  const [currentSide, setCurrentSide] = useState('heads');

  const flipCoin = () => {
    const willBeHeads = Math.random() < 0.5;
    setCurrentSide(willBeHeads ? 'heads' : 'tails');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Coin Flip</Text>
        <View style={styles.coin}>
          <Text style={styles.coinText}>
            {currentSide === 'heads' ? 'H' : 'T'}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={flipCoin}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  coin: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F7C74A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 8,
    borderColor: '#FFE394',
  },
  coinText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: '#1967FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

