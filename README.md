<div align="center">

# 🏡 PropertyFinder

**A full-stack real-estate listing platform — migrated from legacy PHP/MySQL to a modern MERN stack.**

Browse, list, and manage properties with authentication, favorites, reporting, owner verification, and a complete admin dashboard.

<p>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=node.js&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
</p>

</div>

---

## ✨ Features

| | |
|---|---|
| 🔐 **Auth & Sessions** | JWT-based login/signup, password reset via email codes, account lockout after 5 failed attempts |
| 🏘️ **Listings** | Create, edit, and delete properties with up to 6 photos each; rich filtering & sorting |
| ❤️ **Favorites** | Save properties to a personal favorites list |
| 🚩 **Reports** | Flag listings (one report per user per property) |
| ✅ **Owner Verification** | Users submit ID documents; admins approve or reject requests |
| 🛡️ **Admin Dashboard** | Manage users, ban/unban owners, moderate properties, handle reports & verifications |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Database** | MongoDB + Mongoose ODM |
| **Backend** | Node.js, Express, JWT auth, Multer (uploads), Nodemailer (email) |
| **Frontend** | React 18, Vite, React Router, Axios |
| **Security** | bcrypt password hashing, JWT route guards, parameterized queries |

---

## 🚀 Quick Start

> **Prerequisites:** [Node.js 18+](https://nodejs.org) and a running [MongoDB](https://www.mongodb.com/try/download/community) instance (local or an [Atlas](https://www.mongodb.com/atlas) connection string).

The app has **two parts** — the API (`server/`) and the web client (`client/`). Run each in its own terminal.

### 1️⃣ Backend — API

```bash
cd server
npm install
cp .env.example .env      # then edit .env (see Configuration below)
npm run seed              # creates an admin login on a fresh database
npm run dev               # ▶ API running at http://localhost:5000
```

### 2️⃣ Frontend — Web Client

```bash
cd client
npm install
npm run dev               # ▶ App running at http://localhost:3000
```

Open **http://localhost:3000** in your browser — you're ready to go. 🎉

**Default admin login** (created by `npm run seed`):

```
Email:    admin@propertyfinder.com
Password: admin12345
```

---

## ⚙️ Configuration

All backend settings live in `server/.env` (copied from `.env.example`):

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — **set a long random value** |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email server for password-reset codes |
| `MAIL_FROM_NAME` | Display name on outgoing emails |
| `MYSQL_*` | Legacy database credentials — only needed if running the migration script |

---

## 📜 Available Scripts

**Server** (`cd server`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with live reload |
| `npm start` | Start the API in production (also serves the built client) |
| `npm run seed` | Create an admin account on a fresh database |
| `npm run migrate` | Import existing MySQL data + uploaded files into MongoDB |
| `npm run smoke` | Run an end-to-end smoke test against an in-memory MongoDB |

**Client** (`cd client`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |

### 🏭 Production

```bash
cd client && npm run build     # build the static frontend
cd ../server && npm start      # Express serves the API + built app on port 5000
```

---

## 📁 Project Structure

```
mern/
├── server/                   # Node.js + Express + Mongoose API
│   ├── src/
│   │   ├── server.js         # entry point (serves API + built client + /uploads)
│   │   ├── config/db.js
│   │   ├── models/           # User, Property, Report, VerificationRequest
│   │   ├── controllers/      # auth, users, properties, favorites, reports, verifications, admin
│   │   ├── routes/
│   │   ├── middleware/       # JWT auth, multer uploads, error handler
│   │   └── utils/            # nodemailer, legacy title/description generator
│   ├── scripts/
│   │   ├── migrate.js        # MySQL → MongoDB data migration (+ copies uploads/)
│   │   └── seed.js           # creates an admin account for fresh installs
│   ├── uploads/              # property photos, profiles/ (id_docs/ kept out of git)
│   └── .env.example
└── client/                   # React 18 + Vite + React Router + Axios
    ├── public/pictures/      # static assets
    └── src/
        ├── pages/            # one page per screen (incl. pages/admin/)
        ├── components/       # Navbar, PropertyGrid, PropertyForm, ...
        ├── context/          # AuthContext.jsx — JWT-based auth state
        ├── styles/           # CSS files
        └── api/client.js     # axios instance with Bearer token
```

---

## 🗺️ Route & API Reference

<details>
<summary><strong>Legacy page → React route → API endpoint</strong> (click to expand)</summary>

| Screen | React route | API |
|---|---|---|
| Welcome | `/` | — |
| Login | `/login` | `POST /api/auth/login` |
| Sign up | `/signup` | `POST /api/auth/signup` |
| Reset password | `/reset` | `POST /api/auth/reset-code` |
| Change (via code) | `/change-pass` | `POST /api/auth/verify-reset-code`, `POST /api/auth/reset-password` |
| Change (logged in) | `/user/change-pass` | `POST /api/auth/change-password` |
| Home / browse | `/home` | `GET /api/properties` (filter/sort params) |
| Create listing | `/list` | `POST /api/properties` (multipart, photo1–photo6) |
| Property details | `/property/:id` | `GET /api/properties/:id`, `POST /api/favorites/:id/toggle`, `POST /api/reports` |
| Edit property | `/property/:id/edit` | `PUT /api/properties/:id` |
| Clear image | (Clear button) | `DELETE /api/properties/:id/images/:imageId` |
| Delete property | (Delete button) | `DELETE /api/properties/:id` |
| My properties | `/my-properties` | `GET /api/properties/mine` |
| Favorites | `/favorites` | `GET /api/favorites` |
| My profile | `/user` | `GET/PUT /api/users/me` |
| User details | `/users/:id` | `GET /api/users/:id` |
| Request verification | `/verify` | `POST /api/verifications` |
| Admin home | `/admin` | — |
| User management | `/admin/users` | `GET /api/admin/users`, `POST /api/admin/users/:id/ban` |
| Banned owners | `/admin/banned` | `GET /api/admin/users/banned`, `POST /api/admin/users/:id/unban` |
| Property management | `/admin/properties` | `GET /api/admin/properties` |
| Reports | `/admin/reports` | `GET /api/reports`, `DELETE /api/reports/:id` |
| Verification requests | `/admin/verify-requests` | `GET /api/verifications/pending`, `PUT /api/verifications/:id/approve\|reject` |

</details>

---

## 🔄 Migration Notes

<details>
<summary><strong>Schema mapping (MySQL → MongoDB)</strong></summary>

- `account` → **users** — `favorites` join table embedded as an array of property refs. Numeric flags kept as-is (`role`, `status`, `locked`, `verify`, `tries`).
- `property` + `property_details` + `property_images` → **properties** — 1-to-1 details embedded as `details`, images embedded as an array (max 6).
- `report` → **reports** — unique index on (user, property), matching the PHP duplicate check.
- `verification_requests` → **verificationrequests** — status `0` pending / `1` approved / `2` rejected.

</details>

<details>
<summary><strong>Key design decisions & intentional fixes</strong></summary>

**Decisions**
- **Sessions → JWT.** Login returns a Bearer token; route guards replicate every `$_SESSION` redirect.
- **Passwords.** New passwords use bcrypt. Migrated accounts keep their legacy SHA-256 hash and are transparently upgraded to bcrypt on first successful login — no forced resets.
- **Behavior parity.** 5 failed logins lock the account until reset; banning removes the user's properties; titles/descriptions are auto-generated server-side with the exact legacy wording; one report per user per property.
- **Email.** PHPMailer → Nodemailer, same SMTP settings, now in `.env` rather than source.
- **Uploads.** Multer writes to `server/uploads/` using the legacy `time()_name` convention, served at `/uploads/*`.

**Fixes carried over from the legacy app**
- Reports now store the actual property reference (the PHP app relied on IDs coincidentally lining up across tables).
- SQL-injectable string concatenation is gone (Mongoose parameterization), and admin endpoints now properly verify the caller is an admin.
- Email/phone uniqueness is now enforced when editing a profile, not just at signup.

</details>

---

<div align="center">
<sub>Migrated from PHP/MySQL to the MERN stack — all original features and behavior preserved.</sub>
</div>
