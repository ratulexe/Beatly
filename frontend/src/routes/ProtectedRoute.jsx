import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

const ProtectedRoute = ({ children }) => {
  const { profile, isLoading, isFetching } = useProfile();
  const location = useLocation();

  if (isLoading || (isFetching && !profile)) {
    return (
      <div className="flex justify-center items-center h-screen bg-beatly-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beatly-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
