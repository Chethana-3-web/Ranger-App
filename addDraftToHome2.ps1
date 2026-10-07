$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$draftUI = @"
        {draft && (
          <View style={{marginTop: 20}}>
            <Text style={styles.sectionLabel}>Saved Draft</Text>
            <View style={styles.draftCard}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="document-text" size={24} color={COLORS.PRIMARY} />
                <View style={{marginLeft: 12, flex: 1}}>
                  <Text style={styles.reportType}>Incomplete Report</Text>
                  <Text style={styles.reportDate}>Started at: {new Date(draft.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
                <TouchableOpacity style={[styles.draftBtn, {backgroundColor: COLORS.PRIMARY}]} onPress={handleResumeDraft}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.draftBtn, {backgroundColor: '#ef4444'}]} onPress={handleDeleteDraft}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
"@

$content = $content -replace "        <View style=\{\{marginTop: 20\}\}>\r?\n\s*<Text style=\{styles\.sectionLabel\}>My Submitted Reports</Text>", "$draftUI`n        <View style={{marginTop: 20}}>`n          <Text style={styles.sectionLabel}>My Submitted Reports</Text>"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
