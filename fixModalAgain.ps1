$content = Get-Content -Raw "src/screens/ProfileScreen.js"

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
$content = $content -replace "(?s)<Modal visible=\{isEditing\}.*?</Modal>\r?\n\s*</ScrollView>\r?\n\s*</SafeAreaView>", $modalUI

Set-Content -Path "src/screens/ProfileScreen.js" -Value $content
