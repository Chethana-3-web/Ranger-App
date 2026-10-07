$content = Get-Content -Raw "ranger-dashboard/src/pages/CommunityReports.jsx"

$stateVars = @"
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (r.label && r.label.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  const downloadCSV = () => {
    if (filteredReports.length === 0) {
      alert('No reports to download');
      return;
    }
    const headers = ['ID', 'Type', 'Status', 'Time', 'Latitude', 'Longitude', 'Description'];
    const csvRows = [headers.join(',')];
    
    filteredReports.forEach(r => {
      const row = [
        r.id,
        r.label,
        r.status,
        new Date(r.recordedAt).toISOString(),
        r.latitude,
        r.longitude,
        '""' + (r.description || '').replace(/"/g, '""') + '""'
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "community_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
"@
$content = $content -replace "  const \[showMapModal, setShowMapModal\] = useState\(false\);", $stateVars

$headerUI = @"
    <div style={styles.container}>
      <h2 style={styles.header}>Community Reports</h2>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by type or description..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="PENDING_SYNC">Pending Sync</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="NEEDS CLARIFICATION">Needs Clarification</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <button 
          onClick={downloadCSV} 
          style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Download CSV
        </button>
      </div>

      <div style={styles.layout}>
"@
$content = $content -replace "(?s)    <div style=\{styles\.container\}>\s*<h2 style=\{styles\.header\}>Community Reports</h2>\s*<div style=\{styles\.layout\}>", $headerUI

$content = $content -replace "reports\.length === 0", "filteredReports.length === 0"
$content = $content -replace "reports\.map\(r => \(", "filteredReports.map(r => ("

Set-Content -Path "ranger-dashboard/src/pages/CommunityReports.jsx" -Value $content
