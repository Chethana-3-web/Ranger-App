import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Switch, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../core/ui/TextField';
import { PrimaryButton } from '../../core/ui/PrimaryButton';
import theme from '../../core/ui/theme';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [isTermsModalVisible, setTermsModalVisible] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  const { register } = useAuth();

  // Dynamic Password Validation Checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!fullName.trim()) { newErrors.fullName = 'Full name is required.'; valid = false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Valid email is required.'; valid = false; }
    if (!phone || phone.length < 10) { newErrors.phone = 'Valid phone number is required.'; valid = false; }
    if (!district) { newErrors.district = 'District selection is required.'; valid = false; }
    if (!address.trim()) { newErrors.address = 'Address is required.'; valid = false; }

    if (!isPasswordValid) {
      newErrors.password = 'Password does not meet the requirements.';
      valid = false;
    }
    if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; valid = false; }
    if (!termsAccepted) { newErrors.terms = 'You must accept the Terms and Conditions.'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLocalLoading(true);
    try {
      await register({ fullName, email, phone, district, address, password });
      Alert.alert(
        "Welcome to the Community!",
        "Your account has been created. You can now log in to report wildlife incidents.",
        [{ text: "Continue to Login", onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || 'Registration failed.' }));
    } finally {
      setLocalLoading(false);
    }
  };

  const ValidationItem = ({ label, isValid }) => (
    <View style={styles.validationItem}>
      <Ionicons 
        name={isValid ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={isValid ? theme.colors.success : theme.colors.textSecondary} 
      />
      <Text style={[styles.validationText, isValid && styles.validationTextValid]}>{label}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* Fixed top background block to stay in place */}
      <View style={styles.topBackground} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.surface} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Wildlife Community</Text>
          </View>
          
          <Image source={require('../../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Scrollable Form */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <TextField
              label="Full Name *"
              placeholder="John Doe"
              value={fullName}
              onChangeText={(text) => { setFullName(text); setErrors(e => ({...e, fullName: null})); }}
              error={errors.fullName}
            />
            <View style={styles.spacer} />

            <TextField
              label="Email Address *"
              placeholder="john@example.com"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors(e => ({...e, email: null})); }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <View style={styles.spacer} />

            <TextField
              label="Phone Number *"
              placeholder="07X XXX XXXX"
              value={phone}
              onChangeText={(text) => { setPhone(text); setErrors(e => ({...e, phone: null})); }}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <View style={styles.spacer} />

            <Text style={styles.label}>District *</Text>
            <TouchableOpacity 
              style={[styles.dropdownSelector, errors.district && styles.inputError]} 
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text style={district ? styles.dropdownText : styles.placeholderText}>
                {district || 'Select a District'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {errors.district ? <Text style={styles.errorText}>{errors.district}</Text> : null}
            <View style={styles.spacer} />

            <TextField
              label="Address / Village *"
              placeholder="123 Main St"
              value={address}
              onChangeText={(text) => { setAddress(text); setErrors(e => ({...e, address: null})); }}
              error={errors.address}
            />
            <View style={styles.spacer} />

            <TextField
              label="Password *"
              placeholder="Create a strong password"
              value={password}
              onChangeText={(text) => { setPassword(text); setErrors(e => ({...e, password: null})); }}
              isPassword={true}
              error={errors.password}
            />
            
            {/* Dynamic Password Validation UI */}
            {password.length > 0 && (
              <View style={styles.passwordValidationContainer}>
                <ValidationItem label="At least 8 characters" isValid={hasMinLength} />
                <ValidationItem label="One uppercase letter" isValid={hasUpperCase} />
                <ValidationItem label="One lowercase letter" isValid={hasLowerCase} />
                <ValidationItem label="One number" isValid={hasNumber} />
                <ValidationItem label="One special character (@$!%*?&)" isValid={hasSpecialChar} />
              </View>
            )}
            
            <View style={styles.spacer} />

            <TextField
              label="Confirm Password *"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrors(e => ({...e, confirmPassword: null})); }}
              isPassword={true}
              error={errors.confirmPassword}
            />
            <View style={styles.spacer} />

            <View style={styles.termsContainer}>
              <Switch 
                value={termsAccepted} 
                onValueChange={(val) => { setTermsAccepted(val); setErrors(e => ({...e, terms: null})); }} 
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={termsAccepted ? theme.colors.primary : "#f4f3f4"}
              />
              <TouchableOpacity onPress={() => setTermsModalVisible(true)} style={{ flex: 1, paddingVertical: 8 }}>
                <Text style={styles.termsText}>I accept the <Text style={styles.termsLink}>Terms and Conditions</Text> *</Text>
              </TouchableOpacity>
            </View>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
            {errors.submit ? <Text style={[styles.errorText, {marginTop: 10, fontSize: 14, textAlign: 'center'}]}>{errors.submit}</Text> : null}

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Create Account"
                onPress={handleRegister}
                loading={localLoading}
                disabled={localLoading}
              />
            </View>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>(C) 2026 WildWatch Community</Text>
        </ScrollView>
      </SafeAreaView>

      {/* District Selection Modal */}
      <Modal visible={isDistrictModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DISTRICTS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, district === item && styles.modalItemSelected]}
                  onPress={() => {
                    setDistrict(item);
                    setErrors(e => ({...e, district: null}));
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, district === item && styles.modalItemTextSelected]}>{item}</Text>
                  {district === item && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Terms and Conditions Modal */}
      <Modal visible={isTermsModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.termsContentText}>
                Welcome to the WildWatch Community Reporting Application.{'\n\n'}
                1. Acceptance of Terms{'\n'}
                By creating an account and using this application, you agree to comply with and be bound by these terms.{'\n\n'}
                2. User Responsibilities{'\n'}
                You agree to provide accurate and truthful information when submitting wildlife reports. False reporting may lead to account suspension.{'\n\n'}
                3. Privacy Policy{'\n'}
                Your personal information (Name, Phone, Email, Location) will only be used by authorized Wildlife Conservation Officers for the purpose of verifying and responding to incidents.{'\n\n'}
                4. Safety First{'\n'}
                Do NOT put yourself in danger to report an incident. Maintain a safe distance from wild animals at all times.{'\n\n'}
                5. Modification of Terms{'\n'}
                We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of modified terms.
              </Text>
            </ScrollView>
            <View style={{ marginTop: 20 }}>
              <PrimaryButton 
                label="I Understand" 
                onPress={() => {
                  setTermsAccepted(true);
                  setErrors(e => ({...e, terms: null}));
                  setTermsModalVisible(false);
                }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 250,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  fixedHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
  },
  backButton: {
    width: 40, height: 40,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  header: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
    paddingTop: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  title: { ...theme.typography.heading1, color: theme.colors.surface, marginBottom: 2, fontSize: 24 },
  subtitle: { ...theme.typography.bodySmall, color: '#E8F5E9' },
  
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  spacer: { height: theme.spacing.md },
  label: { ...theme.typography.subtitle, marginBottom: theme.spacing.xs, color: theme.colors.text },
  dropdownSelector: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  inputError: { borderColor: theme.colors.error },
  dropdownText: { ...theme.typography.body, color: theme.colors.text },
  placeholderText: { ...theme.typography.body, color: theme.colors.textSecondary },
  errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4 },
  
  passwordValidationContainer: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.md,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validationText: {
    marginLeft: 6,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  validationTextValid: {
    color: theme.colors.success,
  },

  termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
  termsText: { marginLeft: theme.spacing.sm, ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  termsLink: { color: theme.colors.primary, fontWeight: '600' },
  buttonContainer: { marginTop: theme.spacing.xl },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.xl, paddingBottom: 20 },
  loginText: { ...theme.typography.body, color: theme.colors.textSecondary, marginRight: theme.spacing.xs },
  loginButton: { paddingVertical: theme.spacing.xs },
  loginButtonText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: '700' },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  modalClose: { padding: 4 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemSelected: { backgroundColor: '#F1F8E9' },
  modalItemText: { fontSize: 16, color: theme.colors.text },
  modalItemTextSelected: { color: theme.colors.primary, fontWeight: '600' },
  termsContentText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text,
  }
});
