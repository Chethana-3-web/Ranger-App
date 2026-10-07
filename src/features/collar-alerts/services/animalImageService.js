/**
 * animalImageService.js
 * Upload and fetch animal profile images via Firebase Storage.
 * Images are stored at: animal-images/{animalId}.jpg
 * The download URL is saved back to the collar_alerts document.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { db } from '../../../core/config/firebase';
import app from '../../../core/config/firebase';

// Lazily initialise Storage from the same Firebase app
let _storage = null;
function storage() {
  if (!_storage) _storage = getStorage(app);
  return _storage;
}

/**
 * Upload an animal image from a local URI and save the URL to Firestore.
 *
 * @param {string} animalId   – e.g. 'WL-E102'
 * @param {string} alertId    – Firestore document ID to update
 * @param {string} localUri   – local file:// URI from image picker
 * @returns {Promise<string>} – public download URL
 */
export async function uploadAnimalImage(animalId, alertId, localUri) {
  // Fetch the local file as a blob
  const response = await fetch(localUri);
  const blob     = await response.blob();

  const storageRef = ref(storage(), `animal-images/${animalId}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

  const url = await getDownloadURL(storageRef);

  // Save URL back to the collar_alerts document
  await updateDoc(doc(db, 'collar_alerts', alertId), {
    animalImageUrl: url,
  });

  return url;
}

/**
 * Get the download URL for an animal image.
 *
 * @param {string} animalId
 * @returns {Promise<string|null>}
 */
export async function getAnimalImageUrl(animalId) {
  try {
    const storageRef = ref(storage(), `animal-images/${animalId}.jpg`);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
}
