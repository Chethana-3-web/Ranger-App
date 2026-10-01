$content = Get-Content -Raw "ranger-dashboard/src/pages/CommunityReports.jsx"

$handleSelect = @"
  const handleSelectReport = (r) => {
    setSelectedReportId(r.id);
    if (r.status === 'PENDING_SYNC' || r.status === 'SUBMITTED' || r.status === 'Received') {
      updateStatus(r.id, 'IN PROGRESS');
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);
"@
$content = $content -replace "  const selectedReport = reports\.find\(r => r\.id === selectedReportId\);", $handleSelect

$content = $content -replace "onClick=\{\(\) => setSelectedReportId\(r\.id\)\}", "onClick={() => handleSelectReport(r)}"
$content = $content -replace "onClick=\{\(\) => setSelectedReportId\(rr\.id\)\}", "onClick={() => handleSelectReport(rr)}"

$content = $content -replace "'HANDLED'\)\}", "'RESOLVED')}"
$content = $content -replace ">Mark Handled<", ">Mark Resolved<"

Set-Content -Path "ranger-dashboard/src/pages/CommunityReports.jsx" -Value $content
