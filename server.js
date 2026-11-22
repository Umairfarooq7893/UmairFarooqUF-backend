require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// This connects to your Supabase Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- ROUTES ---

// 1. Submit Podcast Booking
app.post('/api/book-podcast', async (req, res) => {
  try {
    const { name, designation, company, contact, location, locationDetails, notes } = req.body;
    await pool.query(
      'INSERT INTO podcast_bookings (name, designation, company, contact_number, preferred_location, location_details, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, designation, company, contact, location, locationDetails || '', notes]
    );
    res.status(201).json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
});

// 2. Submit Partnership
app.post('/api/partnership', async (req, res) => {
  try {
    const { name, company, email, type, extraDetails, message } = req.body;
    await pool.query(
      'INSERT INTO partnerships (name, company, email, partnership_type, extra_details, message) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, company, email, type, extraDetails || '', message]
    );
    res.status(201).json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
});

// 3. Submit Idea
app.post('/api/ideas', async (req, res) => {
  try {
    const { title, category, problem, solution, description, name, contact } = req.body;
    await pool.query(
      'INSERT INTO ideas (title, category, problem, solution, description, author_name, author_contact) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [title, category, problem, solution, description, name, contact]
    );
    res.status(201).json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));