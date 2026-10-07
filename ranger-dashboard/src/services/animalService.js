/**
 * animalService.js — Firestore CRUD for animal_profiles collection.
 * Images stored as base64 in Firestore — no Firebase Storage needed.
 */

import {
  collection, onSnapshot, query, orderBy,
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
  const q = query(collection(db, 'animal_profiles'), orderBy('name', 'asc'));
  return onSnapshot(q,
    (snap) => callback({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: null }),
    (err)  => callback({ data: [], error: err.message }),
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
 * Convert image file to base64 and store in Firestore document.
 * No Firebase Storage needed — works immediately.
 */
export async function uploadAnimalPhoto(animalId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result; // data:image/jpeg;base64,...
        await updateAnimal(animalId, { imageUrl: base64 });
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
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
