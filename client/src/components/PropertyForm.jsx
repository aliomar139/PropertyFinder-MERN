import { useEffect, useRef, useState } from 'react';
import { citiesByGovernorate, governorates } from '../data/locations.js';
import { imageUrl } from '../api/client';

const emptySlots = () => Array.from({ length: 6 }, () => ({ file: null, preview: null, existingId: '', existingPath: null }));

// Shared form for listPage.php (create) and editproperty-details.php (edit).
// onSubmit receives a FormData with the exact legacy field names.
export default function PropertyForm({ initial, onSubmit, onClearImage, submitting, error }) {
  const [form, setForm] = useState({
    governorate: '', city: '', locationDetails: '', type: '', area: '', price: '',
    status: '', furnished: '', bedrooms: '', bathrooms: '', livingrooms: '', moreDetails: ''
  });
  const [slots, setSlots] = useState(emptySlots);
  const fileInputs = useRef([]);

  useEffect(() => {
    if (!initial) return;
    setForm({
      governorate: initial.details.governorate || '',
      city: initial.details.city || '',
      locationDetails: initial.details.exactLocation || '',
      type: initial.type || '',
      area: String(initial.details.area ?? ''),
      price: String(initial.details.price ?? ''),
      status: initial.status || '',
      furnished: initial.details.furnished ? 'yes' : 'no',
      bedrooms: String(initial.details.nbBedrooms ?? ''),
      bathrooms: String(initial.details.nbBathrooms ?? ''),
      livingrooms: String(initial.details.nbLivingrooms ?? ''),
      moreDetails: initial.details.moreDetails || ''
    });
    const next = emptySlots();
    (initial.images || []).slice(0, 6).forEach((img, i) => {
      next[i] = { file: null, preview: null, existingId: img.id, existingPath: img.path };
    });
    setSlots(next);
  }, [initial]);

  const digits = (v) => v.replace(/[^0-9]/g, '');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm((f) => ({ ...f, [k]: digits(e.target.value) }));

  const cities = citiesByGovernorate[form.governorate] || [];

  function pickFile(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, file, preview: ev.target.result } : slot)));
    reader.readAsDataURL(file);
  }

  function clearSlot(i) {
    const slot = slots[i];
    if (slot.existingId && onClearImage) {
      onClearImage(slot.existingId); // clear_image.php behavior: deletes immediately
    }
    if (fileInputs.current[i]) fileInputs.current[i].value = '';
    setSlots((s) => s.map((sl, idx) => (idx === i ? { file: null, preview: null, existingId: '', existingPath: null } : sl)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('governorate', form.governorate);
    fd.append('city', form.city);
    fd.append('locationDetails', form.locationDetails);
    fd.append('type', form.type);
    fd.append('area', form.area);
    fd.append('price', form.price);
    fd.append('status', form.status);
    fd.append('furnished', form.furnished);
    fd.append('bedrooms', form.bedrooms);
    fd.append('bathrooms', form.bathrooms);
    fd.append('livingrooms', form.livingrooms);
    fd.append('more-details', form.moreDetails);
    slots.forEach((slot, i) => {
      fd.append(`existing_image[${i}]`, slot.existingId || '');
      if (slot.file) fd.append(`photo${i + 1}`, slot.file);
    });
    onSubmit(fd);
  }

  return (
    <>
      <div className="divcenter">
        <h2>fill your property details !</h2>
      </div>
      <form id="uploadForm" onSubmit={handleSubmit}>
        <div className="center">
          {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

          <div className="form-group">
            <div>
              <label htmlFor="governorate">Governorate:</label>
              <select id="governorate" value={form.governorate} required
                onChange={(e) => setForm((f) => ({ ...f, governorate: e.target.value, city: '' }))}>
                <option value="">Select a governorate</option>
                {governorates.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city">City:</label>
              <select id="city" value={form.city} onChange={set('city')} required>
                <option value="">Select a city</option>
                {form.city && !cities.includes(form.city) && <option value={form.city}>{form.city}</option>}
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="locationDetails">Exact Location:</label>
              <input type="text" id="locationDetails" placeholder="Enter exact location"
                value={form.locationDetails} onChange={set('locationDetails')} required />
            </div>
          </div>

          <div className="compact-group">
            <div>
              <label htmlFor="type">Type</label>
              <select id="type" value={form.type} onChange={set('type')} required>
                <option value="">Select type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
            <div>
              <label htmlFor="area">Area (m²)</label>
              <input id="area" value={form.area} onChange={setNum('area')} required />
            </div>
            <div>
              <label htmlFor="price">Price (USD)</label>
              <input id="recommendedprice" type="number" min="1" value={form.price} onChange={setNum('price')} required />
            </div>
          </div>

          <div className="radio-row">
            <div className="radio-group">
              <label>STATUS:</label>
              <div>
                <input type="radio" name="status" id="status-sell" value="sell" required
                  checked={form.status === 'sell'} onChange={set('status')} />
                <label htmlFor="status-sell">SELL</label>
                <input type="radio" name="status" id="status-rent" value="rent" required
                  checked={form.status === 'rent'} onChange={set('status')} />
                <label htmlFor="status-rent">RENT</label>
              </div>
            </div>
            <div className="radio-group">
              <label>Furnished:</label>
              <div>
                <input type="radio" name="furnished" id="furnished-yes" value="yes" required
                  checked={form.furnished === 'yes'} onChange={set('furnished')} />
                <label htmlFor="furnished-yes">Yes</label>
                <input type="radio" name="furnished" id="furnished-no" value="no" required
                  checked={form.furnished === 'no'} onChange={set('furnished')} />
                <label htmlFor="furnished-no">No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div>
              <label htmlFor="bedrooms">Bedrooms</label>
              <input type="number" id="bedrooms" min="1" value={form.bedrooms} onChange={setNum('bedrooms')} required />
            </div>
            <div>
              <label htmlFor="bathrooms">Bathrooms</label>
              <input type="number" id="bathrooms" min="1" value={form.bathrooms} onChange={setNum('bathrooms')} required />
            </div>
            <div>
              <label htmlFor="livingrooms">Living Rooms</label>
              <input type="number" id="livingroom" min="1" value={form.livingrooms} onChange={setNum('livingrooms')} required />
            </div>
          </div>

          <div className="centerdiv">
            <div>
              <label htmlFor="more-details">More details</label>
              <textarea id="more-details" placeholder="More details if you like"
                value={form.moreDetails} onChange={set('moreDetails')} />
            </div>
            <div>
              <label>Upload Photos (Max 6):</label>
              <div className="grid-container">
                {slots.map((slot, i) => {
                  const shown = slot.preview || (slot.existingPath ? imageUrl(slot.existingPath) : null);
                  return (
                    <div className="image-upload" key={i}>
                      <label className="custom-file-upload" style={shown ? { display: 'none' } : undefined}>
                        +
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => (fileInputs.current[i] = el)}
                          onChange={(e) => pickFile(i, e)}
                        />
                      </label>
                      {shown && (
                        <img src={shown} className="preview" alt={`Photo ${i + 1}`} style={{ display: 'block' }} />
                      )}
                      <button type="button" className="delete-btn" onClick={() => clearSlot(i)}>Clear</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-group2">
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
          </div>
        </div>
      </form>
    </>
  );
}
