require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- PUBLIC ROUTES (Forms) ---
app.post('/api/book-podcast', async (req, res) => {
  try {
    const { name, designation, company, contact, location, locationDetails, notes } = req.body;
    await pool.query(
      'INSERT INTO podcast_bookings (name, designation, company, contact_number, preferred_location, location_details, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, designation, company || '', contact, location, locationDetails || '', notes || '']
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partnership', async (req, res) => {
  try {
    const { name, company, email, type, extraDetails, message } = req.body;
    await pool.query(
      'INSERT INTO partnerships (name, company, email, partnership_type, extra_details, message) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, company || '', email, type, extraDetails || '', message]
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ideas', async (req, res) => {
  try {
    const { title, category, problem, solution, description, name, contact } = req.body;
    await pool.query(
      'INSERT INTO ideas (title, category, problem, solution, description, author_name, author_contact) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [title, category, problem, solution, description, name, contact]
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN LOGIN ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

// --- AUTH MIDDLEWARE ---
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ success: false });
  try {
    jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch (err) { res.status(401).json({ success: false }); }
}

// --- PROTECTED ADMIN ROUTES ---
app.get('/api/admin/bookings', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM podcast_bookings ORDER BY created_at DESC');
  res.json(result.rows);
});

app.get('/api/admin/partnerships', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM partnerships ORDER BY created_at DESC');
  res.json(result.rows);
});

app.get('/api/admin/ideas', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM ideas ORDER BY created_at DESC');
  res.json(result.rows);
});

app.delete('/api/admin/:table/:id', requireAuth, async (req, res) => {
  const { table, id } = req.params;
  const validTables = ['podcast_bookings', 'partnerships', 'ideas'];
  if (!validTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });
  await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));