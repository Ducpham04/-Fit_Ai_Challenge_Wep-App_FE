const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `video_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Store analysis results (in-memory for demo)
const analysisStore = new Map();

// POST /api/analysis/pushup - Upload video for analysis
app.post('/api/analysis/pushup', upload.single('video'), (req, res) => {
  try {
    console.log('\n🎥 Received video upload request');
    
    if (!req.file) {
      console.error('❌ No video file provided');
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const targetReps = parseInt(req.body.targetReps) || 10;
    console.log(`📋 Target Reps: ${targetReps}`);
    console.log(`📁 File: ${req.file.filename} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Simulate AI processing delay
    setTimeout(() => {
      // Generate mock analysis results
      const analysisId = `ana_${Date.now()}`;
      const totalReps = targetReps + Math.floor(Math.random() * 3); // Slightly over target
      const duration = 30 + Math.random() * 30; // 30-60 seconds
      const averageRepSpeed = (totalReps / duration) * 60; // reps per minute

      const result = {
        success: true,
        data: {
          totalReps: totalReps,
          duration: parseFloat(duration.toFixed(1)),
          averageRepSpeed: parseFloat(averageRepSpeed.toFixed(1)),
          formScore: 75 + Math.floor(Math.random() * 20), // 75-95
          repDetails: Array.from({ length: totalReps }, (_, i) => ({
            repNumber: i + 1,
            duration: parseFloat((duration / totalReps).toFixed(2)),
            quality: 70 + Math.floor(Math.random() * 25),
            depthAchieved: 85 + Math.floor(Math.random() * 15),
            timestamp: parseFloat((duration / totalReps * i).toFixed(2))
          })),
          qualityMetrics: {
            overallForm: 80 + Math.floor(Math.random() * 15),
            consistency: 82 + Math.floor(Math.random() * 13),
            rangeOfMotion: 85 + Math.floor(Math.random() * 12),
            bodyAlignment: 78 + Math.floor(Math.random() * 17),
            tempo: 83 + Math.floor(Math.random() * 14)
          },
          videoMetadata: {
            filename: req.file.originalname,
            size: req.file.size,
            duration: parseFloat(duration.toFixed(1)),
            resolution: "1280x720",
            frameRate: 30
          }
        },
        analysisId: analysisId,
        timestamp: new Date().toISOString()
      };

      // Store result
      analysisStore.set(analysisId, result);

      console.log('\n✅ Analysis completed successfully');
      console.log(`📊 Analysis ID: ${analysisId}`);
      console.log(`📈 Results: ${totalReps} reps, ${result.data.formScore}/100 form score`);
      console.log('\n📄 Full JSON Response:');
      console.log(JSON.stringify(result, null, 2));

      // Save to file for inspection
      const outputFile = `./analysis_${analysisId}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(`\n💾 Saved to: ${outputFile}`);

      res.json(result);
    }, 2000); // 2 second delay to simulate processing

  } catch (error) {
    console.error('❌ Error processing video:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/analysis/:analysisId - Get specific analysis result
app.get('/api/analysis/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  console.log(`\n🔍 Fetching analysis: ${analysisId}`);
  
  const result = analysisStore.get(analysisId);
  
  if (!result) {
    console.log('❌ Analysis not found');
    return res.status(404).json({
      success: false,
      error: 'Analysis not found'
    });
  }

  console.log('✅ Analysis found');
  res.json(result);
});

// GET /api/analysis - Get all analysis results
app.get('/api/analysis', (req, res) => {
  console.log('\n📚 Fetching all analyses');
  const analyses = Array.from(analysisStore.values());
  console.log(`✅ Found ${analyses.length} analyses`);
  
  res.json({
    success: true,
    data: analyses,
    count: analyses.length
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Mock Backend Server Started');
  console.log('================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload endpoint: POST http://localhost:${PORT}/api/analysis/pushup`);
  console.log(`📊 Get all analyses: GET http://localhost:${PORT}/api/analysis`);
  console.log('\n💡 Waiting for video uploads...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down mock backend...');
  process.exit(0);
});
