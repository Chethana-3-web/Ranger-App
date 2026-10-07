import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../core/ui/ScreenContainer';
import { TextField } from '../core/ui/TextField';
import { PrimaryButton } from '../core/ui/PrimaryButton';
import { SecondaryButton } from '../core/ui/SecondaryButton';
import theme from '../core/ui/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Main');
    }, 1000);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to Ranger App</Text>
      </View>

      <View style={styles.form}>
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
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password || loading}
          />
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <SecondaryButton
            label="Register"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  form: {
    paddingHorizontal: theme.spacing.sm,
  },
  spacer: {
    height: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  registerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
});
