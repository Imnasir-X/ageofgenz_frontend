import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { loginUser, registerUser, socialAuth } from '../utils/api'; // ← ADD registerUser import

interface User {
  id: number;
  email: string;
  username: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  bio?: string;
  is_subscriber?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  socialLogin: (provider: string, accessToken: string, email?: string) => Promise<boolean>;
  setAuthTokens: (access: string, refresh: string, userData?: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!token && !!user;

  const setAuthTokens = (access: string, refresh: string, userData?: User) => {
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    setToken(access);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  // Improved login function with detailed logging and error handling
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      console.log('🔐 Frontend: Starting login for:', email);
      
      const response = await loginUser(email, password);
      
      console.log('🔐 Frontend: Login response:', {
        status: response.status,
        data: response.data,
        hasAccess: !!response.data?.access,
        hasRefresh: !!response.data?.refresh,
        hasUser: !!response.data?.user
      });
      
      if (response.data?.access && response.data?.refresh) {
        setAuthTokens(response.data.access, response.data.refresh, response.data.user);

        console.log('dY"? Frontend: Login successful, user set!');
        return true;
      } else {
        console.error('🔐 Frontend: Missing tokens in response');
        throw new Error('Invalid response format - missing tokens');
      }
    } catch (error: any) {
      console.error('🔐 Frontend: Login failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your connection.';
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string, accessToken: string, email?: string) => {
    try {
      setIsLoading(true);
      console.log('Social login starting for:', provider);
      const response = await socialAuth(provider, accessToken, email);

      if (response.data?.access && response.data?.refresh) {
        setAuthTokens(response.data.access, response.data.refresh, response.data.user);
        return true;
      }

      throw new Error('Invalid response format - missing tokens');
    } catch (error: any) {
      console.error('Social login failed:', error);
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message ||
                          'Social login failed. Please try again.';
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ADD REGISTER FUNCTION
  const register = async (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    firstName?: string,
    lastName?: string
  ): Promise<void> => {
    try {
      console.log('Attempting registration for:', email);
      const registrationData = {
        username,
        email,
        password,
        password_confirm,
        first_name: firstName || '',
        last_name: lastName || '',
      };
      const response = await registerUser(registrationData);
      console.log('Registration response:', response.data);
      
      // If registration returns user data, set user (no tokens expected from register endpoint)
      if (response.data.user) {
        const userData = response.data.user;
        const normalizedUser: User = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          // The following fields may not exist on userData, so set as empty or undefined
          role: (userData as any).role || 'user',
          first_name: (userData as any).first_name || firstName || '',
          last_name: (userData as any).last_name || lastName || '',
          full_name: (userData as any).full_name || `${firstName || ''} ${lastName || ''}`.trim(),
          bio: (userData as any).bio || '',
          is_subscriber: (userData as any).is_subscriber || false,
        };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
      
      console.log('Registration successful');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          // Handle Django validation errors
          if (data.email) {
            errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
          } else if (data.username) {
            errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
          } else if (data.password) {
            errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) 
              ? data.non_field_errors[0] 
              : data.non_field_errors;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else {
            errorMessage = 'Invalid registration data';
          }
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = (): void => {
    console.log('Logging out user');
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  };

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData && userData.id && userData.email) {
              setToken(storedToken);
              setUser(userData);
              console.log('Restored user session:', userData);
            } else {
              console.log('Invalid stored user data, clearing session');
              logout();
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            logout();
          }
        } else {
          console.log('No existing user session found');
        }
      } catch (error) {
        console.error('Error restoring user session:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register, // ← ADD register to context value
    socialLogin,
    setAuthTokens,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;