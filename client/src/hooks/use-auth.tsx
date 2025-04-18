import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  fullName: string;
  clientId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, fullName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // Important for cookies
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid username or password",
          variant: "destructive"
        });
        return false;
      }

      const data = await response.json();
      setUser(data);
      return true;
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, fullName: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // Important for cookies
        body: JSON.stringify({ 
          username: email, // Using email as username
          fullName,       // Include fullName in the request
          password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Could not create account",
          variant: "destructive"
        });
        return false;
      }

      const data = await response.json();
      setUser(data);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Important for cookies
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Important for cookies
      });

      if (!response.ok) {
        setUser(null);
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}