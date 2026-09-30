import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { ScreenContainer } from '../../core/ui/ScreenContainer';
import { TextField } from '../../core/ui/TextField';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { login, resetOnboarding } = useAuth();

  const handleLogin = async () => {
    setLocalLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid email or password.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer scrollable>
        <View style={styles.topBackground} />
        
        <TouchableOpacity style={styles.header} onLongPress={resetOnboarding} delayLongPress={2000}>
          <Image source={require('../../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue your journey</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TextField
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.spacer} />

          <TextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Sign In"
              onPress={handleLogin}
              loading={localLoading}
              disabled={!email || !password || localLoading}
            />
          </View>
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footerText}>(C) 2026 WildWatch Community</Text>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    marginTop: 50,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: '#E8F5E9',
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  spacer: {
    height: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  registerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  registerButton: {
    paddingVertical: theme.spacing.xs,
  },
  registerButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
  }
});
