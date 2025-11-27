'use client';

import { createContext, useContext, ReactNode } from 'react';
import * as React from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simple context provider without state management
  // Auth state is checked directly in RequireAuth component
  return (
    <AuthContext.Provider value={{ isAuthenticated: false, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  React.useEffect(() => {
    // Check auth only on client
    const checkAuth = async () => {
      const { getToken } = await import('@/lib/auth');
      const token = getToken();
      setIsAuthenticated(!!token);
      setIsChecking(false);
      
      if (!token && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
