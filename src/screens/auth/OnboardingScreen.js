import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Report Incidents',
    description: 'Help protect our wildlife by reporting incidents quickly and easily. Your reports matter.',
    icon: 'paw'
  },
  {
    id: '2',
    title: 'Track Status',
    description: 'Keep track of the incidents you reported and see live updates from field officers.',
    icon: 'location'
  },
  {
    id: '3',
    title: 'Community Effort',
    description: 'Join hands with the community to ensure a safer environment for everyone and everything.',
    icon: 'people'
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useAuth();
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const onScroll = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconBackground}>
            <Ionicons name={item.icon} size={80} color={theme.colors.surface} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <View style={styles.header}>
        {currentIndex < ONBOARDING_DATA.length - 1 ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label={currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
          />
        </View>
        
        <Text style={styles.footerText}>(C) 2026 WildWatch Community</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    height: 60,
  },
  skipText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconWrapper: {
    flex: 0.5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.md,
  },
  textContainer: {
    flex: 0.5,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
  }
});
