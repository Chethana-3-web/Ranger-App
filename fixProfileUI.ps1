$content = Get-Content -Raw "src/screens/ProfileScreen.js"

$imports = @"
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
"@
$content = $content -replace "import React, \{ useState \} from 'react';\r?\nimport \{ View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TextInput \} from 'react-native';", $imports

$headerUI = @"
    <SafeAreaView style={styles.safe} edges={isCommunity ? ['top'] : ['bottom']}>
      {isCommunity ? (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>WildWatch Community</Text>
            <Text style={styles.headerSub}>My Profile</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
        </View>
      ) : (
        <AppHeader title="Profile" />
      )}
"@
$content = $content -replace "<SafeAreaView style=\{styles\.safe\} edges=\{\['bottom'\]\}>\r?\n\s*<AppHeader title=`"Profile`" />", $headerUI

$modalUI = @"
      </ScrollView>
      <Modal visible={isEditing} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Enter full name" />
            
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="Enter phone number" keyboardType="phone-pad" />
            
            <View style={{flexDirection: 'row', gap: 12, marginTop: 20}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: COLORS.SURFACE}]} onPress={() => setIsEditing(false)}>
                <Text style={{color: COLORS.TEXT_PRIMARY, fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: COLORS.PRIMARY}]} onPress={saveProfile} disabled={saving}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
"@
$content = $content -replace "(?s)<Modal visible=\{isEditing\}.*?</Modal>\r?\n\s*</SafeAreaView>", $modalUI

$styles = @"
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.HEADER_BG || '#15803d',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
"@
$content = $content -replace "const styles = StyleSheet\.create\(\{[\s\r\n]*safe:\s*\{\s*flex:\s*1,\s*backgroundColor:\s*COLORS\.BACKGROUND\s*\},", $styles

Set-Content -Path "src/screens/ProfileScreen.js" -Value $content
