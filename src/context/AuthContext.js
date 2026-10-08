import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../core/config/firebase';
import { SEED_USERS } from '../core/config/seeds';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const storedOnboarding = await AsyncStorage.getItem('@onboarding_completed');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedOnboarding === 'true') {
        setOnboardingCompleted(true);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (email === 'admin@example.com' && password === 'Admin1!') {
        const adminUser = { id: 'ADM-1', email, role: 'admin', fullName: 'System Admin' };
        await AsyncStorage.setItem('@user', JSON.stringify(adminUser));
        setUser(adminUser);
        return adminUser;
      }

      // Park Manager account (for Camera Trap Review)
      if (email === 'manager@example.com' && password === 'Manager1!') {
        const managerUser = {
          id: 'MGR-1',
          email,
          role: 'park_manager',
          fullName: 'Sarah Park Manager',
          parkId: 'PARK-YALA'
        };
        await AsyncStorage.setItem('@user', JSON.stringify(managerUser));
        setUser(managerUser);
        return managerUser;
      }

      // Check seed users (works offline, no Firebase needed)
      const seed = SEED_USERS.find(s => s.email === email && s.password === password);
      if (seed) {
        await AsyncStorage.setItem('@user', JSON.stringify(seed.user));
        setUser(seed.user);
        return seed.user;
      }

      // Check Firestore for user credentials (works everywhere)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), where('password', '==', password));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const foundUser = snapshot.docs[0].data();
        if (foundUser.role === 'officer' && !foundUser.isVerified) {
          throw new Error('Your Ranger Officer account is pending admin verification.');
        }
        await AsyncStorage.setItem('@user', JSON.stringify(foundUser));
        setUser(foundUser);
        return foundUser;
      } else {
        throw new Error('Invalid email or password.');
      }
    } catch (e) {
      const errorMessage = e.code === 'auth/configuration-not-found' 
        ? 'Firebase Auth not configured. Contact support.'
        : e.code === 'auth/user-not-found'
        ? 'Invalid email or password.'
        : e.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : e.message || 'Network error logging in';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userData.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error('An account already exists with this email address.');
      }
      
      const newUser = { 
        ...userData, 
        id: `USR-${Date.now()}`,
        isVerified: userData.role === 'officer' ? false : true 
      };
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
      return newUser;
    } catch (e) {
      throw new Error(e.message || 'Network error registering');
    }
  };

  const getPendingOfficers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'officer'), where('isVerified', '==', false));
      // Add manual timeout check
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 10000))
      ]);
      return snapshot.docs.map(doc => doc.data());
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const verifyOfficer = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isVerified: true });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, updates);
      } catch (e) {
        console.error('Failed to sync profile update to cloud:', e);
      }
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    setOnboardingCompleted(true);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('@onboarding_completed');
    setOnboardingCompleted(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      onboardingCompleted,
      login,
      register,
      logout,
      updateProfile,
      completeOnboarding,
      resetOnboarding,
      getPendingOfficers,
      verifyOfficer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
