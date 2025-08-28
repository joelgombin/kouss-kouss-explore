import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database with persistent storage  
// Use /app/data in production (CapRover sets PORT=3000), local directory in development
const dataDir = process.env.PORT === '3000' ? '/app/data' : __dirname;
const dbPath = path.join(dataDir, 'likes.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create uploads directory for photos
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(dbPath);
console.log(`Database initialized at: ${dbPath}`);

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

// Create photos table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS dish_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    dish_index INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Configure multer for photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Serve uploaded photos
app.use('/uploads', express.static(uploadsDir));

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

// Photo API Routes

// Upload a photo for a dish
app.post('/api/photos/:restaurantId/:dishIndex', upload.single('photo'), async (req, res) => {
  try {
    const { restaurantId, dishIndex } = req.params;
    const dishIndexInt = parseInt(dishIndex);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadsDir, filename);
    
    // Process image with sharp (resize and optimize)
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    
    // Get image metadata
    const metadata = await sharp(processedImage).metadata();
    
    // Save to filesystem
    await fs.promises.writeFile(filepath, processedImage);
    
    // Save metadata to database
    const stmt = db.prepare(`
      INSERT INTO dish_photos (restaurant_id, dish_index, filename, original_name, file_size, width, height)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      restaurantId,
      dishIndexInt,
      filename,
      req.file.originalname,
      processedImage.length,
      metadata.width,
      metadata.height
    );
    
    res.json({
      id: result.lastInsertRowid,
      filename,
      url: `/uploads/${filename}`,
      width: metadata.width,
      height: metadata.height,
      message: 'Photo uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Get all photos for a specific dish
app.get('/api/photos/:restaurantId/:dishIndex', (req, res) => {
  try {
    const { restaurantId, dishIndex } = req.params;
    const stmt = db.prepare('SELECT * FROM dish_photos WHERE restaurant_id = ? AND dish_index = ? ORDER BY created_at DESC');
    const photos = stmt.all(restaurantId, parseInt(dishIndex));
    
    // Add full URL to each photo
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/${photo.filename}`,
      thumbnail_url: `/uploads/${photo.filename}` // Same for now, could add thumb generation later
    }));
    
    res.json(photosWithUrls);
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
});

// Delete a photo (optional - for admin or user who uploaded)
app.delete('/api/photos/:photoId', (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Get photo info first
    const getStmt = db.prepare('SELECT * FROM dish_photos WHERE id = ?');
    const photo = getStmt.get(parseInt(photoId));
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Delete from filesystem
    const filepath = path.join(uploadsDir, photo.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    // Delete from database
    const deleteStmt = db.prepare('DELETE FROM dish_photos WHERE id = ?');
    deleteStmt.run(parseInt(photoId));
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Health check endpoint for CapRover
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Closing database connection...`);
  db.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend dev server should proxy /api requests to this server`);
  
  // Check if dist directory exists
  const distPath = path.join(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.html');
  console.log(`Dist path: ${distPath}`);
  console.log(`Index file exists: ${fs.existsSync(indexPath)}`);
});