#!/usr/bin/env node

/**
 * Create test user accounts in Firebase Firestore
 * Run: node create-firebase-users.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBiD5QOG8QUJPeVxFnByPhmxsvGiltAGGQ',
  authDomain: 'ranger-app-b7637.firebaseapp.com',
  projectId: 'ranger-app-b7637',
  storageBucket: 'ranger-app-b7637.firebasestorage.app',
  messagingSenderId: '654015693659',
  appId: '1:654015693659:web:8fe087ba8fb92b621a907e',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testAccounts = [
  {
    id: 'USR-ranger3',
    email: 'ranger3@yala.lk',
    password: 'RangerTest1!',
    role: 'officer',
    isVerified: true,
    fullName: 'Ranger Kumara',
    parkId: 'PARK-YALA',
    patrolId: 'PTL-003',
  },
  {
    id: 'USR-ranger4',
    email: 'ranger4@wilpattu.lk',
    password: 'RangerTest1!',
    role: 'officer',
    isVerified: true,
    fullName: 'Ranger Silva',
    parkId: 'PARK-WILPATTU',
    patrolId: 'PTL-004',
  },
  {
    id: 'USR-community1',
    email: 'community@wildwatch.lk',
    password: 'CommunityTest1!',
    role: 'community',
    isVerified: true,
    fullName: 'Community Reporter',
  },
];

async function createUsers() {
  try {
    console.log('🔥 Creating test user accounts in Firebase...\n');

    for (const user of testAccounts) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✅ Created: ${user.email} (${user.role})`);
    }

    console.log('\n✨ All users created successfully!\n');
    console.log('Test Accounts:');
    console.log('==============');
    testAccounts.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log(`Name: ${user.fullName}`);
    });

    console.log('\n✅ You can now login with these accounts in the mobile app!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

createUsers();
