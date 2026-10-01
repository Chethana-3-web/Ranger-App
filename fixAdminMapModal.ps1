$content = Get-Content -Raw "ranger-dashboard/src/pages/CommunityReports.jsx"

$stateImports = @"
  const [error, setError] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
"@
$content = $content -replace "  const \[error, setError\] = useState\(null\);\r?\n  const \[selectedReportId, setSelectedReportId\] = useState\(null\);", $stateImports

$linkReplacement = @"
                <button 
                  onClick={() => setShowMapModal(true)} 
                  style={{ marginLeft: 10, color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                  (View on Map)
                </button>
"@
$content = $content -replace "(?s)<a\s+href=\{`https://www.google.com/maps/search/.*?</a>", $linkReplacement

$modalUI = @"
      {showMapModal && selectedReport && (
        <div style={styles.modalOverlay} onClick={() => setShowMapModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Incident Location</h3>
              <button onClick={() => setShowMapModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={{ width: '100%', height: '400px' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }} 
                src={`https://maps.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"@
$content = $content -replace "    </div>\r?\n  \);\r?\n\}", $modalUI

$stylesReplacement = @"
  hotspotHeader: { color: '#b91c1c', marginTop: 0 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' },
};
"@
$content = $content -replace "  hotspotHeader: \{ color: '#b91c1c', marginTop: 0 \},\r?\n\};", $stylesReplacement

Set-Content -Path "ranger-dashboard/src/pages/CommunityReports.jsx" -Value $content
