/**
 * photoUploadService.js
 * Converts a local file URI to base64 and stores it in Firestore.
 * Works in Expo Go — no Firebase Storage CORS issues.
 * Images are compressed to ~100KB before storing.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase';

/**
 * Convert a local image URI to a compressed base64 data URL.
 * @param {string} uri  local file:// URI from image picker
 * @returns {Promise<string>} base64 data URL
 */
export async function uriToBase64(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
}
