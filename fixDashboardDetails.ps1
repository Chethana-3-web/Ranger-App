$content = Get-Content -Raw "ranger-dashboard/src/pages/CommunityReports.jsx"

$enhancedDetails = @"
              <h3>Report Details</h3>
              <p><strong>Type:</strong> {selectedReport.label}</p>
              <p><strong>Description:</strong> {selectedReport.description || 'No description provided.'}</p>
              <p><strong>Time:</strong> {new Date(selectedReport.recordedAt).toLocaleString()}</p>
              <p>
                <strong>Location:</strong> {selectedReport.latitude}, {selectedReport.longitude}{' '}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ marginLeft: 10, color: '#2563eb', textDecoration: 'underline' }}
                >
                  (View on Map)
                </a>
              </p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
              <p><strong>Reporter ID:</strong> {selectedReport.rangerId || 'Unknown'}</p>

              {selectedReport.photoUrl && (
                <div style={{ marginTop: 15 }}>
                  <strong>Attached Photo:</strong><br/>
                  <img 
                    src={selectedReport.photoUrl} 
                    alt="Evidence" 
                    style={{ maxWidth: '100%', maxHeight: 300, marginTop: 10, borderRadius: 8, border: '1px solid #ccc' }} 
                  />
                </div>
              )}
"@
$content = $content -replace "(?s)<h3>Report Details</h3>.*?<p><strong>Status:</strong> \{selectedReport\.status\}</p>", $enhancedDetails

Set-Content -Path "ranger-dashboard/src/pages/CommunityReports.jsx" -Value $content
