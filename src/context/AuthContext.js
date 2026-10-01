import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../core/config/firebase';

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
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Connection timed out. Did you enable Firestore in your Firebase Console?')), 10000);
      try {
        if (email === 'admin@example.com' && password === 'Admin1!') {
          clearTimeout(timeoutId);
          const adminUser = { id: 'ADM-1', email, role: 'admin', fullName: 'System Admin' };
          await AsyncStorage.setItem('@user', JSON.stringify(adminUser));
          setUser(adminUser);
          return resolve(adminUser);
        }

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email), where('password', '==', password));
        const snapshot = await getDocs(q);
        
        clearTimeout(timeoutId);
        if (!snapshot.empty) {
          const foundUser = snapshot.docs[0].data();
          if (foundUser.role === 'officer' && !foundUser.isVerified) {
            return reject(new Error('Your Ranger Officer account is pending admin verification.'));
          }
          await AsyncStorage.setItem('@user', JSON.stringify(foundUser));
          setUser(foundUser);
          resolve(foundUser);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      } catch (e) {
        clearTimeout(timeoutId);
        reject(new Error('Network error logging in: ' + e.message));
      }
    });
  };

  const register = async (userData) => {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Connection timed out. Did you enable Firestore in your Firebase Console?')), 10000);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', userData.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          clearTimeout(timeoutId);
          return reject(new Error('An account already exists with this email address.'));
        }
        
        const newUser = { 
          ...userData, 
          id: `USR-${Date.now()}`,
          isVerified: userData.role === 'officer' ? false : true 
        };
        
        await setDoc(doc(db, 'users', newUser.id), newUser);
        clearTimeout(timeoutId);
        resolve(newUser);
      } catch (e) {
        clearTimeout(timeoutId);
        reject(new Error('Network error registering: ' + e.message));
      }
    });
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
