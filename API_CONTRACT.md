# FitAI Workout Plan API Contract

## Base URL
- **Mock Development**: `http://localhost:3001/api`
- **Production**: `https://api.fitai.com/api`

## Endpoints

### GET /workout-plan
Get the complete 14-day workout plan.

**Query Parameters:**
- `type` (optional): Plan difficulty - `beginner`, `intermediate`, `advanced`. Default: `intermediate`
- `days` (optional): Number of days. Default: `14`

**Response:**
```json
{
  "planType": "intermediate",
  "totalDays": 14,
  "currentDay": 1,
  "plan": [
    {
      "day": 1,
      "pushUps": 27,
      "squats": 41,
      "jumpingJacks": 128,
      "plankSeconds": 47
    }
  ]
}
```

### GET /workout-plan/day/:dayNumber
Get target reps for a specific day.

**Path Parameters:**
- `dayNumber`: Day number (1-14)

**Query Parameters:**
- `type` (optional): Plan difficulty. Default: `intermediate`

**Response:**
```json
{
  "day": 1,
  "pushUps": 27,
  "squats": 41,
  "jumpingJacks": 128,
  "plankSeconds": 47
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid plan type",
  "code": "INVALID_PLAN_TYPE"
}
```

**404 Not Found:**
```json
{
  "error": "Day not found",
  "code": "DAY_NOT_FOUND"
}
```
