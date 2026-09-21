/**
 * Ranger App – Offline Banner
 *
 * Displays a persistent amber banner when the device has no network connection.
 * Rangers in the field are expected to be offline; this banner makes the state
 * explicit so they know data is being stored locally.
 *
 * Usage: Place near the top of any screen that writes data.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      Animated.timing(opacity, {
        toValue: offline ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return unsubscribe;
  }, [opacity]);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Ionicons name="cloud-offline-outline" size={16} color={COLORS.TEXT_INVERSE} />
      <Text style={styles.text}>
        Offline – data saved locally, will sync when connected
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    color: COLORS.TEXT_INVERSE,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

export default OfflineBanner;
