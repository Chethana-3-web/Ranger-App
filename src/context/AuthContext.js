import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Mock login logic
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (email === 'officer@example.com' && password === 'Officer1!') {
          const officerUser = { id: 'OFF-1', email, role: 'officer', fullName: 'Officer John' };
          await AsyncStorage.setItem('@user', JSON.stringify(officerUser));
          setUser(officerUser);
          resolve(officerUser);
        } 
        // Park Manager account (for Camera Trap Review)
        else if (email === 'manager@example.com' && password === 'Manager1!') {
          const managerUser = { 
            id: 'MGR-1', 
            email, 
            role: 'park_manager', 
            fullName: 'Sarah Park Manager',
            parkId: 'PARK-YALA'
          };
          await AsyncStorage.setItem('@user', JSON.stringify(managerUser));
          setUser(managerUser);
          resolve(managerUser);
        }
        else if (email && password) {
          const storedUsers = await AsyncStorage.getItem('@registered_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const foundUser = users.find(u => u.email === email && u.password === password);
          
          if (foundUser) {
            const memberUser = { ...foundUser, role: 'community' };
            await AsyncStorage.setItem('@user', JSON.stringify(memberUser));
            setUser(memberUser);
            resolve(memberUser);
          } else {
            reject(new Error('Invalid email or password.'));
          }
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 1000);
    });
  };

  const register = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const storedUsers = await AsyncStorage.getItem('@registered_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          
          if (users.find(u => u.email === userData.email)) {
            reject(new Error('An account already exists with this email address.'));
            return;
          }
          
          users.push(userData);
          await AsyncStorage.setItem('@registered_users', JSON.stringify(users));
          resolve(userData);
        } catch (e) {
          reject(e);
        }
      }, 1000);
    });
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
      
      const storedUsers = await AsyncStorage.getItem('@registered_users');
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.map(u => u.email === updatedUser.email ? { ...u, ...updates } : u);
      await AsyncStorage.setItem('@registered_users', JSON.stringify(users));
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
      resetOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
