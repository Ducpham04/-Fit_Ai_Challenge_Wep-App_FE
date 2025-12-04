# My Challenge - API Documentation

## Base URL
```
/api/v1/training-plans
```

## Endpoints Overview

### 1. Get User's Training Plans
**GET** `/me`

Get all current training plans for the authenticated user.

**Request:**
```bash
curl -X GET /api/v1/training-plans/me \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
[
  {
    "id": "tp1",
    "planName": "30-Day Push-up Master",
    "description": "Build strength and endurance with progressive push-up training",
    "difficulty": "Intermediate",
    "duration": "30 days",
    "progressPercentage": 40,
    "startDate": "2025-11-04",
    "endDate": "2025-12-04",
    "daysCompleted": 12,
    "totalDays": 30,
    "lastActivityDate": "2025-11-15"
  },
  ...
]
```

---

### 2. Get Training Plan Detail
**GET** `/{trainingPlanId}`

Get detailed training plan with all day schedules and challenges.

**Request:**
```bash
curl -X GET /api/v1/training-plans/tp1 \
  -H "Authorization: Bearer <token>"
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trainingPlanId` | string | Yes | Training plan ID |

**Response:** `200 OK`
```json
{
  "id": "tp1",
  "planName": "30-Day Push-up Master",
  "description": "Build strength and endurance with progressive push-up training",
  "duration": "30 days",
  "startDate": "2025-11-04",
  "endDate": "2025-12-04",
  "difficulty": "Intermediate",
  "totalDays": 30,
  "progressPercentage": 40,
  "status": "active",
  "userId": "current-user",
  "dayChallenges": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Monday",
      "challenges": [
        {
          "id": "ch1",
          "challengeId": "puc1",
          "challengeName": "Basic Push-ups",
          "sets": 3,
          "reps": 10,
          "status": "completed",
          "description": "Standard push-ups with proper form",
          "aiAnalysis": {
            "correctReps": 30,
            "totalReps": 30,
            "accuracy": 95,
            "feedback": "Excellent form! Keep your back straight.",
            "posture": "Correct"
          }
        }
      ]
    }
  ]
}
```

**Error Responses:**
```json
{
  "statusCode": 404,
  "message": "Training plan not found"
}
```

---

### 3. Get Challenges by Day
**GET** `/{trainingPlanId}/days/{dayNumber}`

Get challenges for a specific day in a training plan.

**Request:**
```bash
curl -X GET /api/v1/training-plans/tp1/days/1 \
  -H "Authorization: Bearer <token>"
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trainingPlanId` | string | Yes | Training plan ID |
| `dayNumber` | number | Yes | Day number (1-30) |

**Response:** `200 OK`
```json
{
  "dayNumber": 1,
  "dayName": "Day 1 - Monday",
  "challenges": [
    {
      "id": "ch1",
      "challengeId": "puc1",
      "challengeName": "Basic Push-ups",
      "sets": 3,
      "reps": 10,
      "status": "not_started",
      "description": "Standard push-ups with proper form"
    }
  ]
}
```

---

### 4. Submit Challenge Video
**POST** `/{trainingPlanId}/challenges/{challengeId}/submit`

Submit a video for AI analysis.

**Request:**
```bash
curl -X POST /api/v1/training-plans/tp1/challenges/ch1/submit \
  -H "Authorization: Bearer <token>" \
  -F "video=@video.mp4"
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trainingPlanId` | string | Yes | Training plan ID |
| `challengeId` | string | Yes | Challenge ID |

**Request Body:**
```
Content-Type: multipart/form-data

video: File (MP4, MOV, AVI, etc.)
```

**Response:** `201 Created`
```json
{
  "success": true,
  "challengeId": "ch1",
  "timestamp": "2025-11-15T10:30:00Z",
  "aiAnalysis": {
    "correctReps": 28,
    "totalReps": 30,
    "accuracy": 93,
    "posture": "Good",
    "feedback": "Lower more slowly for better control",
    "suggestions": [
      "Focus on full range of motion",
      "Engage your core throughout",
      "Maintain steady breathing"
    ]
  },
  "videoUrl": "s3://videos/ch1_2025_11_15.mp4"
}
```

**Error Responses:**
```json
{
  "statusCode": 400,
  "message": "Video file required"
}
```

```json
{
  "statusCode": 413,
  "message": "Video file too large (max 500MB)"
}
```

---

### 5. Update Challenge Status
**PATCH** `/{trainingPlanId}/challenges/{challengeId}/status`

Update the status of a challenge.

**Request:**
```bash
curl -X PATCH /api/v1/training-plans/tp1/challenges/ch1/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trainingPlanId` | string | Yes | Training plan ID |
| `challengeId` | string | Yes | Challenge ID |

**Request Body:**
```json
{
  "status": "completed" | "in_progress" | "not_started" | "incorrect_form"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "challengeId": "ch1",
  "status": "completed",
  "updatedAt": "2025-11-15T10:30:00Z"
}
```

---

### 6. Get AI Analysis History
**GET** `/{trainingPlanId}/challenges/{challengeId}/analysis`

Get all AI analysis results for a challenge.

**Request:**
```bash
curl -X GET /api/v1/training-plans/tp1/challenges/ch1/analysis \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
{
  "challengeId": "ch1",
  "analyses": [
    {
      "analysisId": "ai1",
      "timestamp": "2025-11-15T10:30:00Z",
      "correctReps": 28,
      "totalReps": 30,
      "accuracy": 93,
      "posture": "Good",
      "feedback": "Lower more slowly for better control",
      "videoUrl": "s3://videos/ch1_2025_11_15.mp4"
    },
    {
      "analysisId": "ai2",
      "timestamp": "2025-11-16T09:15:00Z",
      "correctReps": 30,
      "totalReps": 30,
      "accuracy": 98,
      "posture": "Excellent",
      "feedback": "Perfect form! Keep it up!",
      "videoUrl": "s3://videos/ch1_2025_11_16.mp4"
    }
  ]
}
```

---

### 7. Get Training Plan Progress
**GET** `/{trainingPlanId}/progress`

Get detailed progress statistics for a training plan.

**Request:**
```bash
curl -X GET /api/v1/training-plans/tp1/progress \
  -H "Authorization: Bearer <token>"
```

**Response:** `200 OK`
```json
{
  "trainingPlanId": "tp1",
  "totalDays": 30,
  "daysCompleted": 12,
  "progressPercentage": 40,
  "completedChallenges": 24,
  "totalChallenges": 60,
  "averageAccuracy": 92.5,
  "bestDay": {
    "dayNumber": 5,
    "accuracy": 98,
    "repsAccuracy": 100
  },
  "lastUpdated": "2025-11-15T10:30:00Z"
}
```

---

## Data Types

### Challenge Status
```typescript
type ChallengeStatus = 'not_started' | 'in_progress' | 'completed' | 'incorrect_form';
```

### Training Plan Status
```typescript
type TrainingPlanStatus = 'active' | 'completed' | 'paused';
```

### Difficulty Level
```typescript
type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
```

### AIAnalysisResult
```typescript
interface AIAnalysisResult {
  correctReps: number;          // Number of correctly performed reps
  totalReps: number;            // Total reps attempted
  accuracy: number;             // Accuracy percentage (0-100)
  posture: string;              // 'Excellent' | 'Good' | 'Needs Improvement'
  feedback: string;             // Specific feedback for user
  suggestions: string[];        // Array of improvement suggestions
  timestamp?: string;           // ISO timestamp of analysis
  videoUrl?: string;            // URL to stored video
}
```

---

## Authentication

All endpoints require Bearer token authentication.

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "Forbidden - You don't have access to this resource"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**422 Unprocessable Entity**
```json
{
  "statusCode": 422,
  "message": "Validation error",
  "errors": [
    {
      "field": "status",
      "message": "Invalid status value"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Video Upload:** 10 requests per hour per user
- **General API:** 100 requests per minute per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1605537600
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
```
?page=1&limit=10&sort=createdAt&order=desc
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## Webhooks (Optional)

Receive real-time updates when:
- Challenge completed
- AI analysis finished
- Training plan completed

**Webhook Headers:**
```
X-Signature: sha256=...
X-Delivery-ID: uuid
X-Timestamp: 2025-11-15T10:30:00Z
```

---

## Examples

### Complete Workflow

```bash
# 1. Get user's training plans
curl -X GET /api/v1/training-plans/me \
  -H "Authorization: Bearer TOKEN"

# 2. Get plan details
curl -X GET /api/v1/training-plans/tp1 \
  -H "Authorization: Bearer TOKEN"

# 3. Submit video
curl -X POST /api/v1/training-plans/tp1/challenges/ch1/submit \
  -H "Authorization: Bearer TOKEN" \
  -F "video=@my_video.mp4"

# 4. Check progress
curl -X GET /api/v1/training-plans/tp1/progress \
  -H "Authorization: Bearer TOKEN"
```

---

**Last Updated:** December 4, 2025
**API Version:** v1
**Status:** Production Ready
