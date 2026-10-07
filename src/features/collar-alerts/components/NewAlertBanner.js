/**
 * NewAlertBanner
 * Shows a red banner at the top of the screen when a new collar alert arrives.
 * Appears for 4 seconds then auto-dismisses.
 * Works on any screen — mounted at root App level.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onNewAlert } from '../services/notificationService';

const RISK_COLOR = { Critical: '#B71C1C', High: '#E65100', Medium: '#F57F17', Low: '#2E7D32' };

export default function NewAlertBanner({ onPress }) {
  const [alert, setAlert]   = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const timerRef   = useRef(null);

  const show = (a) => {
    setAlert(a);
    clearTimeout(timerRef.current);
    // Vibrate: short-long-short pattern for urgency
    Vibration.vibrate([0, 300, 100, 300, 100, 500]);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
    timerRef.current = setTimeout(hide, 5000);
  };

  const hide = () => {
    Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => setAlert(null));
  };

  useEffect(() => {
    const unsub = onNewAlert(show);
    return () => { unsub(); clearTimeout(timerRef.current); };
  }, []);

  if (!alert) return null;

  const color = RISK_COLOR[alert.riskLevel] ?? RISK_COLOR.High;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: color, transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => { hide(); onPress?.(alert); }}
        activeOpacity={0.9}
      >
        <Ionicons name="alert-circle" size={22} color="#fff" />
        <View style={styles.text}>
          <Text style={styles.title}>🚨 {alert.riskLevel} Risk Alert</Text>
          <Text style={styles.body} numberOfLines={1}>
            {alert.animalName ? `${alert.animalName} entered ${alert.riskZone}` : alert.type}
          </Text>
        </View>
        <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 12,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text:    { flex: 1 },
  title:   { color: '#fff', fontWeight: '800', fontSize: 14 },
  body:    { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 1 },
});
