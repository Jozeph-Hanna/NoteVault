const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts/Notes table
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed some sample data
  db.get("SELECT COUNT(*) as count FROM notes", (err, row) => {
    if (!err && row.count === 0) {
      const sampleNotes = [
        ["Getting Started", "Welcome to NoteVault! This is your first note. Start creating and organizing your thoughts.", "Admin"],
        ["Design Principles", "Good design is invisible. It solves problems without calling attention to itself.", "Admin"],
        ["Web Development Tips", "Always validate user input on the server side. Never trust the client. Keep your dependencies updated.", "Admin"],
      ];
      sampleNotes.forEach(([title, content, author]) => {
        db.run("INSERT INTO notes (title, content, author) VALUES (?, ?, ?)", [title, content, author]);
      });
    }
  });
});

// ===================== API ROUTES =====================

// --- NOTES ---
app.get('/api/notes', (req, res) => {
  db.all("SELECT * FROM notes ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/notes', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author)
    return res.status(400).json({ error: 'All fields required.' });

  db.run("INSERT INTO notes (title, content, author) VALUES (?, ?, ?)",
    [title, content, author],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM notes WHERE id = ?", [this.lastID], (err, row) => {
        res.status(201).json(row);
      });
    }
  );
});

app.delete('/api/notes/:id', (req, res) => {
  db.run("DELETE FROM notes WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ message: 'Deleted successfully.' });
  });
});

app.put('/api/notes/:id', (req, res) => {
  const { title, content } = req.body;
  db.run("UPDATE notes SET title = ?, content = ? WHERE id = ?",
    [title, content, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM notes WHERE id = ?", [req.params.id], (err, row) => {
        res.json(row);
      });
    }
  );
});

// --- USERS ---
app.get('/api/users', (req, res) => {
  db.all("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email required.' });

  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered.' });
        return res.status(500).json({ error: err.message });
      }
      db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [this.lastID], (err, row) => {
        res.status(201).json(row);
      });
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted.' });
  });
});

// --- STATS ---
app.get('/api/stats', (req, res) => {
  const stats = {};
  db.get("SELECT COUNT(*) as count FROM notes", (err, row) => {
    stats.notes = row?.count || 0;
    db.get("SELECT COUNT(*) as count FROM users", (err2, row2) => {
      stats.users = row2?.count || 0;
      db.get("SELECT MAX(created_at) as latest FROM notes", (err3, row3) => {
        stats.latestNote = row3?.latest || null;
        res.json(stats);
      });
    });
  });
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'public', 'notes.html')));
app.get('/users', (req, res) => res.sendFile(path.join(__dirname, 'public', 'users.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 NoteVault running at http://localhost:${PORT}\n`);
});
