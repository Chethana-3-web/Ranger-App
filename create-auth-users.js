#!/usr/bin/env node

/**
 * Create Firebase Authentication users for rangers and community reporters
 * Run: node create-auth-users.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAqIqZaZDIafRo064Nb24lhbDU4EffqPWM',
  authDomain: 'ranger-abaec.firebaseapp.com',
  projectId: 'ranger-abaec',
  storageBucket: 'ranger-abaec.firebasestorage.app',
  messagingSenderId: '857666252220',
  appId: '1:857666252220:web:3899ce46f130cfac608fb9',
  measurementId: 'G-7CJH298BHJ',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testAccounts = [
  {
    email: 'ranger3@yala.lk',
    password: 'RangerTest1!',
    profile: {
      email: 'ranger3@yala.lk',
      role: 'officer',
      isVerified: true,
      fullName: 'Ranger Kumara',
      parkId: 'PARK-YALA',
      patrolId: 'PTL-003',
    },
  },
  {
    email: 'ranger4@wilpattu.lk',
    password: 'RangerTest1!',
    profile: {
      email: 'ranger4@wilpattu.lk',
      role: 'officer',
      isVerified: true,
      fullName: 'Ranger Silva',
      parkId: 'PARK-WILPATTU',
      patrolId: 'PTL-004',
    },
  },
  {
    email: 'community@wildwatch.lk',
    password: 'CommunityTest1!',
    profile: {
      email: 'community@wildwatch.lk',
      role: 'community',
      isVerified: true,
      fullName: 'Community Reporter',
    },
  },
];

async function createUsers() {
  try {
    console.log('🔥 Creating Firebase Authentication users...\n');

    for (const account of testAccounts) {
      try {
        // Create in Firebase Auth
        const userRecord = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );
        console.log(`✅ Created Auth user: ${account.email}`);

        // Create Firestore profile (without password)
        await setDoc(doc(db, 'users', userRecord.user.uid), {
          ...account.profile,
          id: userRecord.user.uid,
        });
        console.log(`✅ Created Firestore profile: ${account.email}\n`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  User already exists: ${account.email}`);
        } else if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  Email already in use: ${account.email}`);
        } else {
          console.error(`❌ Error creating ${account.email}:`, error.message);
        }
      }
    }

    console.log('✨ Done!\n');
    console.log('Test Accounts Ready:');
    console.log('====================');
    testAccounts.forEach((account) => {
      console.log(`\nEmail: ${account.email}`);
      console.log(`Password: ${account.password}`);
      console.log(`Role: ${account.profile.role}`);
      console.log(`Name: ${account.profile.fullName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
