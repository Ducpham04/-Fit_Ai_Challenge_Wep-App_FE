// Simple Admin API Service with detailed console logging
import client from '../../../api/client'; // ✅ Dùng client có token
import { tokenService } from '../../../api/token.service';

const API_BASE = '/admin';

// Mock Data
const MOCK_USERS = [
  { id: 1, fullName: "John Doe", email: "john@example.com", role: "Admin", avatar: "https://via.placeholder.com/40", createdAt: new Date().toISOString(), status: "active" },
  { id: 2, fullName: "Jane Smith", email: "jane@example.com", role: "Premium", avatar: "https://via.placeholder.com/40", createdAt: new Date().toISOString(), status: "pending" },
];

const MOCK_CHALLENGES = [
  { id: 1, name: '100 Push-ups', description: 'Complete 100 push-ups', difficulty: 'Hard', reward: 100 },
  { id: 2, name: '50 Squats', description: 'Complete 50 squats', difficulty: 'Medium', reward: 50 },
];

const MOCK_REWARDS = [
  { id: 1, name: 'Gold Badge', points: 100, description: 'Achievement for completing challenges' },
  { id: 2, name: 'Silver Badge', points: 50, description: 'Achievement for participation' },
];

const MOCK_TRAINING_PLANS = [
  { id: 1, name: "Beginner Strength", duration: "30 ngày", difficulty: "beginner", subscribers: 245, price: 29, status: "published", focusArea: "Strength & Mobility", updatedAt: new Date().toISOString().slice(0,10) },
  { id: 2, name: "Advanced Cardio", duration: "45 ngày", difficulty: "advanced", subscribers: 132, price: 39, status: "draft", focusArea: "Endurance", updatedAt: new Date().toISOString().slice(0,10) },
  { id: 3, name: "HIIT Fat Burn", duration: "21 ngày", difficulty: "intermediate", subscribers: 198, price: 35, status: "published", focusArea: "HIIT", updatedAt: new Date().toISOString().slice(0,10) },
];

const MOCK_MEALS = [
  { id: 1, name: 'High Protein Breakfast', calories: 450, protein: 30 },
  { id: 2, name: 'Balanced Lunch', calories: 650, protein: 40 },
];

const MOCK_FOODS = [
  { id: 1, name: 'Chicken Breast', calories: 165, protein: 31 },
  { id: 2, name: 'Brown Rice', calories: 111, protein: 3 },
];

const MOCK_TRANSACTIONS = [
  { id: 1, userId: "USR-001", userName: "John Doe", amount: 120, type: "deposit", date: new Date().toISOString().slice(0,10), status: "completed", note: "Stripe charge #1234" },
  { id: 2, userId: "USR-002", userName: "Jane Smith", amount: 45, type: "reward", date: new Date().toISOString().slice(0,10), status: "pending", note: "Weekly challenge reward" },
  { id: 3, userId: "USR-003", userName: "Alex Nguyen", amount: 59, type: "purchase", date: new Date().toISOString().slice(0,10), status: "failed", note: "Card declined" },
];

const MOCK_GOALS = [
  { id: 1, userId: 1, name: 'Lose 5kg', target: 5, progress: 2, unit: 'kg' },
  { id: 2, userId: 2, name: 'Run 100km', target: 100, progress: 45, unit: 'km' },
];

// -------------------------------
// Wrapper function with console logs - throw error for mutation operations
async function callAPIWithFallback(apiCall: () => Promise<any>, mockData: any[], apiName = 'API', isMutation = false) {
  try {
    console.log(`🌐 [${apiName}] Calling API...`);
    const response = await apiCall();
    console.log(`✅ [${apiName}] Raw response:`, response);
    console.log(`✅ [${apiName}] response.data:`, response?.data);
    
    // Return response as-is so pages can handle the structure
    return response;
  } catch (error) {
    console.warn(`⚠️ [${apiName}] Failed - Error:`, error);
    
    // For mutations (POST/PUT/DELETE), throw error instead of fallback
    if (isMutation) {
      console.error(`❌ [${apiName}] Mutation failed - throwing error`);
      throw error;
    }
    
    // For read operations (GET), fallback to mock
    console.warn(`⚠️ [${apiName}] Using mock data as fallback`);
    return { data: mockData };
  }
}

// -------------------------------
// Users API
// -------------------------------
export const userAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/admin/users'), MOCK_USERS, 'GET /admin/user'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/user', data), MOCK_USERS, 'POST /admin/user'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/user/${id}`, data), MOCK_USERS, `PUT /admin/user/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/user/${id}`), MOCK_USERS, `DELETE /admin/user/${id}`),
};

export const infBodyAPI = {
  getBodyData: (id: number) => callAPIWithFallback(() => client.get(`/admin/information-body/${id}`),MOCK_USERS

)}
// -------------------------------
// Challenges API
// -------------------------------
export const challengeAPI = {
  getAll: () =>
    callAPIWithFallback(
      () => client.get("/admin/challenges"),
      MOCK_CHALLENGES,
      "GET /admin/challenges"
    ),

  create: (payload: any) => {
    console.log("📤 CREATE Challenge - Payload:", payload);
    
    return callAPIWithFallback(
      () => {
        const fd = new FormData();

        // Ensure safe data
        const safeData = {
          title: payload.title?.trim() || "",
          description: payload.description?.trim() || "",
          status: payload.status || "ACTIVE",
          difficult: payload.difficult || "BEGINER",
        };

        console.log("📦 Safe data:", safeData);
        fd.append("data", JSON.stringify(safeData));

        // Attach video file if present
        if (payload.videoFile instanceof File) {
          console.log("✅ Video file attached:", payload.videoFile.name, `(${payload.videoFile.size} bytes)`);
          fd.append("video", payload.videoFile);
        } else if (payload.video instanceof File) {
          console.log("✅ Video file attached (video key):", payload.video.name);
          fd.append("video", payload.video);
        } else {
          console.log("ℹ️ No video file");
        }

        // Debug FormData content
        console.log("📋 FormData entries:");
        for (const [key, value] of fd.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }

        return client.post(`/admin/challenges`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      },
      MOCK_CHALLENGES,
      "POST /admin/challenges",
      true // isMutation = true
    );
  },

  update: (id: number, payload: any) => {
    console.log("📤 UPDATE Challenge ID:", id, "Payload:", payload);
    
    return callAPIWithFallback(
      () => {
        const fd = new FormData();

        const safeData = {
          title: payload.title?.trim() || "",
          description: payload.description?.trim() || "",
          status: payload.status || "ACTIVE",
          difficult: payload.difficult || "BEGINER",
        };

        console.log("📦 Safe data:", safeData);
        fd.append("data", JSON.stringify(safeData));

        if (payload.videoFile instanceof File) {
          console.log("✅ Video file attached:", payload.videoFile.name, `(${payload.videoFile.size} bytes)`);
          fd.append("video", payload.videoFile);
        } else if (payload.video instanceof File) {
          console.log("✅ Video file attached (video key):", payload.video.name);
          fd.append("video", payload.video);
        } else {
          console.log("ℹ️ No video file");
        }

        console.log("📋 FormData entries:");
        for (const [key, value] of fd.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }

        return client.put(`/admin/challenges/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      },
      MOCK_CHALLENGES,
      `PUT /admin/challenges/${id}`,
      true // isMutation = true
    );
  },

  delete: (id: number) => {
    console.log("🗑️ DELETE Challenge ID:", id);
    return callAPIWithFallback(
      () => client.delete(`/admin/challenges/${id}`),
      MOCK_CHALLENGES,
      `DELETE /admin/challenges/${id}`,
      true // isMutation = true
    );
  },
};


// -------------------------------
// Rewards API
// -------------------------------
export const rewardAPI = {
  create: (form: any) => {
const fd = new FormData();

// Tạo object chỉ chứa dữ liệu "text/number"
const payloadData = {
  name: form.name,
  description: form.description,
  points: form.points,
  claimed: form.claimed,
  expiresAt: form.expiresAt,
  status: form.status,
  linkImage: form.linkImage,
  total: form.total,
};

fd.append("reward", JSON.stringify(payloadData));
console.log(fd)
// File vẫn append riêng
if (form.imageFile instanceof File) {
  fd.append("file", form.imageFile);
}



    return callAPIWithFallback(
      () => client.post("/admin/rewards", form, { headers: { "Content-Type": "multipart/form-data" } }),
      MOCK_REWARDS,
      "POST /admin/rewards",
      true
    );
  },

  update: (id: number, payload: any) => {
    const fd = new FormData();
    fd.append("reward", JSON.stringify(payload));
    if (payload.imageFile instanceof File) {
      fd.append("file", payload.imageFile);
    }

    return callAPIWithFallback(
      () => client.put(`/admin/rewards/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } }),
      MOCK_REWARDS,
      `PUT /admin/rewards/${id}`,
      true
    );
  },

  getAll: () => callAPIWithFallback(() => client.get("/admin/rewards"), MOCK_REWARDS, "GET /admin/rewards"),

  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/rewards/${id}`), MOCK_REWARDS, `DELETE /admin/rewards/${id}`)
};



// -------------------------------
// Training Plans API
// -------------------------------
export const trainingPlanAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/admin/training-plans'), MOCK_TRAINING_PLANS, 'GET /admin/training-plan'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/training-plans', data), MOCK_TRAINING_PLANS, 'POST /admin/training-plan'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/training-plans/${id}`, data), MOCK_TRAINING_PLANS, `PUT /admin/training-plan/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/training-plans/${id}`), MOCK_TRAINING_PLANS, `DELETE /admin/training-plan/${id}`),
  getById : (id : number) => callAPIWithFallback(() => client.get(`/user/training-details/${id}`),  MOCK_TRAINING_PLANS )  
  
};

// -------------------------------
// Meals API
// -------------------------------
export const mealAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/admin/meals'), MOCK_MEALS, 'GET /admin/meal'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/meals', data), MOCK_MEALS, 'POST /admin/meal'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/meals/${id}`, data), MOCK_MEALS, `PUT /admin/meal/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/meals/${id}`), MOCK_MEALS, `DELETE /admin/meal/${id}`),
};

// -------------------------------
// Foods API
// -------------------------------
export const foodAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/foods'), MOCK_FOODS, 'GET /admin/food'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/foods', data), MOCK_FOODS, 'POST /admin/food'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/foods/${id}`, data), MOCK_FOODS, `PUT /admin/food/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/foods/${id}`), MOCK_FOODS, `DELETE /admin/food/${id}`),
};

// -------------------------------
// Transactions API
// -------------------------------
export const transactionAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/admin/transaction'), MOCK_TRANSACTIONS, 'GET /admin/transaction'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/transaction', data), MOCK_TRANSACTIONS, 'POST /admin/transaction'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/transaction/${id}`, data), MOCK_TRANSACTIONS, `PUT /admin/transaction/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/transaction/${id}`), MOCK_TRANSACTIONS, `DELETE /admin/transaction/${id}`),
};

// -------------------------------
// Goals API
// -------------------------------
export const goalAPI = {
  getAll: () => callAPIWithFallback(() => client.get('/admin/goals'), MOCK_GOALS, 'GET /admin/goal'),
  create: (data: any) => callAPIWithFallback(() => client.post('/admin/goals', data), MOCK_GOALS, 'POST /admin/goal'),
  update: (id: number, data: any) => callAPIWithFallback(() => client.put(`/admin/goals/${id}`, data), MOCK_GOALS, `PUT /admin/goal/${id}`),
  delete: (id: number) => callAPIWithFallback(() => client.delete(`/admin/goals/${id}`), MOCK_GOALS, `DELETE /admin/goal/${id}`),
};


export default client;
