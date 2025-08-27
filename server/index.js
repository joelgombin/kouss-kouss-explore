import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'likes.db'));

// Create likes table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS dish_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    dish_index INTEGER NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, dish_index)
  )
`);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes

// Get likes for a specific dish
app.get('/api/likes/:restaurantId/:dishIndex', (req, res) => {
  try {
    const { restaurantId, dishIndex } = req.params;
    const stmt = db.prepare('SELECT likes_count FROM dish_likes WHERE restaurant_id = ? AND dish_index = ?');
    const result = stmt.get(restaurantId, parseInt(dishIndex));
    
    res.json({ 
      restaurantId, 
      dishIndex: parseInt(dishIndex), 
      likes: result ? result.likes_count : 0 
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    res.status(500).json({ error: 'Failed to get likes' });
  }
});

// Get all likes (for bulk loading)
app.get('/api/likes', (req, res) => {
  try {
    const stmt = db.prepare('SELECT restaurant_id, dish_index, likes_count FROM dish_likes');
    const results = stmt.all();
    
    const likesMap = {};
    results.forEach(row => {
      const key = `${row.restaurant_id}-${row.dish_index}`;
      likesMap[key] = row.likes_count;
    });
    
    res.json(likesMap);
  } catch (error) {
    console.error('Error getting all likes:', error);
    res.status(500).json({ error: 'Failed to get likes' });
  }
});

// Add a like to a dish
app.post('/api/likes/:restaurantId/:dishIndex', (req, res) => {
  try {
    const { restaurantId, dishIndex } = req.params;
    const dishIndexInt = parseInt(dishIndex);
    
    // Use UPSERT to either insert or update
    const stmt = db.prepare(`
      INSERT INTO dish_likes (restaurant_id, dish_index, likes_count, updated_at) 
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(restaurant_id, dish_index) DO UPDATE SET 
        likes_count = likes_count + 1,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(restaurantId, dishIndexInt);
    
    // Get the updated count
    const getStmt = db.prepare('SELECT likes_count FROM dish_likes WHERE restaurant_id = ? AND dish_index = ?');
    const result = getStmt.get(restaurantId, dishIndexInt);
    
    res.json({ 
      restaurantId, 
      dishIndex: dishIndexInt, 
      likes: result.likes_count,
      message: 'Like added successfully'
    });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

// Get top liked dishes
app.get('/api/likes/top/:limit?', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const stmt = db.prepare(`
      SELECT restaurant_id, dish_index, likes_count 
      FROM dish_likes 
      ORDER BY likes_count DESC 
      LIMIT ?
    `);
    const results = stmt.all(limit);
    
    res.json(results);
  } catch (error) {
    console.error('Error getting top likes:', error);
    res.status(500).json({ error: 'Failed to get top likes' });
  }
});

// Serve the React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.close();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend dev server should proxy /api requests to this server`);
});