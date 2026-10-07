$content = Get-Content -Raw "ranger-dashboard/src/pages/CommunityReports.jsx"

$linkReplacement = @"
                <button 
                  onClick={() => setShowMapModal(true)} 
                  style={{ marginLeft: 10, color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                  (View on Map)
                </button>
"@
$content = $content -replace "(?s)<a\s+href.*?\(View on Map\)\s*</a>", $linkReplacement

Set-Content -Path "ranger-dashboard/src/pages/CommunityReports.jsx" -Value $content
