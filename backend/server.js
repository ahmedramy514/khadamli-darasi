const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - allow Vercel and localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5002',
  'https://khadamli-darasi.vercel.app',
  process.env.FRONTEND_URL || 'https://khadamli-darasi.vercel.app'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    // Allow localhost and Vercel domains
    if (origin.includes('localhost') || 
        origin.includes('vercel.app') || 
        allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const path = require('path');

// MongoDB Connection (supports in-memory server for development)
async function connectMongo() {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Use in-memory MongoDB when requested or when no URI is provided in development
    if ((!mongoUri && process.env.NODE_ENV === 'development') || process.env.USE_IN_MEMORY_DB === 'true') {
      console.log('ℹ️ تشغيل MongoDB في الذاكرة (mongodb-memory-server) للمطور');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    if (!mongoUri) {
      throw new Error('MONGODB_URI غير محدد ويجب تشغيل mongo محلياً أو تفعيل USE_IN_MEMORY_DB');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB متصل');
    return true;
  } catch (err) {
    console.error('❌ خطأ في الاتصال بـ MongoDB:', err.message);
    throw err;
  }
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/users', require('./routes/users'));
// assignments routes
app.use('/api/assignments', require('./routes/assignments'));
// messaging and notifications
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Start server (ignore await for now, just initialize everything)
(async () => {
  try {
    await connectMongo();
  } catch (err) {
    console.error('[ERROR] MongoDB connection failed:', err.message);
  }
  
  const server = app.listen(PORT, '0.0.0.0', function() {
    console.log(`🚀 Server is actually running and listening on port ${PORT}`);
  });

  // Setup socket.io for real-time messaging
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
      }
    });

    // Attach io instance to express app so routes can emit events
    app.set('io', io);

    const jwt = require('jsonwebtoken');
    io.on('connection', (socket) => {
      console.log('[socket] connected', socket.id);

      // validate token sent in handshake auth
      try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (token) {
          try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = payload.id;
            socket.join(String(socket.userId));
            console.log(`[socket] ${socket.id} authenticated as ${socket.userId}`);
          } catch (err) {
            console.warn('[socket] invalid token, connection unauthenticated');
          }
        }
      } catch (e) {
        console.error('[socket] auth error', e.message);
      }

      // allow explicit join as fallback
      socket.on('join', (userId) => {
        try {
          if (userId) {
            socket.join(String(userId));
            console.log(`[socket] ${socket.id} joined room ${userId}`);
          }
        } catch (e) {
          console.error('[socket] join error', e.message);
        }
      });

      // typing indicator: forward to recipient
      socket.on('typing', (payload) => {
        try {
          const to = payload && (payload.to || payload.userId);
          if (to) {
            io.to(String(to)).emit('typing', { from: socket.userId });
          }
        } catch (e) {
          console.error('[socket] typing error', e.message);
        }
      });

      socket.on('disconnect', () => {
        console.log('[socket] disconnected', socket.id);
      });
    });
  } catch (e) {
    console.warn('Socket.io not available or failed to initialize:', e.message);
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${PORT} is already in use`);
    } else {
      console.error('[ERROR] Server error:', err);
    }
  });
})();
