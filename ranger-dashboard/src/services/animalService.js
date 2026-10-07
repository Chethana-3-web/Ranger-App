/**
 * animalService.js ΓÇö Firestore CRUD for animal_profiles collection.
 * Images stored as base64 in Firestore ΓÇö no Firebase Storage needed.
 */

import {
  collection, onSnapshot, query,
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp, addDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';

const PARKS = [
  { id: 'PARK-YALA',      name: 'Yala National Park' },
  { id: 'PARK-WILPATTU',  name: 'Wilpattu National Park' },
  { id: 'PARK-UDAWALAWE', name: 'Udawalawe National Park' },
  { id: 'PARK-SINHARAJA', name: 'Sinharaja Forest Reserve' },
];

export function subscribeToAnimals(callback) {
  const q = query(collection(db, 'animal_profiles'));
  return onSnapshot(q,
    (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      callback({ data, error: null });
    },
    (err) => callback({ data: [], error: err.message }),
  );
}

export async function createAnimal(data) {
  const id = data.id || `WL-${Date.now()}`;
  await setDoc(doc(db, 'animal_profiles', id), {
    ...data, id, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateAnimal(id, data) {
  await updateDoc(doc(db, 'animal_profiles', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteAnimal(id) {
  await deleteDoc(doc(db, 'animal_profiles', id));
}

/**
 * Compress image and store as base64 in Firestore.
 * Resizes to max 400px and compresses to ~50KB ΓÇö well under Firestore 1MB limit.
 */
export async function uploadAnimalPhoto(animalId, file) {
  const base64 = await compressImage(file, 400, 0.5);
  await updateAnimal(animalId, { imageUrl: base64 });
  return base64;
}

function compressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale   = Math.min(1, maxWidth / img.width);
      const canvas  = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = objectUrl;
  });
}

function resizeImage(file, maxWidth) {
  return compressImage(file, maxWidth, 0.8);
}

export async function triggerCollarAlert(animal, riskZone) {
  const docRef = await addDoc(collection(db, 'collar_alerts'), {
    animalId:       animal.id,
    animalName:     animal.name,
    species:        animal.species,
    collarId:       animal.collarId,
    parkId:         animal.parkId,
    parkName:       PARKS.find((p) => p.id === animal.parkId)?.name ?? animal.parkId,
    type:           `${animal.species} Entered High-Risk Zone`,
    riskZone:       riskZone.name,
    riskLevel:      riskZone.riskLevel,
    latitude:       riskZone.latitude  ?? animal.latitude  ?? null,
    longitude:      riskZone.longitude ?? animal.longitude ?? null,
    status:         'Active',
    generatedAt:    new Date().toISOString(),
    acknowledgedBy: null,
    acknowledgedAt: null,
    animalImageUrl: animal.imageUrl ?? null,
  });
  return docRef.id;
}
