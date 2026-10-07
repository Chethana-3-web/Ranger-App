import React, { useState } from 'react';
import { Save, Bell, Shield, User, Map, Smartphone } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modal states for System tab
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Dummy state for settings
  const [settings, setSettings] = useState({
    adminName: 'Super Admin',
    adminEmail: 'admin@example.com',
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    mapDefaultZoom: '8',
    syncInterval: '30',
    darkMode: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#333', margin: 0 }}>System Settings</h1>
        <button 
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#1B5E20', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Settings Sidebar */}
        <div style={{ width: 220, background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <div 
            onClick={() => setActiveTab('profile')}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: activeTab === 'profile' ? '#f0fdf4' : 'transparent', borderLeft: `3px solid ${activeTab === 'profile' ? '#1B5E20' : 'transparent'}` }}
          >
            <User size={18} color={activeTab === 'profile' ? '#1B5E20' : '#666'} />
            <span style={{ fontWeight: activeTab === 'profile' ? 'bold' : 'normal', color: activeTab === 'profile' ? '#1B5E20' : '#333' }}>Profile</span>
          </div>
          <div 
            onClick={() => setActiveTab('notifications')}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: activeTab === 'notifications' ? '#f0fdf4' : 'transparent', borderLeft: `3px solid ${activeTab === 'notifications' ? '#1B5E20' : 'transparent'}` }}
          >
            <Bell size={18} color={activeTab === 'notifications' ? '#1B5E20' : '#666'} />
            <span style={{ fontWeight: activeTab === 'notifications' ? 'bold' : 'normal', color: activeTab === 'notifications' ? '#1B5E20' : '#333' }}>Notifications</span>
          </div>
          <div 
            onClick={() => setActiveTab('system')}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: activeTab === 'system' ? '#f0fdf4' : 'transparent', borderLeft: `3px solid ${activeTab === 'system' ? '#1B5E20' : 'transparent'}` }}
          >
            <Shield size={18} color={activeTab === 'system' ? '#1B5E20' : '#666'} />
            <span style={{ fontWeight: activeTab === 'system' ? 'bold' : 'normal', color: activeTab === 'system' ? '#1B5E20' : '#333' }}>System Security</span>
          </div>
          <div 
            onClick={() => setActiveTab('map')}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: activeTab === 'map' ? '#f0fdf4' : 'transparent', borderLeft: `3px solid ${activeTab === 'map' ? '#1B5E20' : 'transparent'}` }}
          >
            <Map size={18} color={activeTab === 'map' ? '#1B5E20' : '#666'} />
            <span style={{ fontWeight: activeTab === 'map' ? 'bold' : 'normal', color: activeTab === 'map' ? '#1B5E20' : '#333' }}>Map & Sync</span>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1, background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333', borderBottom: '1px solid #eee', paddingBottom: 12 }}>Admin Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 14, color: '#555' }}>Full Name</label>
                  <input type="text" value={settings.adminName} onChange={(e) => setSettings({...settings, adminName: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 14, color: '#555' }}>Email Address</label>
                  <input type="email" value={settings.adminEmail} onChange={(e) => setSettings({...settings, adminEmail: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 14, color: '#555' }}>Role</label>
                  <input type="text" value="System Administrator" disabled style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#f5f5f5', color: '#888' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333', borderBottom: '1px solid #eee', paddingBottom: 12 }}>Alerts & Notifications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>Email Alerts</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Receive email for critical wildlife incidents.</p>
                  </div>
                  <input type="checkbox" checked={settings.emailAlerts} onChange={() => handleToggle('emailAlerts')} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>SMS Alerts</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Receive text messages for emergency SOS.</p>
                  </div>
                  <input type="checkbox" checked={settings.smsAlerts} onChange={() => handleToggle('smsAlerts')} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>Push Notifications</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Show browser popups for new incidents.</p>
                  </div>
                  <input type="checkbox" checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} style={{ width: 20, height: 20 }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333', borderBottom: '1px solid #eee', paddingBottom: 12 }}>System & Security</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  style={{ alignSelf: 'flex-start', padding: '10px 16px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Change Password
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>Two-Factor Authentication (2FA)</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>{twoFactorEnabled ? '2FA is currently enabled. Your account is secure.' : 'Protect your account with an extra layer of security.'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!twoFactorEnabled) setShow2FAModal(true);
                      else {
                        if(window.confirm('Are you sure you want to disable 2FA?')) setTwoFactorEnabled(false);
                      }
                    }}
                    style={{ padding: '8px 16px', background: twoFactorEnabled ? '#dc3545' : '#1B5E20', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                <div style={{ marginTop: 20, padding: 16, backgroundColor: '#fff3cd', borderRadius: 6, border: '1px solid #ffeeba' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Active Sessions</h4>
                    <button onClick={() => alert('All other sessions have been logged out securely.')} style={{ padding: '4px 10px', fontSize: 12, cursor: 'pointer', border: '1px solid #eed3d7', background: '#f8d7da', color: '#721c24', borderRadius: 4 }}>Revoke Other Sessions</button>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#856404' }}>You are currently logged in from Chrome (Windows). Last login: Just now.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333', borderBottom: '1px solid #eee', paddingBottom: 12 }}>Map & Synchronization</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 14, color: '#555' }}>Default Map Zoom Level</label>
                  <select value={settings.mapDefaultZoom} onChange={(e) => setSettings({...settings, mapDefaultZoom: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="6">Level 6 (Country)</option>
                    <option value="8">Level 8 (Region)</option>
                    <option value="12">Level 12 (Park)</option>
                    <option value="14">Level 14 (Detailed)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 14, color: '#555' }}>Offline Sync Interval</label>
                  <select value={settings.syncInterval} onChange={(e) => setSettings({...settings, syncInterval: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every 1 hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, width: 350 }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="password" placeholder="Current Password" style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
              <input type="password" placeholder="New Password" style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
              <input type="password" placeholder="Confirm New Password" style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: 4 }}>Cancel</button>
              <button onClick={() => { alert('Password updated successfully!'); setShowPasswordModal(false); }} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: '#1B5E20', color: 'white', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>Save Password</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, width: 350, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Setup 2FA</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Scan this QR code with your Authenticator App (Google Authenticator, Authy, etc.)</p>
            <div style={{ width: 150, height: 150, background: '#eee', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/RangerAdmin?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ" alt="QR Code" />
            </div>
            <input type="text" placeholder="Enter 6-digit code" style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: 4, fontSize: 18 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShow2FAModal(false)} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: 4 }}>Cancel</button>
              <button onClick={() => { setTwoFactorEnabled(true); setShow2FAModal(false); alert('2FA Enabled Successfully!'); }} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: '#1B5E20', color: 'white', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>Verify & Enable</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
