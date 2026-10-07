$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$modalUI = @"
      <Modal visible={!!selectedReport} transparent animationType="slide" onRequestClose={() => setSelectedReport(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 20}}>
              {selectedReport && (() => {
                const status = selectedReport.status === 'PENDING_SYNC' ? 'SUBMITTED' : selectedReport.status;
                
                let step = 1; // New
                if (status === 'IN PROGRESS' || status === 'NEEDS CLARIFICATION' || status === 'In Progress') step = 2;
                if (status === 'HANDLED' || status === 'Resolved' || status === 'RESOLVED') step = 3;

                return (
                  <View>
                    <View style={styles.statusBox}>
                      <View style={[styles.statusIconBg, step === 3 ? {backgroundColor: '#dcfce7'} : {backgroundColor: '#e0e7ff'}]}>
                        <Ionicons name={step === 3 ? 'checkmark' : 'time'} size={32} color={step === 3 ? '#22c55e' : '#6366f1'} />
                      </View>
                      <Text style={styles.statusTitle}>Status: {status}</Text>
                      <Text style={styles.statusSub}>Reported on {new Date(selectedReport.recordedAt).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.stepperBox}>
                      <Text style={styles.stepperLabel}>RESOLUTION PROGRESS</Text>
                      <View style={styles.stepperTrack}>
                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                            {step >= 1 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>New</Text>
                        </View>
                        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                        
                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                            {step >= 2 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>In Progress</Text>
                        </View>
                        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive, step < 3 && styles.stepDotPending]}>
                            {step >= 3 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>Resolved</Text>
                        </View>
                      </View>
                    </View>

                    {selectedReport.officerMessage && (
                      <View style={{marginTop: 20}}>
                        <Text style={styles.stepperLabel}>Final Resolution Notes / Officer Message</Text>
                        <View style={styles.notesBox}>
                          <Text style={styles.notesText}>{selectedReport.officerMessage}</Text>
                        </View>
                      </View>
                    )}

                    <View style={{marginTop: 20, marginBottom: 40}}>
                      <Text style={styles.stepperLabel}>Incident Information</Text>
                      <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Type:</Text>
                        <Text style={styles.infoValue}>{selectedReport.type}</Text>
                        
                        <Text style={[styles.infoLabel, {marginTop: 10}]}>Description:</Text>
                        <Text style={styles.infoValue}>{selectedReport.description}</Text>

                        {selectedReport.photoUri && (
                           <Image source={{uri: selectedReport.photoUri}} style={styles.modalImage} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
"@

$content = $content -replace "      </ScrollView>`r`n    </SafeAreaView>", "      </ScrollView>`n$modalUI"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
