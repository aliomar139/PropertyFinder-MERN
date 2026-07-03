# PropertyFinder — MERN Migration

Full migration of the legacy PHP/MySQL PropertyFinder app to MongoDB + Express + React + Node.js. All original features and behavior are preserved; no PHP remains in this folder.

## Folder structure

```
mern/
├── server/                  # Node.js + Express + Mongoose API
│   ├── src/
│   │   ├── server.js        # entry point (serves API + built client + /uploads)
│   │   ├── config/db.js
│   │   ├── models/          # User, Property, Report, VerificationRequest
│   │   ├── controllers/     # auth, users, properties, favorites, reports, verifications, admin
│   │   ├── routes/
│   │   ├── middleware/      # JWT auth, multer uploads, error handler
│   │   └── utils/           # nodemailer, legacy title/description generator
│   ├── scripts/
│   │   ├── migrate.js       # MySQL -> MongoDB data migration (+ copies uploads/)
│   │   └── seed.js          # creates an admin account for fresh installs
│   ├── uploads/             # property photos, id_docs/, profiles/ (created at runtime)
│   └── .env.example
└── client/                  # React 18 + Vite + React Router + Axios
    ├── public/pictures/     # original static assets
    └── src/
        ├── pages/           # one page per legacy PHP page (incl. pages/admin/)
        ├── components/      # Navbar, PropertyGrid, PropertyForm, ...
        ├── context/AuthContext.jsx   # replaces PHP sessions (JWT)
        ├── styles/          # original CSS files, unchanged
        └── api/client.js    # axios instance with Bearer token
```

## Legacy page → new route map

| PHP page | React route | API |
|---|---|---|
| welcome.php | `/` | — |
| login.php | `/login` | `POST /api/auth/login` |
| signUp.php | `/signup` | `POST /api/auth/signup` |
| reset.php | `/reset` | `POST /api/auth/reset-code` |
| change-pass.php | `/change-pass` | `POST /api/auth/verify-reset-code`, `POST /api/auth/reset-password` |
| userchange-pass.php | `/user/change-pass` | `POST /api/auth/change-password` |
| home.php | `/home` | `GET /api/properties` (same filter/sort params) |
| listPage.php | `/list` | `POST /api/properties` (multipart, photo1–photo6) |
| property_details.php | `/property/:id` | `GET /api/properties/:id`, `POST /api/favorites/:id/toggle`, `POST /api/reports` |
| editproperty-details.php | `/property/:id/edit` | `PUT /api/properties/:id` |
| clear_image.php | (Clear button) | `DELETE /api/properties/:id/images/:imageId` |
| delete_property.php | (Delete button) | `DELETE /api/properties/:id` |
| my-propreties.php | `/my-properties` | `GET /api/properties/mine` |
| favorites.php | `/favorites` | `GET /api/favorites` |
| user.php | `/user` | `GET/PUT /api/users/me` |
| user_details.php | `/users/:id` | `GET /api/users/:id` |
| verify_req.php | `/verify` | `POST /api/verifications` |
| admin.php | `/admin` | — |
| user_management.php | `/admin/users` | `GET /api/admin/users`, `POST /api/admin/users/:id/ban` |
| banned_owners.php | `/admin/banned` | `GET /api/admin/users/banned`, `POST /api/admin/users/:id/unban` |
| property_management.php | `/admin/properties` | `GET /api/admin/properties` |
| reports.php | `/admin/reports` | `GET /api/reports`, `DELETE /api/reports/:id` |
| all_verify.php | `/admin/verify-requests` | `GET /api/verifications/pending`, `PUT /api/verifications/:id/approve\|reject` |

## Schema mapping (MySQL → MongoDB)

- `account` → **users** — plus `favorites` join table embedded as an array of property refs. Numeric flags kept as-is (`role` 0/1, `status` 0 active / 1 banned, `locked`, `verify`, `tries`).
- `property` + `property_details` + `property_images` → **properties** — 1‑to‑1 details embedded as `details`, images embedded as an array (max 6).
- `report` → **reports** — unique index on (user, property), same as the PHP duplicate check.
- `verification_requests` → **verificationrequests** — status 0 pending / 1 approved / 2 rejected.

## Key decisions

- **Sessions → JWT.** Login returns a Bearer token; route guards replicate every `$_SESSION` redirect.
- **Passwords.** New passwords use bcrypt. Migrated accounts keep their legacy SHA‑256 hash (`passwordAlgo: 'sha256'`) and are upgraded to bcrypt transparently on first successful login — nobody has to reset.
- **Behavior parity.** 5 failed logins lock the account until password reset; banning deletes the user's properties; title/description are auto-generated server-side with the exact legacy wording; one report per user per property; only role‑0 users who don't own the property can favorite/report it.
- **Email.** PHPMailer → Nodemailer, same Gmail SMTP settings, now in `.env` instead of source code.
- **Uploads.** Multer writes to `server/uploads/` with the legacy `time()_name` convention; served at `/uploads/*`.

## Running it

Prerequisites: Node 18+, MongoDB running locally (or an Atlas URI).

```bash
# 1. Backend
cd mern/server
cp .env.example .env        # set JWT_SECRET, SMTP_PASS, MONGO_URI
npm install
npm run seed                # fresh DB: creates admin@propertyfinder.com / admin12345
# — OR, to bring over your existing MySQL data + uploaded files:
npm run migrate
npm run dev                 # API on http://localhost:5000

# 2. Frontend (second terminal)
cd mern/client
npm install
npm run dev                 # app on http://localhost:3000 (proxies /api + /uploads)
```

Production: `npm run build` in `client/`, then `npm start` in `server/` — Express serves the built app and the API from port 5000.

Smoke test (spins up an in-memory MongoDB, exercises signup/login/lockout, legacy-password upgrade, property CRUD, filters, favorites, reports, ban/unban):

```bash
cd mern/server && npm run smoke
```

## Notes / intentional fixes

- The legacy report form stored `property_details.id` in `report.property_id` while the reports page joined it against `property.id` (worked only because the IDs happened to line up). The new API stores the actual property reference.
- SQL-injectable string concatenation in filters/updates is gone (Mongoose parameterization), and admin action endpoints now actually verify the caller is an admin (several PHP action scripts didn't).
- The email/phone uniqueness checks now also apply when editing a profile (the PHP page allowed duplicates there).
