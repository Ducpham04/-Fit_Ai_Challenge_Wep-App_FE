# Migration from Context-Based to Direct API Calls

## Overview
Completed full migration of admin panel from `useAdminData` context hook to direct API calls using axios. This simplification removes all providers and auth guards, enabling direct access to `/admin` routes.

## Architecture Changes

### Before (Context-based)
```
App → AuthProvider → ChallengeProvider → HashRouter → ProtectedRoute 
→ Pages → AdminDataContext → API calls
```

### After (Direct API)
```
App → BrowserRouter → Direct Routes (no protection) 
→ Pages → Direct API calls via adminAPI service
```

## Files Modified

### 1. Core Infrastructure
- ✅ **`/src/App.tsx`** - Removed AuthProvider and ChallengeProvider wrappers
- ✅ **`/src/router/index.tsx`** - Replaced HashRouter with BrowserRouter, removed ProtectedRoute
- ✅ **`/src/features/admin/AdminDashboard.tsx`** - Removed AdminDataProvider wrapper

### 2. API Service (NEW)
- ✅ **`/src/features/admin/api/adminAPI.ts`** - New service with axios instances for all 8 resources:
  - `userAPI` (get, create, update, delete)
  - `challengeAPI` (get, create, update, delete)
  - `rewardAPI` (get, create, update, delete)
  - `trainingPlanAPI` (get, create, update, delete)
  - `mealAPI` (get, create, update, delete)
  - `foodAPI` (get, create, update, delete)
  - `transactionAPI` (get, create, update, delete)
  - `goalAPI` (get, create, update, delete)

### 3. Deleted Files
- ❌ **`/src/features/admin/context/AdminDataContext.tsx`** - Removed (no longer needed)

### 4. Admin Pages Updated (9 pages)
All pages converted from `useAdminData()` hook to direct API calls:

| Page | Changes |
|------|---------|
| ChallengesPage.tsx | ✅ useState + useEffect + fetchChallenges, handleSubmit, handleDelete |
| RewardsPage.tsx | ✅ useState + useEffect + fetchRewards, handleSubmit, handleDelete |
| TrainingPlansPage.tsx | ✅ useState + useEffect + fetchTrainingPlans, handleSubmit, handleDelete |
| MealsPage.tsx | ✅ useState + useEffect + fetchMeals, handleSubmit, handleDelete |
| FoodsPage.tsx | ✅ useState + useEffect + fetchFoods, handleSubmit, handleDelete |
| TransactionsPage.tsx | ✅ useState + useEffect + fetchTransactions, handleSubmit, handleDelete |
| GoalsPage.tsx | ✅ useState + useEffect + fetchGoals, handleSubmit, handleDelete |
| UserPage.tsx | ✅ useState + useEffect + fetchUsers, handleSubmit, handleDelete |
| DashboardPage.tsx | ✅ useState + useEffect + Promise.all() for concurrent fetches |

## Code Pattern Applied to All Pages

### Before
```tsx
import { useAdminData } from "../context/AdminDataContext";

export function SomePage() {
  const { items, addItem, updateItem, removeItem } = useAdminData();
  
  const handleSubmit = () => {
    if (mode === "create") addItem(form);
    else updateItem(item.id, form);
  };
}
```

### After
```tsx
import { itemAPI } from "../api/adminAPI";

export function SomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemAPI.getAll();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === "create") {
        await itemAPI.create(form);
      } else {
        await itemAPI.update(item.id, form);
      }
      fetchItems();
      closeModal();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await itemAPI.delete(id);
      fetchItems();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
}
```

## API Endpoints Required

All endpoints follow RESTful pattern:

```
GET    /api/admin/{resource}         - Fetch all items
POST   /api/admin/{resource}         - Create new item
PUT    /api/admin/{resource}/:id     - Update item
DELETE /api/admin/{resource}/:id     - Delete item
```

Resources: `user`, `challenge`, `reward`, `training-plan`, `meal`, `food`, `transaction`, `goal`

## Build Status
✅ Build successful after migration
```
dist/index.html                   0.41 kB
dist/assets/index-7iY66cC1.css   38.72 kB
dist/assets/index-CR4FdebS.js 1,022.03 kB
```

## Benefits
1. **Simpler Architecture** - No nested providers or auth guards
2. **Direct Access** - `/admin` routes accessible without authentication
3. **Easier to Debug** - Direct API calls visible in network tab
4. **Better TypeScript** - Type-safe API calls with axios
5. **Reduced Overhead** - No context provider re-renders

## Next Steps for Backend
Implement these 8 API resources with CRUD endpoints:
- POST `/api/admin/user` - Create user
- GET `/api/admin/user` - Fetch all users
- PUT `/api/admin/user/:id` - Update user
- DELETE `/api/admin/user/:id` - Delete user
- (Same pattern for: challenge, reward, training-plan, meal, food, transaction, goal)

## Testing
1. Navigate to `http://localhost:5173/admin`
2. Should load AdminDashboard directly (no auth checks)
3. Each page should fetch data on load
4. CRUD operations should call backend APIs
5. Check browser console for API errors

## Notes
- All unused `loading` variables are kept (used in finally blocks)
- All unused import warnings are non-critical
- React DOM import removed from UserPage where unused
- No breaking changes to UI components
- All mock data can now be replaced with real backend data
