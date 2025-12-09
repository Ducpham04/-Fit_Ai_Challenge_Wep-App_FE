# FitChallenge API Documentation

This document provides comprehensive API documentation for the FitChallenge application, including all endpoints, request/response structures, and frontend-required fields.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "role": "string"
  }
}
```

**Frontend Fields:** `token`, `refreshToken`, `user.id`, `user.email`, `user.fullName`, `user.role`

### 1.2 Register
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "role": "string"
  }
}
```

**Frontend Fields:** Same as login response

### 1.3 Get Profile
**Endpoint:** `GET /auth/user`

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "status": "active|inactive|banned",
  "createdAt": "string",
  "updatedAt": "string",
  "lastLoginAt": "string",
  "profileImage": "string"
}
```

**Frontend Fields:** All fields for user profile display

### 1.4 Get Current User
**Endpoint:** `GET /auth/me`

**Response:** Same as Get Profile

---

## 2. Challenge APIs

### 2.1 Get All Challenges
**Endpoint:** `GET /challenges`

**Query Parameters:**
- `status`: Filter by status (Active, Upcoming, Completed)
- `difficulty`: Filter by difficulty (Easy, Medium, Hard)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "challenges": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "video": ["string"],
      "difficulty": "Easy|Medium|Hard",
      "participants": "number",
      "reward": "string",
      "status": "Active|Upcoming|Completed",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

**Frontend Fields:** All challenge fields for list display

### 2.2 Get Challenge by ID
**Endpoint:** `GET /challenges/{id}`

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "video": ["string"],
  "difficulty": "Easy|Medium|Hard",
  "participants": "number",
  "reward": "string",
  "status": "Active|Upcoming|Completed",
  "participants": [
    {
      "userId": "string",
      "userName": "string",
      "joinedAt": "string",
      "progress": "number",
      "completed": "boolean"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Frontend Fields:** All fields plus participants list

### 2.3 Join Challenge
**Endpoint:** `POST /challenges/{id}/join`

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:**
```json
{
  "message": "string",
  "challengeId": "string",
  "userId": "string",
  "joinedAt": "string"
}
```

**Frontend Fields:** `message`, `joinedAt`

---

## 3. Training Plan APIs

### 3.1 Get All Training Plans
**Endpoint:** `GET /training-plans`

**Query Parameters:**
- `difficulty`: Filter by difficulty
- `status`: Filter by status
- `goalId`: Filter by goal
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "trainingPlans": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "number",
      "exercises": [
        {
          "id": "string",
          "name": "string",
          "sets": "number",
          "reps": "number",
          "duration": "number",
          "restTime": "number",
          "instructions": "string",
          "videoUrl": "string"
        }
      ],
      "status": "Active|Completed|Paused",
      "progress": "number",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

**Frontend Fields:** All training plan fields including exercises array

### 3.2 Get Training Plan by ID
**Endpoint:** `GET /training-plans/{id}`

**Response:** Single training plan object with full details

### 3.3 Start Training Plan
**Endpoint:** `POST /training-plans/{id}/start`

**Request Body:**
```json
{
  "userId": "string",
  "startDate": "string"
}
```

**Response:**
```json
{
  "message": "string",
  "trainingPlanId": "string",
  "userId": "string",
  "startDate": "string",
  "endDate": "string"
}
```

---

## 4. Admin User Management APIs

### 4.1 Get All Users
**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `status`: Filter by status
- `role`: Filter by role
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "users": [
    {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "status": "active|inactive|banned",
      "role": "string",
      "roleId": "number",
      "createdAt": "string",
      "updatedAt": "string",
      "lastLoginAt": "string",
      "profileImage": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

**Frontend Fields:** All user fields for admin table display

### 4.2 Create User
**Endpoint:** `POST /admin/users`

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "roleId": "number"
}
```

**Response:** Created user object

### 4.3 Update User
**Endpoint:** `PUT /admin/users/{id}`

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "status": "active|inactive|banned",
  "roleId": "number"
}
```

**Response:** Updated user object

### 4.4 Delete User
**Endpoint:** `DELETE /admin/users/{id}`

**Response:**
```json
{
  "message": "string"
}
```

---

## 5. Admin Challenge Management APIs

### 5.1 Get All Challenges (Admin)
**Endpoint:** `GET /admin/challenges`

**Response:**
```json
{
  "challenges": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "linkVideos": "string",
      "status": "draft|active|inactive|completed",
      "difficult": "string",
      "participants": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All challenge fields for admin management

### 5.2 Create Challenge
**Endpoint:** `POST /admin/challenges`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "linkVideos": "string",
  "difficult": "string",
  "videoFile": "File"
}
```

**Response:** Created challenge object

### 5.3 Update Challenge
**Endpoint:** `PUT /admin/challenges/{id}`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "linkVideos": "string",
  "status": "draft|active|inactive|completed",
  "difficult": "string",
  "videoFile": "File"
}
```

**Response:** Updated challenge object

---

## 6. Admin Reward Management APIs

### 6.1 Get All Rewards
**Endpoint:** `GET /admin/rewards`

**Response:**
```json
{
  "rewards": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "points": "number",
      "claimed": "number",
      "linkImage": "string",
      "total": "number",
      "status": "active|inactive",
      "expiresAt": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All reward fields for admin table

### 6.2 Create Reward
**Endpoint:** `POST /admin/rewards`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "points": "number",
  "linkImage": "string",
  "total": "number",
  "expiresAt": "string",
  "imageFile": "File"
}
```

### 6.3 Update Reward
**Endpoint:** `PUT /admin/rewards/{id}`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "points": "number",
  "linkImage": "string",
  "total": "number",
  "status": "active|inactive",
  "expiresAt": "string",
  "imageFile": "File"
}
```

---

## 7. Admin Meal Management APIs

### 7.1 Get All Meals
**Endpoint:** `GET /admin/meals`

**Query Parameters:**
- `nutritionPlanId`: Filter by nutrition plan

**Response:**
```json
{
  "meals": [
    {
      "mealId": "number",
      "name": "string",
      "description": "string",
      "mealType": "breakfast|lunch|dinner|snack",
      "caloriesEstimate": "number",
      "nutritionPlanId": "number",
      "createdAt": "string",
      "updatedAt": "string",
      "foods": [
        {
          "mfId": "number",
          "foodId": "number",
          "foodName": "string",
          "quantityG": "number",
          "totalCalories": "number",
          "totalProtein": "number",
          "totalCarbs": "number",
          "totalFat": "number"
        }
      ]
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All meal fields including foods array

### 7.2 Create Meal
**Endpoint:** `POST /admin/meals`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "mealType": "breakfast|lunch|dinner|snack",
  "caloriesEstimate": "number",
  "nutritionPlanId": "number",
  "foods": [
    {
      "foodId": "number",
      "quantityG": "number"
    }
  ]
}
```

---

## 8. Admin Food Management APIs

### 8.1 Get All Foods
**Endpoint:** `GET /admin/foods`

**Response:**
```json
{
  "foods": [
    {
      "id": "number",
      "name": "string",
      "calories": "number",
      "protein": "number",
      "carbs": "number",
      "fat": "number",
      "fiber": "number",
      "serving": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All food fields for admin table

### 8.2 Create Food
**Endpoint:** `POST /admin/foods`

**Request Body:**
```json
{
  "name": "string",
  "calories": "number",
  "protein": "number",
  "carbs": "number",
  "fat": "number",
  "fiber": "number",
  "serving": "number"
}
```

---

## 9. Admin Training Plan Management APIs

### 9.1 Get All Training Plans (Admin)
**Endpoint:** `GET /admin/training-plans`

**Response:**
```json
{
  "trainingPlans": [
    {
      "id": "number",
      "title": "string",
      "durationWeeks": "string",
      "difficultyLevel": "beginner|intermediate|advanced",
      "subscribers": "number",
      "price": "number",
      "status": "published|draft|archived",
      "goalId": "number",
      "goalName": "string",
      "focusArea": "string",
      "createAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All training plan fields for admin management

### 9.2 Create Training Plan
**Endpoint:** `POST /admin/training-plans`

**Request Body:**
```json
{
  "title": "string",
  "durationWeeks": "string",
  "difficultyLevel": "beginner|intermediate|advanced",
  "price": "number",
  "goalId": "number",
  "focusArea": "string"
}
```

---

## 10. Admin Nutrition Plan Management APIs

### 10.1 Get All Nutrition Plans
**Endpoint:** `GET /admin/nutrition-plans`

**Response:**
```json
{
  "nutritionPlans": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "target": "string",
      "dailyCalories": "number",
      "subscribers": "number",
      "price": "number",
      "status": "published|draft|archived",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All nutrition plan fields

### 10.2 Create Nutrition Plan
**Endpoint:** `POST /admin/nutrition-plans`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "target": "string",
  "dailyCalories": "number",
  "price": "number"
}
```

---

## 11. Admin Transaction Management APIs

### 11.1 Get All Transactions
**Endpoint:** `GET /admin/transactions`

**Query Parameters:**
- `userId`: Filter by user
- `type`: Filter by transaction type
- `status`: Filter by status

**Response:**
```json
{
  "transactions": [
    {
      "id": "number",
      "userId": "string",
      "userName": "string",
      "amount": "number",
      "type": "deposit|withdrawal|reward|purchase",
      "date": "string",
      "status": "completed|pending|failed",
      "note": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All transaction fields for admin table

---

## 12. Admin Goal Management APIs

### 12.1 Get All Goals
**Endpoint:** `GET /admin/goals`

**Query Parameters:**
- `userId`: Filter by user
- `type`: Filter by goal type
- `status`: Filter by status

**Response:**
```json
{
  "goals": [
    {
      "id": "number",
      "userId": "string",
      "userName": "string",
      "type": "weight|steps|calories|workout|water|sleep|custom",
      "title": "string",
      "description": "string",
      "targetValue": "number",
      "currentValue": "number",
      "unit": "string",
      "status": "active|completed|abandoned|paused",
      "startDate": "string",
      "endDate": "string",
      "progress": "number",
      "createdAt": "string"
    }
  ],
  "total": "number"
}
```

**Frontend Fields:** All goal fields including progress calculation

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": "number",
  "timestamp": "string"
}
```

## Pagination

Endpoints that return lists support pagination:

```json
{
  "data": [...],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

## Frontend Required Fields Summary

### Authentication
- User profile: `id`, `email`, `fullName`, `role`, `status`, `profileImage`
- Tokens: `token`, `refreshToken`

### Dashboard
- Overview: `user`, `stats`, `recentActivities[]`, `activeGoals[]`
- Statistics: All period-based metrics and charts data

### User Profile
- Profile data: All user information fields
- Settings: `notifications`, `privacy`, `units`, `workout` preferences
- Achievements: `achievements[]` with unlock status

### Challenges
- List: `id`, `title`, `description`, `difficulty`, `participants`, `reward`, `status`
- Detail: All list fields + `video[]`, `participants[]`
- Participation: `joinedAt`, `progress`, `completed`

### Training Plans
- Available plans: `id`, `title`, `description`, `difficulty`, `duration`, `price`, `rating`, `instructor`
- My plans: `activePlans[]`, `completedPlans[]`, `progress`, `nextWorkout`
- Workout execution: `exercises[]`, `completed`, `progress`, `caloriesBurned`

### Workouts
- Session tracking: `sessionId`, `startTime`, `estimatedDuration`
- Exercise logging: `exerciseId`, `setNumber`, `reps`, `weight`, `duration`
- History: `workouts[]`, `stats` with totals and averages

### Leaderboards
- Global/Friends: `rank`, `user`, `value`, `change`, `badge`
- Challenge-specific: `rank`, `user`, `progress`, `completed`, `timeSpent`
- User rank: `rank`, `value`, `change`

### Community
- Feed: `posts[]` with user info, content, media, likes, comments
- Social interactions: `isLiked`, `likesCount`, `commentsCount`
- Post creation: Content, media uploads, workout/challenge sharing

### Goals
- Goal management: `goals[]`, `progress`, `streak`, `status`
- Statistics: `activeGoals`, `completedGoals`, `successRate`
- Progress tracking: `currentValue`, `targetValue`, `progress`

### Nutrition
- Available plans: `nutritionPlans[]`, `dailyCalories`, `mealTypes`
- Plan details: `meals[]`, `foods[]`, `shoppingList[]`
- Daily tracking: `meals[]`, `completed`, `progress`, `totalCalories`

### Rewards
- Available rewards: `rewards[]`, `points`, `claimed`, `category`
- User points: `userPoints`, `nextReward`

### Admin Management (Admin Panel Only)
- Users: `id`, `fullName`, `email`, `status`, `role`, `createdAt`, `lastLoginAt`
- Challenges: `id`, `title`, `status`, `difficult`, `participants`, `createdAt`
- Rewards: `id`, `name`, `points`, `status`, `claimed`, `total`, `expiresAt`
- Meals: `mealId`, `name`, `mealType`, `caloriesEstimate`, `foods[]`
- Foods: `id`, `name`, `calories`, `protein`, `carbs`, `fat`
- Training Plans: `id`, `title`, `difficultyLevel`, `status`, `subscribers`, `price`
- Nutrition Plans: `id`, `name`, `target`, `dailyCalories`, `status`, `subscribers`
- Transactions: `id`, `userName`, `amount`, `type`, `date`, `status`
- Goals: `id`, `userName`, `title`, `targetValue`, `currentValue`, `progress`, `status`

This documentation covers all the necessary API endpoints, request/response structures, and fields required for frontend implementation.
