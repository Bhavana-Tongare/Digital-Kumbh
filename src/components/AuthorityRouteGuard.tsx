import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthorityRouteGuardProps {
  children: React.ReactNode;
}

const AuthorityRouteGuard: React.FC<AuthorityRouteGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    toast({
      title: 'Access Denied',
      description: 'Please log in to access this page.',
      variant: 'destructive',
    });
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'authority') {
    toast({
      title: 'Access Denied',
      description: 'Only authorities can access this page.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthorityRouteGuard;



