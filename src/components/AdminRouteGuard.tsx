import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // List of authorized admin emails
  const allowedAdmins = [
    'yeolesakshi39@gmail.com',
    'komalshinde32004@gmail.com',
    'akankshashewale05@gmail.com',
    'bbtongare371122@kkwagh.edu.in',
  ];

  // Check if user is authenticated
  if (!user) {
    toast({
      title: 'Access Denied',
      description: 'Please log in to access this page.',
      variant: 'destructive',
    });
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role (prevent non-admins)
  if (user.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access the admin dashboard.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user's email is in the allowed admin list
  if (!user.email || !allowedAdmins.includes(user.email)) {
    toast({
      title: 'Access Denied',
      description: 'Only authorized admin accounts can access the admin dashboard.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  // User is authorized, render the protected content
  return <>{children}</>;
};

export default AdminRouteGuard;
