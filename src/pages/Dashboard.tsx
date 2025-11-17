
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('Dashboard component - user:', user, 'isLoading:', isLoading);
    
    if (isLoading) {
      console.log('Still loading user data...');
      return;
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    if (!redirecting) {
      console.log('User found, redirecting based on role:', user.role);
      setRedirecting(true);
      
      // Redirect based on user role immediately
      const targetRoute = user.role === 'user' ? '/user-dashboard' 
        : user.role === 'authority' ? '/authority-dashboard' 
        : user.role === 'admin' ? '/admin-dashboard' 
        : '/user-dashboard';
      
      console.log('Redirecting to:', targetRoute);
      navigate(targetRoute, { replace: true });
    }
  }, [user, isLoading, navigate, redirecting]);

  // Show a loading spinner while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pilgrim-peach to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pilgrim-orange mx-auto mb-4"></div>
        <p className="text-pilgrim-brown">
          {isLoading ? 'Loading your dashboard...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
