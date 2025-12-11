import { useImageUrl } from '@/hooks/useFileUrl';
import { AdminTrainingPlan } from '@/features/admin/types/admin-entities';

interface TrainingPlanCardProps {
  plan: AdminTrainingPlan;
  onView?: (plan: AdminTrainingPlan) => void;
  onEdit?: (plan: AdminTrainingPlan) => void;
  onDelete?: (plan: AdminTrainingPlan) => void;
}

/**
 * Component để hiển thị Training Plan card với image từ presigned URL
 */
export function TrainingPlanCard({ plan, onView, onEdit, onDelete }: TrainingPlanCardProps) {
  const imageUrl = useImageUrl(plan.linkImage);
  
  // Component implementation sẽ được thêm vào TrainingPlansPage
  return null; // Placeholder
}

