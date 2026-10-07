import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function VerifyRangers() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Overlay states
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'officer'), where('isVerified', '==', false));
      const snap = await getDocs(q);
      setPending(snap.docs.map(d => d.data()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyOfficer = async (id) => {
    setPending(prev => prev.filter(p => p.id !== id));
    setSelectedOfficer(null); // Close modal if verifying from inside it
    try {
      await updateDoc(doc(db, 'users', id), { isVerified: true });
    } catch (e) {
      console.error(e);
      fetchPending(); // rollback
    }
  };

  return (
    <div style={{ padding: 24, position: 'relative', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Verify Rangers</h1>
      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', background: 'white', borderRadius: 8 }}>
          <p>No rangers pending verification at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {pending.map(officer => (
            <div key={officer.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {officer.idPhotoUri ? (
                  <img src={officer.idPhotoUri} alt="ID" style={{ width: 50, height: 50, borderRadius: 25, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No ID</div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>{officer.fullName}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{officer.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => setSelectedOfficer(officer)}
                  style={{ flex: 1, padding: '8px 12px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                >
                  More Details
                </button>
                <button
                  onClick={() => verifyOfficer(officer.id)}
                  style={{ flex: 1, padding: '8px 12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* More Details Modal */}
      {selectedOfficer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, width: 400, maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: 12 }}>Ranger Registration Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div><strong style={{ color: '#555' }}>Full Name:</strong> <div style={{ fontSize: 16 }}>{selectedOfficer.fullName}</div></div>
              <div><strong style={{ color: '#555' }}>Email:</strong> <div style={{ fontSize: 16 }}>{selectedOfficer.email}</div></div>
              <div><strong style={{ color: '#555' }}>Phone:</strong> <div style={{ fontSize: 16 }}>{selectedOfficer.phone}</div></div>
              <div><strong style={{ color: '#555' }}>District:</strong> <div style={{ fontSize: 16 }}>{selectedOfficer.district}</div></div>
              <div><strong style={{ color: '#555' }}>Address:</strong> <div style={{ fontSize: 16 }}>{selectedOfficer.address}</div></div>
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#555' }}>Submitted ID Photo:</h3>
            {selectedOfficer.idPhotoUri ? (
              <div 
                style={{ width: '100%', height: 200, backgroundColor: '#f9f9f9', border: '1px dashed #ccc', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-in', overflow: 'hidden' }}
                onClick={() => setZoomPhoto(selectedOfficer.idPhotoUri)}
              >
                <img src={selectedOfficer.idPhotoUri} alt="ID Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>Click to zoom</div>
              </div>
            ) : (
              <p style={{ color: '#d32f2f', fontSize: 14 }}>No ID photo submitted.</p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                onClick={() => setSelectedOfficer(null)}
                style={{ padding: '10px 16px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
              >
                Close
              </button>
              <button 
                onClick={() => verifyOfficer(selectedOfficer.id)}
                style={{ padding: '10px 16px', border: 'none', borderRadius: 4, background: '#2e7d32', color: 'white', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
              >
                Approve Ranger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Overlay */}
      {zoomPhoto && (
        <div 
          onClick={() => setZoomPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
        >
          <img src={zoomPhoto} alt="Zoomed ID" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: 16, fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 20 }}>
            Click anywhere to close
          </div>
        </div>
      )}
    </div>
  );
}
