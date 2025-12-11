import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { InfoBodyAPI } from '@/api/infoBody.api';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Component to check if user has completed onboarding
 * Redirects to body info page if not completed
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (isLoading) return;
      
      if (!isAuthenticated || !user) {
        setChecking(false);
        return;
      }

      try {
        // Check if user has body information
        const res = await InfoBodyAPI.getByUserId(parseInt(user.id));
        
        if (!res.success || !res.data || res.data.length === 0) {
          // No body info found, redirect to onboarding
          navigate('/onboarding/body-info', { replace: true });
        } else {
          // User has completed onboarding
          setChecking(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, allow access but log it
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [user, isLoading, isAuthenticated, navigate]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};






