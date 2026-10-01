/**
 * Review Status Screen
 *
 * Displays the saved review result for an image and where to go next.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../../../core/ui/SecondaryButton';
import COLORS from '../../../../core/constants/colors';
import ReviewStatusChip from '../components/ReviewStatusChip';
import { imageReviewService } from '../cameraTrapServices';
import { ReviewStatus } from '../../domain/reviewStatus';

function describeResult(image) {
  if (image.reviewStatus === ReviewStatus.FLAGGED) {
    return {
      title: 'Image flagged',
      message: 'Image flagged for enforcement review.',
      detail: [image.suspiciousActivity?.reason, image.suspiciousActivity?.notes].filter(Boolean).join(' – '),
    };
  }
  if (image.reviewStatus === ReviewStatus.UNCLEAR) {
    return {
      title: 'Marked as unclear',
      message: 'Image marked as unclear for later review.',
      detail: null,
    };
  }
  if (image.suspiciousActivity?.decision === 'not_suspicious' && !image.classification) {
    return {
      title: 'Review saved',
      message: 'Human activity recorded as not suspicious. No enforcement review was created.',
      detail: null,
    };
  }
  if (image.classification) {
    return {
      title: 'Classification saved',
      message: 'Classification saved successfully.',
      detail: `Species: ${image.classification.species}, Count: ${image.classification.count}`,
    };
  }
  return { title: 'Review saved', message: 'Review saved.', detail: null };
}

export default function ReviewStatusScreen({ navigation, route }) {
  const { imageId, cameraTrapId, cameraTrapName } = route.params;
  const [image, setImage] = useState(null);
  const [nextImageId, setNextImageId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    imageReviewService.getImagesByCameraTrapId(cameraTrapId).then((images) => {
      if (!active) return;
      const next = images.find(
        (img) => img.id !== imageId && img.reviewStatus === ReviewStatus.PENDING
      );
      setImage(images.find((img) => img.id === imageId) || null);
      setNextImageId(next ? next.id : null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [imageId, cameraTrapId]);

  const backToCameraTrap = () => navigation.popTo('CameraTrapImages', { cameraTrapId, cameraTrapName });

  if (loading || !image) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Review Saved" />
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color={COLORS.PRIMARY} />
        ) : (
          <Text style={styles.message}>Image not found.</Text>
        )}
      </View>
    );
  }

  const result = describeResult(image);

  return (
    <View style={styles.screen}>
      <AppHeader title="Review Saved" subtitle={image.id} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={56} color={COLORS.SUCCESS} />
          <Text style={styles.title}>{result.title}</Text>
          <Text style={styles.message}>{result.message}</Text>
          {result.detail ? <Text style={styles.detail}>{result.detail}</Text> : null}
          <View style={styles.chipRow}>
            <ReviewStatusChip status={image.reviewStatus} />
          </View>
        </View>

        {nextImageId ? (
          <>
            <PrimaryButton
              label="Next Image"
              onPress={() => navigation.replace('ImageReview', { imageId: nextImageId, cameraTrapId, cameraTrapName })}
            />
            <View style={styles.spacer} />
          </>
        ) : (
          <Text style={styles.allDone}>No more pending images for this camera trap.</Text>
        )}
        <SecondaryButton label="Back to Camera Trap" onPress={backToCameraTrap} />
        <View style={styles.spacer} />
        <SecondaryButton label="Done" onPress={() => navigation.popTo('CameraTrapList')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loader: {
    marginTop: 32,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
  detail: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 12,
  },
  chipRow: {
    marginTop: 16,
  },
  allDone: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
});
