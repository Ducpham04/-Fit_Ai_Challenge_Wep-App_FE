/**
 * FitAI Mock Backend API Server
 * 
 * Provides workout plan data with 14-day progressive training schedules.
 * Run with: node mock-api-server.js
 * Server runs on: http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Simulate network latency (50-150ms)
app.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 100) + 50;
  setTimeout(next, delay);
});

// ============================================
// 14-DAY WORKOUT PLAN DATA
// ============================================

/**
 * 14-Day Intermediate Plan
 * Progressive overload with daily increments
 */
const INTERMEDIATE_PLAN = [
  { day: 1, pushUps: 27, squats: 41, jumpingJacks: 128, plankSeconds: 47 },
  { day: 2, pushUps: 28, squats: 42, jumpingJacks: 132, plankSeconds: 49 },
  { day: 3, pushUps: 29, squats: 44, jumpingJacks: 137, plankSeconds: 50 },
  { day: 4, pushUps: 30, squats: 45, jumpingJacks: 142, plankSeconds: 52 },
  { day: 5, pushUps: 31, squats: 47, jumpingJacks: 147, plankSeconds: 54 },
  { day: 6, pushUps: 32, squats: 49, jumpingJacks: 152, plankSeconds: 56 },
  { day: 7, pushUps: 33, squats: 50, jumpingJacks: 157, plankSeconds: 58 },
  { day: 8, pushUps: 34, squats: 52, jumpingJacks: 163, plankSeconds: 60 },
  { day: 9, pushUps: 36, squats: 54, jumpingJacks: 169, plankSeconds: 62 },
  { day: 10, pushUps: 37, squats: 56, jumpingJacks: 174, plankSeconds: 64 },
  { day: 11, pushUps: 38, squats: 58, jumpingJacks: 181, plankSeconds: 66 },
  { day: 12, pushUps: 39, squats: 60, jumpingJacks: 187, plankSeconds: 69 },
  { day: 13, pushUps: 41, squats: 62, jumpingJacks: 193, plankSeconds: 71 },
  { day: 14, pushUps: 42, squats: 64, jumpingJacks: 200, plankSeconds: 74 }
];

const BEGINNER_PLAN = [
  { day: 1, pushUps: 10, squats: 15, jumpingJacks: 30, plankSeconds: 20 },
  { day: 2, pushUps: 12, squats: 17, jumpingJacks: 35, plankSeconds: 22 },
  { day: 3, pushUps: 14, squats: 19, jumpingJacks: 40, plankSeconds: 24 },
  { day: 4, pushUps: 16, squats: 21, jumpingJacks: 45, plankSeconds: 26 },
  { day: 5, pushUps: 18, squats: 23, jumpingJacks: 50, plankSeconds: 28 },
  { day: 6, pushUps: 20, squats: 25, jumpingJacks: 55, plankSeconds: 30 },
  { day: 7, pushUps: 22, squats: 27, jumpingJacks: 60, plankSeconds: 32 },
  { day: 8, pushUps: 24, squats: 29, jumpingJacks: 65, plankSeconds: 34 },
  { day: 9, pushUps: 26, squats: 31, jumpingJacks: 70, plankSeconds: 36 },
  { day: 10, pushUps: 28, squats: 33, jumpingJacks: 75, plankSeconds: 38 },
  { day: 11, pushUps: 30, squats: 35, jumpingJacks: 80, plankSeconds: 40 },
  { day: 12, pushUps: 32, squats: 37, jumpingJacks: 85, plankSeconds: 42 },
  { day: 13, pushUps: 34, squats: 39, jumpingJacks: 90, plankSeconds: 44 },
  { day: 14, pushUps: 36, squats: 41, jumpingJacks: 95, plankSeconds: 46 }
];

const ADVANCED_PLAN = [
  { day: 1, pushUps: 45, squats: 70, jumpingJacks: 200, plankSeconds: 80 },
  { day: 2, pushUps: 47, squats: 73, jumpingJacks: 210, plankSeconds: 83 },
  { day: 3, pushUps: 49, squats: 76, jumpingJacks: 220, plankSeconds: 86 },
  { day: 4, pushUps: 51, squats: 79, jumpingJacks: 230, plankSeconds: 89 },
  { day: 5, pushUps: 53, squats: 82, jumpingJacks: 240, plankSeconds: 92 },
  { day: 6, pushUps: 55, squats: 85, jumpingJacks: 250, plankSeconds: 95 },
  { day: 7, pushUps: 57, squats: 88, jumpingJacks: 260, plankSeconds: 98 },
  { day: 8, pushUps: 59, squats: 91, jumpingJacks: 270, plankSeconds: 101 },
  { day: 9, pushUps: 61, squats: 94, jumpingJacks: 280, plankSeconds: 104 },
  { day: 10, pushUps: 63, squats: 97, jumpingJacks: 290, plankSeconds: 107 },
  { day: 11, pushUps: 65, squats: 100, jumpingJacks: 300, plankSeconds: 110 },
  { day: 12, pushUps: 67, squats: 103, jumpingJacks: 310, plankSeconds: 113 },
  { day: 13, pushUps: 69, squats: 106, jumpingJacks: 320, plankSeconds: 116 },
  { day: 14, pushUps: 71, squats: 109, jumpingJacks: 330, plankSeconds: 119 }
];

/**
 * Get plan data by type
 */
function getPlanByType(type) {
  switch (type?.toLowerCase()) {
    case 'beginner': return BEGINNER_PLAN;
    case 'intermediate': return INTERMEDIATE_PLAN;
    case 'advanced': return ADVANCED_PLAN;
    default: return INTERMEDIATE_PLAN;
  }
}

/**
 * Calculate current day (mock - always returns day 1)
 * In production, calculate based on user's plan start date
 */
function getCurrentDay() {
  return 1;
}

// ============================================
// API ROUTES
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /api/workout-plan
 * Get complete workout plan
 */
app.get('/api/workout-plan', (req, res) => {
  try {
    const { type = 'intermediate', days = '14' } = req.query;
    const planType = type.toLowerCase();
    
    const validTypes = ['beginner', 'intermediate', 'advanced'];
    if (!validTypes.includes(planType)) {
      return res.status(400).json({
        error: `Invalid plan type. Must be: ${validTypes.join(', ')}`,
        code: 'INVALID_PLAN_TYPE'
      });
    }
    
    const plan = getPlanByType(planType);
    const totalDays = parseInt(days, 10);
    const currentDay = getCurrentDay();
    
    res.json({
      planType,
      totalDays,
      currentDay,
      plan: plan.slice(0, totalDays)
    });
    
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({
      error: 'Failed to retrieve workout plan',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/workout-plan/day/:dayNumber
 * Get daily workout target
 */
app.get('/api/workout-plan/day/:dayNumber', (req, res) => {
  try {
    const { dayNumber } = req.params;
    const { type = 'intermediate' } = req.query;
    const planType = type.toLowerCase();
    
    const day = parseInt(dayNumber, 10);
    if (isNaN(day) || day < 1 || day > 14) {
      return res.status(400).json({
        error: 'Day number must be between 1 and 14',
        code: 'INVALID_DAY_NUMBER'
      });
    }
    
    const plan = getPlanByType(planType);
    const dayData = plan.find(d => d.day === day);
    
    if (!dayData) {
      return res.status(404).json({
        error: `Day ${day} not found in plan`,
        code: 'DAY_NOT_FOUND'
      });
    }
    
    res.json(dayData);
    
  } catch (error) {
    console.error('Error fetching daily target:', error);
    res.status(500).json({
      error: 'Failed to retrieve daily target',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🏋️  FitAI Mock API Server');
  console.log('========================================');
  console.log(`✓ Server: http://localhost:${PORT}`);
  console.log(`✓ Health: http://localhost:${PORT}/health`);
  console.log(`✓ Plan: http://localhost:${PORT}/api/workout-plan`);
  console.log(`✓ Day: http://localhost:${PORT}/api/workout-plan/day/1`);
  console.log('========================================\n');
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
