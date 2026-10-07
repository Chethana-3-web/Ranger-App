import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToCommunityReports } from '../services/incidentService.js';
import { db } from '../services/firebase.js'; // Ensure correct import
import { doc, updateDoc } from 'firebase/firestore';

/** Haversine distance in km */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function CommunityReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
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
        '"' + (r.description || '').replace(/"/g, '""') + '"'
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

  useEffect(() => {
    const unsub = subscribeToCommunityReports(({ data, error: err, loading: ld }) => {
      setReports(data);
      setError(err);
      setLoading(ld);
    });
    return () => unsub();
  }, []);

  const handleSelectReport = (r) => {
    setSelectedReportId(r.id);
    if (r.status === 'PENDING_SYNC' || r.status === 'SUBMITTED' || r.status === 'Received') {
      updateStatus(r.id, 'IN PROGRESS');
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Hotspot logic: find related reports
  const relatedReports = useMemo(() => {
    if (!selectedReport || !selectedReport.latitude || !selectedReport.longitude) return [];
    return reports.filter(r => {
      if (r.id === selectedReport.id) return false;
      if (r.type !== selectedReport.type) return false;
      if (!r.latitude || !r.longitude) return false;
      
      const distance = getDistance(
        selectedReport.latitude, selectedReport.longitude,
        r.latitude, r.longitude
      );
      
      const timeDiffHours = Math.abs(new Date(selectedReport.recordedAt) - new Date(r.recordedAt)) / 36e5;
      
      return distance <= 5 && timeDiffHours <= 48; // within 5km, 48 hours
    });
  }, [selectedReport, reports]);

  const updateStatus = async (id, newStatus) => {
    try {
      const ref = doc(db, 'community_reports', id);
      await updateDoc(ref, { status: newStatus });
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  if (loading) return <div style={styles.center}>Loading reports...</div>;
  if (error) return <div style={styles.center}>Error: {error}</div>;

  return (
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
        {/* List Panel */}
        <div style={styles.listPanel}>
          {filteredReports.length === 0 ? (
            <p>No community reports found.</p>
          ) : (
            filteredReports.map(r => (
              <div 
                key={r.id} 
                style={{ ...styles.card, borderLeftColor: r.id === selectedReportId ? '#15803d' : '#e5e7eb' }}
                onClick={() => handleSelectReport(r)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.typeLabel}>{r.label}</span>
                  <span style={styles.statusLabel}>{r.status}</span>
                </div>
                <div style={styles.cardBody}>
                  {r.description.substring(0, 50)}...
                </div>
                <div style={styles.cardFooter}>
                  {new Date(r.recordedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div style={styles.detailPanel}>
          {selectedReport ? (
            <div>
                            <h3>Report Details</h3>
              <p><strong>Type:</strong> {selectedReport.label}</p>
              <p><strong>Description:</strong> {selectedReport.description || 'No description provided.'}</p>
              <p><strong>Time:</strong> {new Date(selectedReport.recordedAt).toLocaleString()}</p>
              <p>
                <strong>Location:</strong> {selectedReport.latitude}, {selectedReport.longitude}{' '}
                                <button 
                  onClick={() => setShowMapModal(true)} 
                  style={{ marginLeft: 10, color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                  (View on Map)
                </button>
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
              
              <div style={styles.actions}>
                <button onClick={() => updateStatus(selectedReport.id, 'RESOLVED')} style={styles.btn}>Mark Resolved</button>
                <button 
                  onClick={() => {
                    const msg = window.prompt('Enter message for villager:');
                    if (msg) {
                      const ref = doc(db, 'community_reports', selectedReport.id);
                      updateDoc(ref, { status: 'NEEDS CLARIFICATION', officerMessage: msg }).catch(console.error);
                    }
                  }} 
                  style={{ ...styles.btn, background: '#f59e0b' }}
                >
                  Needs Clarification
                </button>
              </div>
              {selectedReport.officerMessage && (
                <div style={{ marginTop: 15, padding: 10, background: '#fef3c7', borderRadius: 4 }}>
                  <strong>Message to Villager:</strong> {selectedReport.officerMessage}
                </div>
              )}

              {relatedReports.length > 0 && (
                <div style={styles.hotspotBox}>
                  <h4 style={styles.hotspotHeader}>≡ƒÜ¿ POSSIBLE RELATED REPORTS (HOTSPOT)</h4>
                  <p>Found {relatedReports.length} similar {selectedReport.label} report(s) within 5km and 48 hours.</p>
                  <ul>
                    {relatedReports.map(rr => (
                      <li key={rr.id}>
                        {new Date(rr.recordedAt).toLocaleDateString()} - {rr.description.substring(0, 30)}...
                        <button onClick={() => handleSelectReport(rr)} style={{marginLeft: 8}}>View</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>Select a report to view details.</p>
          )}
        </div>
      </div>
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

const styles = {
  container: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column' },
  header: { margin: '0 0 20px 0' },
  layout: { display: 'flex', gap: 20, flex: 1, minHeight: 0 },
  listPanel: { flex: 1, overflowY: 'auto', borderRight: '1px solid #ccc', paddingRight: 10 },
  detailPanel: { flex: 2, overflowY: 'auto', padding: 10 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' },
  card: { padding: 12, border: '1px solid #e5e7eb', borderLeftWidth: 4, borderRadius: 6, marginBottom: 10, cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  typeLabel: { fontWeight: 'bold' },
  statusLabel: { fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 },
  cardBody: { fontSize: 14, color: '#374151', marginBottom: 6 },
  cardFooter: { fontSize: 12, color: '#9ca3af' },
  actions: { marginTop: 20, display: 'flex', gap: 10 },
  btn: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  hotspotBox: { marginTop: 20, padding: 15, background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 6 },
  hotspotHeader: { color: '#b91c1c', marginTop: 0 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' },
};





