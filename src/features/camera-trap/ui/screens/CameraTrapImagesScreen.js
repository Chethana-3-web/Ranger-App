/**
 * Camera Trap Images Screen
 *
 * Displays all images from the selected camera trap with their review status.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../../../core/ui/AppHeader';
import OfflineBanner from '../../../../core/ui/OfflineBanner';
import COLORS from '../../../../core/constants/colors';
import ReviewStatusChip from '../components/ReviewStatusChip';
import { imageReviewService } from '../cameraTrapServices';
import { ReviewStatus } from '../../domain/reviewStatus';

export default function CameraTrapImagesScreen({ navigation, route }) {
  const { cameraTrapId, cameraTrapName } = route.params;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reload on focus so statuses reflect reviews just saved
  useFocusEffect(
    useCallback(() => {
      let active = true;
      imageReviewService.getImagesByCameraTrapId(cameraTrapId).then((data) => {
        if (active) {
          setImages(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [cameraTrapId])
  );

  const pendingCount = images.filter((img) => img.reviewStatus === ReviewStatus.PENDING).length;

  const renderImage = ({ item }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => navigation.navigate('ImageReview', { imageId: item.id, cameraTrapId, cameraTrapName })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.imageInfo}>
        <ReviewStatusChip status={item.reviewStatus} />
        <Text style={styles.imageId}>{item.id}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title={cameraTrapName || cameraTrapId}
        subtitle={cameraTrapId}
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.PRIMARY} />
      ) : (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.summary}>
              {images.length} images · {pendingCount} pending review
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No images from this camera trap yet.</Text>
          }
        />
      )}
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
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  summary: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  imageCard: {
    width: '48%',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    backgroundColor: COLORS.DIVIDER,
  },
  imageInfo: {
    padding: 10,
  },
  imageId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 32,
  },
});
