// Debug Helper - Check Console Logs

/**
 * Khi bạn bấm training plan, bạn sẽ thấy các logs sau trong Browser Console:
 * 
 * 1. Training Plans Loaded:
 *    Sẽ show tất cả plans được load, và từng plan sẽ show:
 *    - id: ID của plan
 *    - trainingPlanId: Training Plan ID (dùng để fetch details)
 *    - planName: Tên training plan
 * 
 *    Nếu trainingPlanId undefined hoặc null ở đây → API BE không return field này
 *    
 * 2. Selected Plan:
 *    Sẽ show plan object khi bạn click:
 *    - Kiểm tra có trainingPlanId hay không
 *    
 * 3. Plan trainingPlanId:
 *    Giá trị trainingPlanId được pass vào TrainingPlanDetailPage
 *    
 * 4. Loading Training Plan:
 *    Sẽ show:
 *    - trainingPlanId (raw): Giá trị nhận được
 *    - type: Kiểu dữ liệu (string/number)
 *    - numId: Sau khi parse
 *    - Number(trainingPlanId): Kết quả của Number()
 *    
 *    Nếu numId = NaN → trainingPlanId không phải là valid number
 * 
 * 5. GET http://localhost:8080/api/admin/training-plan-details/{trainingPlanId}
 *    Sẽ show actual request URL
 *    Nếu trainingPlanId = NaN → URL sẽ là ".../training-plan-details/NaN"
 *    
 * ============================================
 * 
 * SOLUTIONS:
 * 
 * 1. Nếu trainingPlanId undefined ở Mock Data:
 *    → API BE cần return trainingPlanId field
 *    → HOẶC MockData cần thêm trainingPlanId
 * 
 * 2. Nếu trainingPlanId là string nhưng không convert được số:
 *    → Cần check format dữ liệu từ BE
 *    → parseInt() sẽ fail nếu không phải số
 * 
 * 3. getCurrentTrainingPlans() Response Format:
 *    Check xem response có structure:
 *    {
 *      data: [
 *        {
 *          id: number,
 *          trainingPlanId: number,  ← Cần field này
 *          planName: string,
 *          ...
 *        }
 *      ]
 *    }
 * 
 * ============================================
 */

export const DEBUG_NOTES = `
Các console.log đã thêm:
1. MyTrainingPlans.tsx loadPlans() - Show all loaded plans
2. MyTrainingPlans.tsx onClick - Show selected plan
3. MyChallengePage.tsx - Show trainingPlanId passed
4. TrainingPlanDetailPage.tsx loadTrainingPlan() - Show trainingPlanId parsing
`;
