/**
 * Wildlife — Member 4 dashboard page.
 * Admin manages collared animal profiles here.
 * These are ALL tracked animals — NOT alerts.
 * Alerts are separate events in collar_alerts collection.
 */

import React, { useState, useEffect, useRef } from 'react';import { PawPrint, Plus, Pencil, Trash2, Upload, X, Save, Radio, AlertTriangle, Zap } from 'lucide-react';
import {
  subscribeToAnimals, createAnimal, updateAnimal,
  deleteAnimal, uploadAnimalPhoto, triggerCollarAlert,
} from '../services/animalService.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const SPECIES_OPTIONS = [
  'Sri Lankan Elephant',
  'Sri Lankan Leopard',
  'Sloth Bear',
  'Sambar Deer',
  'Water Buffalo',
  'Other',
];

const PARKS = [
  { id: 'PARK-YALA',      name: 'Yala National Park' },
  { id: 'PARK-WILPATTU',  name: 'Wilpattu National Park' },
  { id: 'PARK-UDAWALAWE', name: 'Udawalawe National Park' },
  { id: 'PARK-SINHARAJA', name: 'Sinharaja Forest Reserve' },
];

const STATUS_OPTIONS = ['Active', 'Alert', 'Inactive'];

const STATUS_COLOR = {
  Active:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Alert:    { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
  Inactive: { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
};

const EMPTY_FORM = {
  id: '', name: '', species: 'Sri Lankan Elephant', collarId: '',
  parkId: 'PARK-YALA', status: 'Active',
  latitude: '', longitude: '', zone: '', notes: '',
};

// ── Risk zone presets ─────────────────────────────────────────────────────────

const RISK_ZONES = [
  { name: 'Farmland Zone F-04',           riskLevel: 'High',     latitude: 6.5050,  longitude: 80.9250 },
  { name: 'A12 Highway Crossing Point',   riskLevel: 'Medium',   latitude: 8.4820,  longitude: 80.0600 },
  { name: 'North Yala Sector A',          riskLevel: 'Critical', latitude: 6.4150,  longitude: 81.5400 },
  { name: 'Village Boundary – South Yala',riskLevel: 'High',     latitude: 6.3620,  longitude: 81.5180 },
  { name: 'Reservoir Buffer Zone',        riskLevel: 'Medium',   latitude: 6.4950,  longitude: 80.9180 },
  { name: 'Road Crossing – Sinharaja',    riskLevel: 'Low',      latitude: 6.4000,  longitude: 80.4820 },
];

// ── Trigger Alert Modal ───────────────────────────────────────────────────────

function TriggerAlertModal({ animal, onClose }) {
  const [selectedZone, setSelectedZone] = useState(RISK_ZONES[0]);
  const [triggering,   setTriggering]   = useState(false);
  const [done,         setDone]         = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await triggerCollarAlert(animal, selectedZone);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (e) {
      alert('Failed to generate alert: ' + e.message);
      setTriggering(false);
    }
  };

  const RISK_COLOR = { Critical: '#b91c1c', High: '#c2410c', Medium: '#b45309', Low: '#15803d' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#b91c1c' }}>⚡ Trigger Collar Alert</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#15803d' }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <p style={{ fontWeight: 700, marginTop: 8 }}>Alert generated successfully!</p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>Rangers will be notified on their devices.</p>
          </div>
        ) : (
          <>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>🐾 {animal.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{animal.species} · {animal.collarId}</div>
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Select Risk Zone</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {RISK_ZONES.map((z) => (
                <div key={z.name} onClick={() => setSelectedZone(z)}
                  style={{ padding: '10px 12px', borderRadius: 8, border: `2px solid ${selectedZone.name === z.name ? '#1B5E20' : '#e5e7eb'}`, background: selectedZone.name === z.name ? '#f0fdf4' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>{z.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: RISK_COLOR[z.riskLevel] }}>{z.riskLevel}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '9px', border: '1px solid #d1d5db', borderRadius: 6, background: '#f9fafb', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={handleTrigger} disabled={triggering}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: 'none', borderRadius: 6, background: '#b91c1c', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: triggering ? 0.7 : 1 }}>
                <Zap size={15} /> {triggering ? 'Generating…' : 'Generate Alert'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Animal card ───────────────────────────────────────────────────────────────

function AnimalCard({ animal, onEdit, onDelete, onUploadPhoto, onTrigger }) {
  const sc  = STATUS_COLOR[animal.status] ?? STATUS_COLOR.Active;
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadPhoto(animal.id, file);
    e.target.value = '';
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 140, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {animal.imageUrl
          ? <img src={animal.imageUrl} alt={animal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <PawPrint size={40} color="#d1d5db" />
        }
        <button
          onClick={() => fileRef.current?.click()}
          style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
        >
          <Upload size={12} /> Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{animal.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{animal.species}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
            {animal.status}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            <Radio size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Collar: <strong>{animal.collarId || '—'}</strong>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            Park: <strong>{PARKS.find((p) => p.id === animal.parkId)?.name ?? animal.parkId ?? '—'}</strong>
          </div>
          {animal.zone && <div style={{ fontSize: 12, color: '#6b7280' }}>Zone: <strong>{animal.zone}</strong></div>}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(animal)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => onTrigger(animal)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontSize: 12, color: '#b91c1c', fontWeight: 700 }}>
            <Zap size={13} /> Alert
          </button>
          <button onClick={() => onDelete(animal)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', color: '#6b7280' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Animal form modal ─────────────────────────────────────────────────────────

function AnimalForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl ?? null);
  const fileRef = useRef();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setPreviewUrl(base64);
      setForm((f) => ({ ...f, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const Field = ({ label, name, type = 'text', options }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
      {options ? (
        <select value={form[name]} onChange={(e) => set(name, e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
          {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]} onChange={(e) => set(name, e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>{initial ? 'Edit Animal' : 'Add New Animal'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Photo upload */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', height: 140, borderRadius: 8, border: '2px dashed #d1d5db', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
          >
            {previewUrl
              ? <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <><Upload size={28} color="#9ca3af" /><span style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Click to add photo (optional)</span></>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          {previewUrl && (
            <button onClick={() => { setPreviewUrl(null); setForm((f) => ({ ...f, imageUrl: null })); }}
              style={{ marginTop: 6, fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remove photo
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Animal ID (e.g. WL-E104)" name="id" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Name" name="name" />
          </div>
          <Field label="Species" name="species" options={SPECIES_OPTIONS} />
          <Field label="Collar ID" name="collarId" />
          <Field label="Park" name="parkId" options={PARKS.map((p) => ({ value: p.id, label: p.name }))} />
          <Field label="Status" name="status" options={STATUS_OPTIONS} />
          <Field label="Zone / Area" name="zone" />
          <Field label="Latitude" name="latitude" type="number" />
          <Field label="Longitude" name="longitude" type="number" />
          <div style={{ gridColumn: '1/-1', marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, background: '#f9fafb', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 6, background: '#1B5E20', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Animal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Wildlife() {
  const [animals,    setAnimals]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [parkFilter, setParkFilter] = useState('ALL');
  const [triggerTarget, setTriggerTarget] = useState(null);

  useEffect(() => {
    return subscribeToAnimals(({ data, error }) => {
      setAnimals(data);
      setLoading(false);
    });
  }, []);

  const filtered = animals.filter((a) => {
    const matchPark   = parkFilter === 'ALL' || a.parkId === parkFilter;
    const matchSearch = !search || [a.name, a.species, a.collarId]
      .filter(Boolean).some((v) => v.toLowerCase().includes(search.toLowerCase()));
    return matchPark && matchSearch;
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const data = {
        ...form,
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (editTarget) {
        await updateAnimal(form.id, data);
      } else {
        await createAnimal(data);
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (animal) => {
    if (!window.confirm(`Delete ${animal.name}? This cannot be undone.`)) return;
    await deleteAnimal(animal.id).catch((e) => alert('Delete failed: ' + e.message));
  };

  const handleUploadPhoto = async (animalId, file) => {
    try {
      await uploadAnimalPhoto(animalId, file);
    } catch (e) {
      alert('Photo upload failed: ' + e.message);
    }
  };
  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#1B5E20' }}>Collared Animals</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Manage GPS-collared wildlife profiles. Alerts are generated separately when animals enter high-risk zones.</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#1B5E20', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          <Plus size={16} /> Add Animal
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input placeholder="Search by name, species, collar…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
        <select value={parkFilter} onChange={(e) => setParkFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}>
          <option value="ALL">All Parks</option>
          {PARKS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Total', value: animals.length, color: '#1B5E20' },
          { label: 'Active', value: animals.filter((a) => a.status === 'Active').length, color: '#16a34a' },
          { label: 'Alert', value: animals.filter((a) => a.status === 'Alert').length, color: '#dc2626' },
          { label: 'Inactive', value: animals.filter((a) => a.status === 'Inactive').length, color: '#6b7280' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '10px 16px', border: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: 40 }}>Loading animals…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <PawPrint size={40} color="#d1d5db" />
          <p>No animals found. Add the first collared animal.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map((a) => (
            <AnimalCard
              key={a.id} animal={a}
              onEdit={(a) => { setEditTarget(a); setShowForm(true); }}
              onDelete={handleDelete}
              onUploadPhoto={handleUploadPhoto}
              onTrigger={(a) => setTriggerTarget(a)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AnimalForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          saving={saving}
        />
      )}

      {triggerTarget && (
        <TriggerAlertModal
          animal={triggerTarget}
          onClose={() => setTriggerTarget(null)}
        />
      )}
    </div>
  );
}
