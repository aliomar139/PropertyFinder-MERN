import { useEffect, useRef, useState } from 'react';
import { citiesByGovernorate, governorates } from '../data/locations.js';
import { imageUrl } from '../api/client';
import Button, { IconButton } from './ui/Button.jsx';
import Icon from './ui/Icon.jsx';
import { SegmentedField, SelectField, TextAreaField, TextField } from './ui/Field.jsx';
import { Alert } from './ui/Feedback.jsx';

const MAX_PHOTOS = 6;
const emptySlots = () =>
  Array.from({ length: MAX_PHOTOS }, () => ({
    file: null,
    preview: null,
    existingId: '',
    existingPath: null
  }));

/* Shared create / edit form.

   Nineteen inputs on one page is a lot to face at once, so they are grouped
   into four labelled sections in the order someone actually knows the answers:
   where it is, what it is, how many rooms, then photos. Every group is a real
   <fieldset> with a <legend>, so the grouping is announced and not merely drawn.

   The FormData keys are unchanged — the API contract is untouched. */
export default function PropertyForm({
  initial,
  onSubmit,
  onClearImage,
  submitting,
  error,
  mode = 'create'
}) {
  const [form, setForm] = useState({
    governorate: '',
    city: '',
    locationDetails: '',
    type: '',
    area: '',
    price: '',
    status: '',
    furnished: '',
    bedrooms: '',
    bathrooms: '',
    livingrooms: '',
    moreDetails: ''
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
    (initial.images || []).slice(0, MAX_PHOTOS).forEach((img, i) => {
      next[i] = { file: null, preview: null, existingId: img.id, existingPath: img.path };
    });
    setSlots(next);
  }, [initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value.replace(/\D/g, '').slice(0, 9) }));

  const cities = citiesByGovernorate[form.governorate] || [];
  const filled = slots.filter((s) => s.preview || s.existingPath).length;

  function pickFile(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setSlots((s) =>
        s.map((slot, idx) => (idx === i ? { ...slot, file, preview: ev.target.result } : slot))
      );
    reader.readAsDataURL(file);
  }

  function clearSlot(i) {
    const slot = slots[i];
    // An existing image is deleted server-side immediately, matching the
    // original behaviour.
    if (slot.existingId && onClearImage) onClearImage(slot.existingId);
    if (fileInputs.current[i]) fileInputs.current[i].value = '';
    setSlots((s) =>
      s.map((sl, idx) =>
        idx === i ? { file: null, preview: null, existingId: '', existingPath: null } : sl
      )
    );
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
    <form className="pform" onSubmit={handleSubmit}>
      <header className="pform__head">
        <h1 className="pf-page-head__title">
          {mode === 'edit' ? 'Edit your listing' : 'List your property'}
        </h1>
        <p className="pf-page-head__sub">
          {mode === 'edit'
            ? 'Changes go live as soon as you save.'
            : 'Six short groups. The title and description are written for you from what you enter.'}
        </p>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      <fieldset className="pform__group">
        <legend className="pform__legend">
          <Icon name="mapPin" size={16} />
          Where is it?
        </legend>
        <div className="pform__grid">
          <SelectField
            label="Governorate"
            id="governorate"
            required
            value={form.governorate}
            onChange={(e) => setForm((f) => ({ ...f, governorate: e.target.value, city: '' }))}
          >
            <option value="">Select a governorate</option>
            {governorates.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="City"
            id="city"
            required
            value={form.city}
            onChange={set('city')}
            disabled={!form.governorate}
            hint={form.governorate ? undefined : 'Choose a governorate first.'}
          >
            <option value="">Select a city</option>
            {form.city && !cities.includes(form.city) && (
              <option value={form.city}>{form.city}</option>
            )}
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          <TextField
            label="Street or landmark"
            id="locationDetails"
            required
            placeholder="e.g. Rue Gouraud, near the church"
            hint="Shown in full on the listing page."
            value={form.locationDetails}
            onChange={set('locationDetails')}
            className="pform__span"
          />
        </div>
      </fieldset>

      <fieldset className="pform__group">
        <legend className="pform__legend">
          <Icon name="home" size={16} />
          What is it?
        </legend>
        <div className="pform__grid">
          <SelectField label="Type" id="type" required value={form.type} onChange={set('type')}>
            <option value="">Select a type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="cabin">Cabin</option>
          </SelectField>

          <TextField
            label="Area"
            id="area"
            required
            inputMode="numeric"
            placeholder="120"
            hint="In square metres."
            value={form.area}
            onChange={setNum('area')}
          />

          <TextField
            label="Price"
            id="price"
            required
            inputMode="numeric"
            placeholder="85000"
            hint={form.status === 'rent' ? 'US dollars per month.' : 'US dollars.'}
            value={form.price}
            onChange={setNum('price')}
          />
        </div>

        <div className="pform__segments">
          <SegmentedField
            label="Listing type"
            name="status"
            required
            value={form.status}
            onChange={set('status')}
            options={[
              { value: 'sell', label: 'For sale' },
              { value: 'rent', label: 'For rent' }
            ]}
          />
          <SegmentedField
            label="Furnished"
            name="furnished"
            required
            value={form.furnished}
            onChange={set('furnished')}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
          />
        </div>
      </fieldset>

      <fieldset className="pform__group">
        <legend className="pform__legend">
          <Icon name="bed" size={16} />
          How many rooms?
        </legend>
        <div className="pform__grid">
          <TextField
            label="Bedrooms"
            id="bedrooms"
            required
            inputMode="numeric"
            placeholder="2"
            value={form.bedrooms}
            onChange={setNum('bedrooms')}
          />
          <TextField
            label="Bathrooms"
            id="bathrooms"
            required
            inputMode="numeric"
            placeholder="1"
            value={form.bathrooms}
            onChange={setNum('bathrooms')}
          />
          <TextField
            label="Living rooms"
            id="livingrooms"
            required
            inputMode="numeric"
            placeholder="1"
            value={form.livingrooms}
            onChange={setNum('livingrooms')}
          />
        </div>

        <TextAreaField
          label="Anything else worth knowing?"
          id="more-details"
          placeholder="A balcony with a sea view, parking for two cars, recently renovated kitchen…"
          hint="Optional. This is added to the end of the description."
          value={form.moreDetails}
          onChange={set('moreDetails')}
        />
      </fieldset>

      <fieldset className="pform__group">
        <legend className="pform__legend">
          <Icon name="image" size={16} />
          Photos
          <span className="pf-badge pf-badge--neutral">
            {filled} of {MAX_PHOTOS}
          </span>
        </legend>
        <p className="pf-hint">
          The first photo becomes the cover image. Landscape shots look best in the grid.
        </p>

        <ul className="pform__photos">
          {slots.map((slot, i) => {
            const shown = slot.preview || (slot.existingPath ? imageUrl(slot.existingPath) : null);
            const inputId = `photo-${i + 1}`;
            return (
              <li className="pform__photo" key={i}>
                {shown ? (
                  <>
                    <img src={shown} alt={`Photo ${i + 1}`} />
                    {i === 0 && <span className="pf-badge pform__cover">Cover</span>}
                    <IconButton
                      solid
                      className="pform__photo-clear"
                      label={`Remove photo ${i + 1}`}
                      icon="x"
                      onClick={() => clearSlot(i)}
                    />
                  </>
                ) : (
                  <label className="pform__photo-add" htmlFor={inputId}>
                    <Icon name="plus" size={22} />
                    <span className="pf-sr-only">Add photo {i + 1}</span>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileInputs.current[i] = el)}
                      onChange={(e) => pickFile(i, e)}
                    />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Sticky submit bar: on a form this long the action would otherwise be
          a scroll away from wherever you finished typing. */}
      <div className="pform__submit">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          loadingLabel={mode === 'edit' ? 'Saving…' : 'Publishing…'}
        >
          {mode === 'edit' ? 'Save changes' : 'Publish listing'}
        </Button>
        <p className="pf-caption">Required fields are marked with an asterisk.</p>
      </div>
    </form>
  );
}
