import { useEffect, useState } from 'react';
import { citiesByGovernorate, governorates } from '../data/locations.js';
import useMediaQuery from '../hooks/useMediaQuery.js';
import Button from './ui/Button.jsx';
import Icon from './ui/Icon.jsx';
import { SelectField, TextField } from './ui/Field.jsx';

export const EMPTY_FILTERS = {
  type: '',
  governorate: '',
  city: '',
  min_price: '',
  max_price: '',
  furnished: '',
  lease_type: '',
  sort_by: '',
  sort_order: 'asc'
};

const LABELS = {
  type: 'Type',
  governorate: 'Governorate',
  city: 'City',
  min_price: 'Min price',
  max_price: 'Max price',
  furnished: 'Furnished',
  lease_type: 'Listing'
};

const VALUE_LABELS = {
  furnished: { 1: 'Furnished', 0: 'Unfurnished' },
  lease_type: { sell: 'For sale', rent: 'For rent' }
};

function describe(key, value) {
  if (VALUE_LABELS[key]?.[value]) return VALUE_LABELS[key][value];
  if (key === 'min_price') return `From $${Number(value).toLocaleString('en-US')}`;
  if (key === 'max_price') return `Up to $${Number(value).toLocaleString('en-US')}`;
  if (key === 'governorate') {
    return governorates.find((g) => g.value === value)?.label || value;
  }
  return value;
}

/* The filter surface.

   On wide screens it is an always-visible panel. On narrow screens the same
   controls collapse behind one "Filters" button that carries a count, so the
   listings — the thing people came for — are not pushed below the fold by nine
   inputs. Applied filters are then echoed back as removable chips, because the
   collapsed panel would otherwise hide the reason a result set looks empty. */
export default function PropertyFilters({ applied, onApply }) {
  const isWide = useMediaQuery('(min-width: 900px)');
  const [draft, setDraft] = useState(applied);
  const [open, setOpen] = useState(false);

  // Keep the draft in step when filters are cleared from a chip outside.
  useEffect(() => setDraft(applied), [applied]);

  const set = (k) => (e) => setDraft((f) => ({ ...f, [k]: e.target.value }));
  const digits = (k) => (e) =>
    setDraft((f) => ({ ...f, [k]: e.target.value.replace(/\D/g, '').slice(0, 9) }));

  const cities = citiesByGovernorate[draft.governorate] || [];
  const activeKeys = Object.keys(LABELS).filter((k) => applied[k] !== '');
  const expanded = isWide || open;

  function submit(e) {
    e.preventDefault();
    onApply(draft);
    if (!isWide) setOpen(false);
  }

  function clearOne(key) {
    const next = { ...applied, [key]: '' };
    if (key === 'governorate') next.city = '';
    onApply(next);
  }

  return (
    <section className="pfilters" aria-labelledby="filters-heading">
      <div className="pfilters__bar">
        <h2 className="pfilters__heading" id="filters-heading">
          <Icon name="sliders" size={17} />
          Filters
          {activeKeys.length > 0 && (
            <span className="pf-badge pf-badge--brand">{activeKeys.length}</span>
          )}
        </h2>

        {!isWide && (
          <Button
            variant="secondary"
            size="sm"
            iconEnd={open ? 'x' : 'chevronDown'}
            aria-expanded={open}
            aria-controls="filters-body"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Refine'}
          </Button>
        )}
      </div>

      {activeKeys.length > 0 && (
        <ul className="pfilters__chips">
          {activeKeys.map((k) => (
            <li key={k}>
              <button type="button" className="pfilters__chip" onClick={() => clearOne(k)}>
                <span className="pf-sr-only">Remove filter </span>
                <span className="pfilters__chip-key">{LABELS[k]}:</span>
                {describe(k, applied[k])}
                <Icon name="x" size={13} />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="pfilters__chip pfilters__chip--clear"
              onClick={() => onApply(EMPTY_FILTERS)}
            >
              Clear all
            </button>
          </li>
        </ul>
      )}

      <form
        className="pfilters__body"
        id="filters-body"
        hidden={!expanded}
        onSubmit={submit}
      >
        <div className="pfilters__grid">
          <SelectField label="Property type" id="type" value={draft.type} onChange={set('type')}>
            <option value="">Any type</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Cabin">Cabin</option>
          </SelectField>

          <SelectField
            label="Governorate"
            id="governorate"
            value={draft.governorate}
            onChange={(e) => setDraft((f) => ({ ...f, governorate: e.target.value, city: '' }))}
          >
            <option value="">All governorates</option>
            {governorates.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="City"
            id="city"
            value={draft.city}
            onChange={set('city')}
            disabled={!draft.governorate}
            hint={draft.governorate ? undefined : 'Pick a governorate first.'}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          <SelectField label="Listing" id="lease_type" value={draft.lease_type} onChange={set('lease_type')}>
            <option value="">Sale and rent</option>
            <option value="sell">For sale</option>
            <option value="rent">For rent</option>
          </SelectField>

          <TextField
            label="Min price"
            id="min_price"
            inputMode="numeric"
            placeholder="No minimum"
            value={draft.min_price}
            onChange={digits('min_price')}
          />

          <TextField
            label="Max price"
            id="max_price"
            inputMode="numeric"
            placeholder="No maximum"
            value={draft.max_price}
            onChange={digits('max_price')}
          />

          <SelectField label="Furnished" id="furnished" value={draft.furnished} onChange={set('furnished')}>
            <option value="">Either</option>
            <option value="1">Furnished</option>
            <option value="0">Unfurnished</option>
          </SelectField>

        </div>

        <div className="pfilters__actions">
          <Button type="submit" variant="primary" icon="search">
            Apply filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              onApply(EMPTY_FILTERS);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   The results bar: how many results there are, and how they are ordered.

   Sorting used to live inside the filter form as two coupled selects (a field
   for "sort by" and a second, sometimes-disabled field for "order") behind an
   Apply button. That is the wrong model twice over: ordering is not a filter —
   it never changes WHICH properties you see — and splitting one decision across
   two controls means four interactions to say "cheapest first".

   Here it is one control, applied on change, sitting directly above the results
   it describes. The API contract is unchanged: each option still resolves to
   the same sort_by / sort_order pair the server already accepts.
   ------------------------------------------------------------------------- */
const SORT_OPTIONS = [
  // `order: 'asc'` mirrors EMPTY_FILTERS so the untouched default matches this
  // option instead of falling through to an empty select.
  { value: '', label: 'Featured', by: '', order: 'asc' },
  { value: 'price-asc', label: 'Price: low to high', by: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Price: high to low', by: 'price', order: 'desc' },
  { value: 'area-desc', label: 'Largest first', by: 'area', order: 'desc' },
  { value: 'area-asc', label: 'Smallest first', by: 'area', order: 'asc' },
  { value: 'date-desc', label: 'Newest first', by: 'date', order: 'desc' },
  { value: 'date-asc', label: 'Oldest first', by: 'date', order: 'asc' }
];

export function ResultsBar({ applied, onApply, count, loading }) {
  const current =
    SORT_OPTIONS.find((o) => o.by === applied.sort_by && o.order === applied.sort_order)?.value ??
    '';

  function change(e) {
    const opt = SORT_OPTIONS.find((o) => o.value === e.target.value) || SORT_OPTIONS[0];
    onApply({ ...applied, sort_by: opt.by, sort_order: opt.order });
  }

  return (
    <div className="results-bar">
      {/* Polite, not assertive: the count updating should not interrupt whatever
          a screen-reader user is in the middle of reading. */}
      <p className="results-bar__count" aria-live="polite">
        {loading ? (
          <span className="pf-muted">Loading listings…</span>
        ) : (
          <>
            <strong className="pf-num">{count}</strong>{' '}
            {count === 1 ? 'property' : 'properties'}
          </>
        )}
      </p>

      <label className="results-bar__sort">
        <Icon name="sortAsc" size={16} aria-hidden="true" />
        <span className="results-bar__sort-label">Sort</span>
        <select
          className="results-bar__select"
          value={current}
          onChange={change}
          aria-label="Sort listings"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
