# ⬡ NoteVault — Full-Stack App

A clean, full-stack web application built with:

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite (via `sqlite3` package)

---

## 📁 Project Structure

```
notevault/
├── server.js              # Express backend + REST API
├── package.json
├── database.db            # Auto-created SQLite file
└── public/
    ├── index.html         # Dashboard (Page 1)
    ├── notes.html         # Notes CRUD (Page 2)
    ├── users.html         # User Registry (Page 3)
    ├── style.css          # Shared styles
    └── app.js             # Shared JS utilities
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

### 3. Open in browser

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Notes
| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/notes       | Get all notes      |
| POST   | /api/notes       | Create a note      |
| PUT    | /api/notes/:id   | Update a note      |
| DELETE | /api/notes/:id   | Delete a note      |

### Users
| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/users       | Get all users      |
| POST   | /api/users       | Register a user    |
| DELETE | /api/users/:id   | Delete a user      |

### Stats
| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/stats       | Dashboard stats    |

---

## 📄 Pages

1. **Dashboard** (`/`) — Overview stats + recent notes
2. **Notes** (`/notes`) — Full CRUD with search, create, edit, delete
3. **Users** (`/users`) — Register & manage users with table view

---

## 🗃️ Database Schema

```sql
-- Notes table
CREATE TABLE notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  author      TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
