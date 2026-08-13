/* One icon family, one visual language: 24px grid, 1.75 stroke, round caps and
   joins, currentColor. Replaces the emoji and raster PNGs the pages used to mix
   in, which rendered inconsistently and could not be themed. */

const PATHS = {
  home: <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.6" />
      <path d="M2.5 21a6.5 6.5 0 0 1 13 0M16 5.3a3.6 3.6 0 0 1 0 6.9M18 14.6a6.5 6.5 0 0 1 3.5 5.4" />
    </>
  ),
  heart: <path d="M12 20.3 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 0 1 19.4 13z" />,
  star: <path d="m12 3.4 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.8z" />,
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M15 9h3a2 2 0 0 1 2 2v10M3 21h18" />
      <path d="M8 7h3M8 11h3M8 15h3" />
    </>
  ),
  shield: <path d="M12 3l7.5 2.6v5.7c0 4.4-3 8.2-7.5 9.7-4.5-1.5-7.5-5.3-7.5-9.7V5.6z" />,
  shieldCheck: (
    <>
      <path d="M12 3l7.5 2.6v5.7c0 4.4-3 8.2-7.5 9.7-4.5-1.5-7.5-5.3-7.5-9.7V5.6z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  logOut: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8 6 12l4 4M6 12h10" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12S18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.7 6.1A8.6 8.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.4 3.2M6.4 7.5A16 16 0 0 0 2.5 12S6 18 12 18a8.9 8.9 0 0 0 3.5-.7" />
      <path d="M10 10a2.8 2.8 0 0 0 4 4M3.5 3.5l17 17" />
    </>
  ),
  chevronLeft: <path d="m14.5 5.5-7 6.5 7 6.5" />,
  chevronRight: <path d="m9.5 5.5 7 6.5-7 6.5" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.2 2.6 2.6 5-5.2" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.8v5M12 16.2h.01" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10.6 4.1a1.6 1.6 0 0 1 2.8 0l7.2 13a1.6 1.6 0 0 1-1.4 2.4H4.8a1.6 1.6 0 0 1-1.4-2.4z" />
      <path d="M12 9.5v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M10.5 11v5M13.5 11v5" />,
  pencil: <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17zM14.5 6.5l3 3" />,
  flag: <path d="M5 21V4h9l-1 3h6l-1.5 5H12l1 3H5" />,
  badgeCheck: (
    <>
      <path d="M12 2.8l2.3 1.6 2.8-.2 1 2.6 2.3 1.6-.8 2.7.8 2.7-2.3 1.6-1 2.6-2.8-.2L12 21.2l-2.3-1.6-2.8.2-1-2.6-2.3-1.6.8-2.7-.8-2.7 2.3-1.6 1-2.6 2.8.2z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  filter: <path d="M4 6h16l-6 7v6l-4-2v-4z" />,
  mapPin: (
    <>
      <path d="M12 21c4-4.4 6.5-7.4 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 13.6 8 16.6 12 21z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </>
  ),
  bed: <path d="M3 18v-8M3 13h13a4 4 0 0 1 4 4v1M3 18h18M7 9.5h3.5a1.5 1.5 0 0 1 1.5 1.5v2H5.5V11a1.5 1.5 0 0 1 1.5-1.5z" />,
  bath: <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM7 12V6.5A2.5 2.5 0 0 1 11.5 5M8 21l-1 1.5M16 21l1 1.5" />,
  sofa: <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12.5a1.5 1.5 0 0 1 3 0V16h12v-3.5a1.5 1.5 0 0 1 3 0V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />,
  ruler: <path d="M3.6 14.8 14.8 3.6a1.4 1.4 0 0 1 2 0l3.6 3.6a1.4 1.4 0 0 1 0 2L9.2 20.4a1.4 1.4 0 0 1-2 0l-3.6-3.6a1.4 1.4 0 0 1 0-2zM8 10.5l1.8 1.8M11 7.5l1.8 1.8M14 4.5l1.8 1.8" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 17.5 4.4-4.2 3.3 3 2.6-2.4 4.7 4.1" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m3.8 7.3 8.2 6 8.2-6" />
    </>
  ),
  phone: <path d="M6.4 3.5h2.4l1.4 4-2 1.4a10.6 10.6 0 0 0 5 5l1.4-2 4 1.4v2.4a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2z" />,
  upload: <path d="M12 16V4m-4.5 4L12 3.5 16.5 8M4 16v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V16" />,
  fileText: (
    <>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
      <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  inbox: <path d="M3.5 12.5 6 5.2A2 2 0 0 1 7.9 4h8.2a2 2 0 0 1 1.9 1.2l2.5 7.3v5.3a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2zM3.5 12.5h4.2l1.1 2.4h6.4l1.1-2.4h4.2" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m6 18 12-12" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  sliders: <path d="M4 8h9m4 0h3M4 16h4m4 0h8M15 5.5v5M9.5 13.5v5" />,
  key: (
    <>
      <circle cx="8" cy="8" r="4.2" />
      <path d="m11 11 8.5 8.5M16 16l2-2M18.5 18.5l2-2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2m20 0h-2.2M6.5 6.5 4.9 4.9m14.2 14.2-1.6-1.6M6.5 17.5l-1.6 1.6M19.1 4.9l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2z" />,
  monitor: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2.2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </>
  ),
  sortAsc: <path d="M4 7h10M4 12h7M4 17h4M17 5v14m0 0 3-3.2M17 19l-3-3.2" />,
  layers: <path d="m12 3 8.5 4.5L12 12 3.5 7.5zM4 12.4 12 16.6l8-4.2M4 16.8 12 21l8-4.2" />
};

export default function Icon({ name, size = 20, strokeWidth = 1.75, className, ...rest }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}
