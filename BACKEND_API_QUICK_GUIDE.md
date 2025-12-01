# Backend API Implementation Guide

## Quick Reference - Required Endpoints

### Base URL
```
http://localhost:3000/api/admin
```

### Endpoints Needed

#### 1. Users
```
GET    /api/admin/user              → List all users
POST   /api/admin/user              → Create user
PUT    /api/admin/user/:id          → Update user
DELETE /api/admin/user/:id          → Delete user
```

**Request Body Example (POST/PUT):**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "User"
}
```

**Response Example (GET):**
```json
{
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "User",
      "status": "active",
      "joinDate": "2024-01-15"
    }
  ]
}
```

---

#### 2. Challenges
```
GET    /api/admin/challenge         → List all challenges
POST   /api/admin/challenge         → Create challenge
PUT    /api/admin/challenge/:id     → Update challenge
DELETE /api/admin/challenge/:id     → Delete challenge
```

**Request Body Example:**
```json
{
  "name": "Push-up Challenge",
  "description": "Complete 100 push-ups",
  "reward": 50,
  "participants": 0,
  "status": "active",
  "difficulty": "intermediate",
  "startDate": "2024-11-21",
  "endDate": "2024-12-21"
}
```

---

#### 3. Rewards
```
GET    /api/admin/reward            → List all rewards
POST   /api/admin/reward            → Create reward
PUT    /api/admin/reward/:id        → Update reward
DELETE /api/admin/reward/:id        → Delete reward
```

**Request Body Example:**
```json
{
  "name": "Free Month",
  "description": "1 month premium access",
  "points": 500,
  "claimed": 12,
  "total": 50,
  "status": "active",
  "expiresAt": "2024-12-31"
}
```

---

#### 4. Training Plans
```
GET    /api/admin/training-plan     → List all plans
POST   /api/admin/training-plan     → Create plan
PUT    /api/admin/training-plan/:id → Update plan
DELETE /api/admin/training-plan/:id → Delete plan
```

**Request Body Example:**
```json
{
  "name": "6-Week Beginner",
  "duration": "6 weeks",
  "difficulty": "beginner",
  "subscribers": 150,
  "price": 29.99,
  "status": "published",
  "focusArea": "Full Body",
  "updatedAt": "2024-11-21"
}
```

---

#### 5. Meals
```
GET    /api/admin/meal              → List all meals
POST   /api/admin/meal              → Create meal
PUT    /api/admin/meal/:id          → Update meal
DELETE /api/admin/meal/:id          → Delete meal
```

**Request Body Example:**
```json
{
  "name": "Grilled Chicken Salad",
  "calories": 350,
  "protein": 45,
  "carbs": 15,
  "fat": 8,
  "category": "lunch"
}
```

---

#### 6. Foods
```
GET    /api/admin/food              → List all foods
POST   /api/admin/food              → Create food
PUT    /api/admin/food/:id          → Update food
DELETE /api/admin/food/:id          → Delete food
```

**Request Body Example:**
```json
{
  "name": "Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "fiber": 0,
  "serving": "100g"
}
```

---

#### 7. Transactions
```
GET    /api/admin/transaction       → List all transactions
POST   /api/admin/transaction       → Create transaction
PUT    /api/admin/transaction/:id   → Update transaction
DELETE /api/admin/transaction/:id   → Delete transaction
```

**Request Body Example:**
```json
{
  "userId": 1,
  "userName": "John Doe",
  "type": "purchase",
  "amount": 99.99,
  "status": "completed",
  "date": "2024-11-21",
  "description": "Premium subscription"
}
```

---

#### 8. Goals
```
GET    /api/admin/goal              → List all goals
POST   /api/admin/goal              → Create goal
PUT    /api/admin/goal/:id          → Update goal
DELETE /api/admin/goal/:id          → Delete goal
```

**Request Body Example:**
```json
{
  "userId": "1",
  "userName": "John Doe",
  "type": "weight",
  "title": "Lose 10kg",
  "description": "Lose 10kg in 3 months",
  "targetValue": 75,
  "currentValue": 85,
  "unit": "kg",
  "status": "active",
  "startDate": "2024-11-21",
  "endDate": "2025-02-21"
}
```

---

## Response Format

All successful responses should follow this format:

**Single Item:**
```json
{
  "data": {
    "id": 1,
    "name": "Example"
    // ... other fields
  }
}
```

**List of Items:**
```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ]
}
```

**Errors:**
```json
{
  "error": "Error message here",
  "status": 400
}
```

---

## Frontend Implementation Reference

The frontend calls these endpoints using the `adminAPI` service:

```typescript
// Get all
const response = await userAPI.getAll();
const users = response.data;

// Create
const response = await userAPI.create(formData);

// Update
const response = await userAPI.update(id, formData);

// Delete
const response = await userAPI.delete(id);
```

---

## Testing the Endpoints

1. Start frontend on `http://localhost:5173`
2. Navigate to `/admin`
3. Open browser DevTools → Network tab
4. Try CRUD operations
5. Monitor API calls to `http://localhost:3000/api/admin/*`
6. Check response format matches examples above

---

## Mock Data Reference

If you need to populate initial data, refer to:
- `/src/api/mockData.ts` - Contains sample data for all resources

---

## Important Notes

1. All endpoints expect `Content-Type: application/json`
2. Response should always include `data` field (array or object)
3. Use `response.data` in frontend to extract the actual data
4. Errors can be logged and UI shows generic error message
5. Each resource ID should be an integer
6. Dates should be in ISO format (YYYY-MM-DD)

---

## Example Node.js/Express Implementation Pattern

```javascript
// GET all
app.get('/api/admin/user', (req, res) => {
  const users = database.users.getAll();
  res.json({ data: users });
});

// POST create
app.post('/api/admin/user', (req, res) => {
  const newUser = database.users.create(req.body);
  res.json({ data: newUser });
});

// PUT update
app.put('/api/admin/user/:id', (req, res) => {
  const updated = database.users.update(req.params.id, req.body);
  res.json({ data: updated });
});

// DELETE
app.delete('/api/admin/user/:id', (req, res) => {
  database.users.delete(req.params.id);
  res.json({ data: { success: true } });
});
```

---

**Status:** Ready for Backend Implementation ✅
**API Service Status:** Complete and Tested ✅
**Frontend Status:** Migrated and Building Successfully ✅
