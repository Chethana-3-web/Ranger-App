import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../core/ui/ScreenContainer';
import { TextField } from '../core/ui/TextField';
import { PrimaryButton } from '../core/ui/PrimaryButton';
import { SecondaryButton } from '../core/ui/SecondaryButton';
import theme from '../core/ui/theme';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    // Simulate auth registration
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Main');
    }, 1000);
  };

  const isFormValid = fullName && email && password && confirmPassword && (password === confirmPassword);

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Ranger Team</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={styles.spacer} />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.spacer} />

        <TextField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={password && confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Register"
            onPress={handleRegister}
            loading={loading}
            disabled={!isFormValid || loading}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <SecondaryButton
            label="Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
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
  loginContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  loginText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
});
