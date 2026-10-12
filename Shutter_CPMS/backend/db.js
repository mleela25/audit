const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'shutter_cms.db');
const db = new Database(dbPath);

// Initialize tables with all required modules
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'photographer', -- admin, photographer, client
    avatar TEXT,
    bio TEXT,
    language TEXT DEFAULT 'English',
    timezone TEXT DEFAULT 'UTC+0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photographer_id INTEGER,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    last_activity TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photographer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photographer_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    category TEXT,
    is_private BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photographer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER,
    title TEXT NOT NULL,
    original_url TEXT NOT NULL,
    compressed_url TEXT,
    watermarked_url TEXT,
    category TEXT,
    tags TEXT,
    size INTEGER,
    downloads INTEGER DEFAULT 0,
    engagement_score REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(album_id) REFERENCES albums(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photographer_id INTEGER,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    shoot_date TEXT,
    shoot_type TEXT,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photographer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER,
    client_id INTEGER,
    comment TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(image_id) REFERENCES images(id),
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    client_name TEXT,
    activity_type TEXT,
    album_name TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    watermark_text TEXT DEFAULT 'Shutter CMS',
    watermark_opacity REAL DEFAULT 0.5,
    watermark_size INTEGER DEFAULT 20,
    watermark_position TEXT DEFAULT 'bottom-right',
    watermark_color TEXT DEFAULT '#ffffff',
    watermark_font TEXT DEFAULT 'sans-serif',
    compression_quality INTEGER DEFAULT 80,
    allow_client_downloads BOOLEAN DEFAULT 1,
    ai_tagging_enabled BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS portfolio_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    photographer_id INTEGER,
    site_title TEXT,
    bio TEXT,
    theme_color TEXT DEFAULT '#8B5CF6',
    selected_albums TEXT, -- JSON array of album IDs
    show_contact BOOLEAN DEFAULT 1,
    FOREIGN KEY(photographer_id) REFERENCES users(id)
  );
`);

// Simple migration to add missing columns if they don't exist
const clientsInfo = db.prepare('PRAGMA table_info(clients)').all();
if (!clientsInfo.some(col => col.name === 'photographer_id')) {
  try { db.exec('ALTER TABLE clients ADD COLUMN photographer_id INTEGER REFERENCES users(id)'); } catch (e) {}
}

const imagesInfo = db.prepare('PRAGMA table_info(images)').all();
if (!imagesInfo.some(col => col.name === 'album_id')) {
  try { db.exec('ALTER TABLE images ADD COLUMN album_id INTEGER REFERENCES albums(id)'); } catch (e) {}
}
if (!imagesInfo.some(col => col.name === 'original_url')) {
  try { 
    // If 'url' exists but 'original_url' doesn't, rename or add
    if (imagesInfo.some(col => col.name === 'url')) {
      db.exec('ALTER TABLE images RENAME COLUMN url TO original_url');
    } else {
      db.exec('ALTER TABLE images ADD COLUMN original_url TEXT');
    }
  } catch (e) {}
}
if (!imagesInfo.some(col => col.name === 'compressed_url')) {
  try { db.exec('ALTER TABLE images ADD COLUMN compressed_url TEXT'); } catch (e) {}
}
if (!imagesInfo.some(col => col.name === 'watermarked_url')) {
  try { db.exec('ALTER TABLE images ADD COLUMN watermarked_url TEXT'); } catch (e) {}
}
if (!imagesInfo.some(col => col.name === 'engagement_score')) {
   try { db.exec('ALTER TABLE images ADD COLUMN engagement_score REAL DEFAULT 0'); } catch (e) {}
 }
 if (!imagesInfo.some(col => col.name === 'client_id')) {
   try { db.exec('ALTER TABLE images ADD COLUMN client_id INTEGER REFERENCES clients(id)'); } catch (e) {}
 }
 
 const bookingsInfo = db.prepare('PRAGMA table_info(bookings)').all();
 if (!bookingsInfo.some(col => col.name === 'photographer_id')) {
   try { db.exec('ALTER TABLE bookings ADD COLUMN photographer_id INTEGER REFERENCES users(id)'); } catch (e) {}
 }
 if (!bookingsInfo.some(col => col.name === 'client_name')) {
   try { db.exec('ALTER TABLE bookings ADD COLUMN client_name TEXT'); } catch (e) {}
 }
 if (!bookingsInfo.some(col => col.name === 'client_email')) {
   try { db.exec('ALTER TABLE bookings ADD COLUMN client_email TEXT'); } catch (e) {}
 }
 if (!bookingsInfo.some(col => col.name === 'shoot_type')) {
   try { 
     if (bookingsInfo.some(col => col.name === 'type')) {
       db.exec('ALTER TABLE bookings RENAME COLUMN type TO shoot_type');
     } else {
       db.exec('ALTER TABLE bookings ADD COLUMN shoot_type TEXT');
     }
   } catch (e) {}
 }
 if (!bookingsInfo.some(col => col.name === 'price')) {
    try { db.exec('ALTER TABLE bookings ADD COLUMN price REAL'); } catch (e) {}
  }

  const activityInfo = db.prepare('PRAGMA table_info(activity)').all();
  if (!activityInfo.some(col => col.name === 'user_id')) {
    try { db.exec('ALTER TABLE activity ADD COLUMN user_id INTEGER REFERENCES users(id)'); } catch (e) {}
  }
  if (!activityInfo.some(col => col.name === 'activity_type')) {
    try { 
      if (activityInfo.some(col => col.name === 'activity')) {
        db.exec('ALTER TABLE activity RENAME COLUMN activity TO activity_type');
      } else {
        db.exec('ALTER TABLE activity ADD COLUMN activity_type TEXT');
      }
    } catch (e) {}
  }
  if (!activityInfo.some(col => col.name === 'album_name')) {
    try { 
      if (activityInfo.some(col => col.name === 'album')) {
        db.exec('ALTER TABLE activity RENAME COLUMN album TO album_name');
      } else {
        db.exec('ALTER TABLE activity ADD COLUMN album_name TEXT');
      }
    } catch (e) {}
  }

// Seed initial data
const seed = db.transaction(() => {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  // 1. Create Admins if not exist
  const adminCount = db.prepare("SELECT count(*) as count FROM users WHERE role = 'admin'").get();
  if (adminCount.count === 0) {
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('System Admin', 'admin@shutter.com', hashedPassword, 'admin');
  }
    
  // 2. Create Photographers if not enough
  const photogCount = db.prepare("SELECT count(*) as count FROM users WHERE role = 'photographer'").get();
  if (photogCount.count < 3) {
    const photographers = [
      { name: 'Sarah Miller', email: 'sarah@example.com', role: 'photographer' },
      { name: 'David Chen', email: 'david@example.com', role: 'photographer' }
    ];

    photographers.forEach(p => {
      const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(p.email);
      if (!exists) {
        db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
          .run(p.name, p.email, hashedPassword, p.role);
      }
    });
  }

  // Get all photographers
  const photographerIds = db.prepare("SELECT id FROM users WHERE role = 'photographer'").all().map(u => u.id);

  // 3. Add Clients if not enough
  photographerIds.forEach(pId => {
    const clientCount = db.prepare('SELECT count(*) as count FROM clients WHERE photographer_id = ?').get(pId);
    if (clientCount.count < 4) {
      const clientData = [
        { name: 'Ashleigh G.', email: 'ashleigh@example.com', last_activity: '29 Apr, 2024' },
        { name: 'Kiara D.', email: 'kiara@example.com', last_activity: '27 Apr, 2024' },
        { name: 'Michael R.', email: 'michael@example.com', last_activity: '10 May, 2024' },
        { name: 'Emma W.', email: 'emma@example.com', last_activity: '12 May, 2024' }
      ];

      clientData.forEach(c => {
        const email = `${pId}_${c.email}`;
        const exists = db.prepare('SELECT id FROM clients WHERE email = ?').get(email);
        if (!exists) {
          db.prepare('INSERT INTO clients (photographer_id, name, email, last_activity) VALUES (?, ?, ?, ?)')
            .run(pId, c.name, email, c.last_activity);
        }
      });
    }
  });

  // 4. Add Albums if not enough
  const categories = ['Wedding', 'Portrait', 'Landscape', 'Event', 'Commercial'];
  photographerIds.forEach(pId => {
    const albumCount = db.prepare('SELECT count(*) as count FROM albums WHERE photographer_id = ?').get(pId);
    if (albumCount.count < 5) {
      categories.forEach(cat => {
        const title = `${cat} Collection`;
        const exists = db.prepare('SELECT id FROM albums WHERE photographer_id = ? AND title = ?').get(pId, title);
        if (!exists) {
          db.prepare('INSERT INTO albums (photographer_id, title, category) VALUES (?, ?, ?)')
            .run(pId, title, cat);
        }
      });
    }
  });

  // Get all albums
  const albums = db.prepare('SELECT id, category FROM albums').all();

  // 5. Add Images if not enough
  const categorizedImages = {
    'Wedding': [
      { title: 'The Vows', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', size: 3200000 },
      { title: 'Golden Hour Kiss', url: 'https://images.unsplash.com/photo-1519741497674-611481863552', size: 2800000 },
      { title: 'Reception Fun', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', size: 2400000 },
      { title: 'Bridal Portrait', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', size: 2100000 },
      { title: 'Cake Cutting', url: 'https://images.unsplash.com/photo-1522673607200-1648832cee98', size: 2600000 },
      { title: 'First Dance', url: 'https://images.unsplash.com/photo-1541250848049-b4f7141dca3f', size: 2900000 }
    ],
    'Portrait': [
      { title: 'Studio Glow', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', size: 1800000 },
      { title: 'Urban Style', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', size: 2200000 },
      { title: 'Soft Morning', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04', size: 2500000 },
      { title: 'Dramatic Shadows', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', size: 2300000 },
      { title: 'Professional Headshot', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', size: 2100000 },
      { title: 'Candid Smile', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', size: 1900000 }
    ],
    'Landscape': [
      { title: 'Mountain Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', size: 4500000 },
      { title: 'Ocean Breeze', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', size: 3800000 },
      { title: 'Desert Dunes', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0', size: 4200000 },
      { title: 'Forest Trail', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', size: 4100000 },
      { title: 'Misty Valley', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', size: 3900000 },
      { title: 'Starry Night', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', size: 5200000 }
    ],
    'Event': [
      { title: 'Music Festival', url: 'https://images.unsplash.com/photo-1459749411177-042180ce673c', size: 3200000 },
      { title: 'Corporate Gala', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', size: 2800000 },
      { title: 'Tech Conference', url: 'https://images.unsplash.com/photo-1505373633560-fa3acc2cf41e', size: 2600000 },
      { title: 'Art Gallery', url: 'https://images.unsplash.com/photo-1531050171651-a3a4ca0b7145', size: 2400000 },
      { title: 'Stage Performance', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', size: 3100000 },
      { title: 'Backstage Moment', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4', size: 2700000 }
    ],
    'Commercial': [
      { title: 'Minimalist Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', size: 1500000 },
      { title: 'Modern Tech', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2', size: 1800000 },
      { title: 'Gourmet Platter', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', size: 2200000 },
      { title: 'Fashion Footwear', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', size: 1600000 },
      { title: 'Sleek Automobile', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8', size: 3400000 },
      { title: 'Office Space', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c', size: 2500000 }
    ]
  };

  albums.forEach(album => {
    const imageCount = db.prepare('SELECT count(*) as count FROM images WHERE album_id = ?').get(album.id);
    if (imageCount.count === 0) {
      const samples = categorizedImages[album.category] || categorizedImages['Portrait'];
      samples.forEach(img => {
        db.prepare('INSERT INTO images (album_id, title, original_url, size, category) VALUES (?, ?, ?, ?, ?)')
          .run(album.id, img.title, img.url, img.size, album.category);
      });
      // Set the first image as the cover image
      db.prepare('UPDATE albums SET cover_image = ? WHERE id = ?').run(samples[0].url, album.id);
    }
  });

  // 6. Add Bookings if not enough
  photographerIds.forEach(pId => {
    const bookingCount = db.prepare('SELECT count(*) as count FROM bookings WHERE photographer_id = ?').get(pId);
    if (bookingCount.count < 4) {
      const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const clients = db.prepare('SELECT name, email FROM clients WHERE photographer_id = ?').all(pId);
      
      clients.forEach((c, idx) => {
        db.prepare('INSERT INTO bookings (photographer_id, client_name, client_email, shoot_date, shoot_type, status, price) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(pId, c.name, c.email, `2024-06-${10 + idx}`, categories[idx % categories.length], bookingStatuses[idx % bookingStatuses.length], 500 + (idx * 200));
      });
    }
  });

  // 7. Add Feedback if not enough
  const allImages = db.prepare('SELECT id FROM images LIMIT 20').all();
  const allClients = db.prepare('SELECT id FROM clients LIMIT 20').all();
  
  if (allImages.length > 0 && allClients.length > 0) {
    const feedbackCount = db.prepare('SELECT count(*) as count FROM feedback').get();
    if (feedbackCount.count < 10) {
      allImages.forEach((img, idx) => {
        if (idx < 10) {
          db.prepare('INSERT INTO feedback (image_id, client_id, comment, is_favorite) VALUES (?, ?, ?, ?)')
            .run(img.id, allClients[idx % allClients.length].id, 'Amazing shot! Love the lighting.', idx % 2 === 0 ? 1 : 0);
        }
      });
    }
  }

  // 8. Add Activity Logs if not enough
  photographerIds.forEach(pId => {
    const activityCount = db.prepare('SELECT count(*) as count FROM activity WHERE user_id = ?').get(pId);
    if (activityCount.count < 2) {
      db.prepare('INSERT INTO activity (user_id, client_name, activity_type, album_name, date) VALUES (?, ?, ?, ?, ?)')
        .run(pId, 'System', 'Dashboard initialized', 'General', '01 May, 2024');
      db.prepare('INSERT INTO activity (user_id, client_name, activity_type, album_name, date) VALUES (?, ?, ?, ?, ?)')
        .run(pId, 'Anna K.', 'Signed a contract', 'Wedding 2024', '05 May, 2024');
    }
  });

  // 9. Initialize settings
  db.prepare('INSERT OR IGNORE INTO system_settings (id) VALUES (1)').run();
});

seed();

module.exports = db;
