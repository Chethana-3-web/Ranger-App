/**
 * Image Review Screen
 *
 * Main review interface for a single camera trap image.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../../../core/ui/SecondaryButton';
import COLORS from '../../../../core/constants/colors';
import ReviewStatusChip from '../components/ReviewStatusChip';
import { imageReviewService } from '../cameraTrapServices';
import { ReviewStatus } from '../../domain/reviewStatus';

const DECISION_LABELS = {
  suspicious: 'Suspicious',
  not_suspicious: 'Not suspicious',
  unclear: 'Unclear',
};

export default function ImageReviewScreen({ navigation, route }) {
  const { imageId, cameraTrapId, cameraTrapName } = route.params;
  const [image, setImage] = useState(null);
  const [nextImageId, setNextImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  // Reload on focus so the status reflects a review just saved
  useFocusEffect(
    useCallback(() => {
      let active = true;
      imageReviewService.getImagesByCameraTrapId(cameraTrapId).then((images) => {
        if (!active) return;
        const index = images.findIndex((img) => img.id === imageId);
        const next = images.find(
          (img, i) => i > index && img.reviewStatus === ReviewStatus.PENDING
        );
        setImage(index >= 0 ? images[index] : null);
        setNextImageId(next ? next.id : null);
        setLoading(false);
      });
      return () => { active = false; };
    }, [imageId, cameraTrapId])
  );

  const reviewParams = { imageId, cameraTrapId, cameraTrapName };

  const handleRetryImage = () => {
    setImageFailed(false);
    setImageAttempt((n) => n + 1);
  };

  const markUnclear = async () => {
    setSaving(true);
    try {
      await imageReviewService.markImageAsUnclear(imageId);
      navigation.replace('ReviewStatus', reviewParams);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to mark image as unclear. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkUnclear = () => {
    Alert.alert(
      'Mark as Unclear',
      'The image will be kept for later review.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark as Unclear', onPress: markUnclear },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Review Image" onBack={() => navigation.goBack()} />
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!image) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Review Image" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Image not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Review Image" subtitle={image.id} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {imageFailed ? (
          <View style={[styles.image, styles.imageError]}>
            <Ionicons name="cloud-offline-outline" size={36} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.imageErrorText}>
              Unable to load image. Please check your connection.
            </Text>
            <SecondaryButton label="Retry" onPress={handleRetryImage} />
          </View>
        ) : (
          <Image
            key={imageAttempt}
            source={{ uri: image.imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        )}

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.cardTitle}>Review status</Text>
            <ReviewStatusChip status={image.reviewStatus} />
          </View>
          <DetailRow icon="camera-outline" label="Camera" value={`${cameraTrapName || ''} (${image.cameraTrapId})`} />
          <DetailRow icon="time-outline" label="Captured" value={new Date(image.timestamp).toLocaleString()} />
          <DetailRow
            icon="location-outline"
            label="Location"
            value={image.location ? `${image.location.lat}, ${image.location.lng}` : 'Not available'}
          />
          {image.classification ? (
            <DetailRow
              icon="paw-outline"
              label="Wildlife"
              value={`${image.classification.species} × ${image.classification.count}`}
            />
          ) : null}
          {image.suspiciousActivity ? (
            <DetailRow
              icon="warning-outline"
              label="Human activity"
              value={[
                DECISION_LABELS[image.suspiciousActivity.decision],
                image.suspiciousActivity.reason,
              ].filter(Boolean).join(' – ')}
            />
          ) : null}
        </View>

        <PrimaryButton
          label="Classify Wildlife"
          onPress={() => navigation.navigate('ClassifyWildlife', reviewParams)}
          disabled={saving}
        />
        <View style={styles.spacer} />
        <SecondaryButton
          label="Review Suspicious Activity"
          onPress={() => navigation.navigate('SuspiciousActivity', reviewParams)}
          disabled={saving}
        />
        <View style={styles.spacer} />
        <SecondaryButton label="Mark as Unclear" onPress={handleMarkUnclear} disabled={saving} />
        {nextImageId ? (
          <>
            <View style={styles.spacer} />
            <SecondaryButton
              label="Next Pending Image"
              onPress={() => navigation.replace('ImageReview', { ...reviewParams, imageId: nextImageId })}
              disabled={saving}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color={COLORS.PRIMARY} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loader: {
    marginTop: 32,
  },
  notFound: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 32,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: COLORS.DIVIDER,
  },
  imageError: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageErrorText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginVertical: 12,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  detailLabel: {
    width: 110,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  spacer: {
    height: 12,
  },
});
