import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Language } from '@/types';
import { getCurrentUser, saveUserToLocalStorage, login, signup, logout } from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginUser: (emailOrPhone: string, password: string, role: UserRole) => Promise<boolean>;
  signupUser: (
    name: string, 
    email: string, 
    phoneNumber: string, 
    password: string, 
    confirmPassword: string, 
    role: UserRole, 
    preferredLanguage: Language
  ) => Promise<boolean>;
  logoutUser: () => void;
  updateLanguagePreference: (language: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to preload reports for authority users
  const preloadReportsForAuthority = async () => {
    try {
      console.log('Preloading reports for authority user...');
      
      // Fetch all lost person reports (not filtered by authority)
      const { data: lostReports, error: lostError } = await supabase
        .from('lost_person_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (lostError) {
        console.error('Error preloading lost reports:', lostError);
      } else {
        console.log(`Preloaded ${lostReports?.length || 0} lost person reports`);
      }

      // Fetch all found person reports
      const { data: foundReports, error: foundError } = await supabase
        .from('found_person_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (foundError) {
        console.error('Error preloading found reports:', foundError);
      } else {
        console.log(`Preloaded ${foundReports?.length || 0} found person reports`);
      }

    } catch (error) {
      console.error('Error during report preloading:', error);
    }
  };

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZING ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        
        if (session?.user && session.user.email_confirmed_at) {
          console.log('User authenticated and email confirmed');
          
          // Check if we have a stored user with role information
          const storedUser = localStorage.getItem('pilgrim-user');
          let userData: User;
          
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              // Preserve the stored role and other data, just update the session info
              userData = {
                ...parsedUser,
                id: session.user.id,
                email: session.user.email,
                createdAt: new Date(session.user.created_at),
              };
              console.log('Using stored user data with preserved role:', userData);
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              // Fallback to creating new user data
              userData = {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email,
                phoneNumber: (session.user as any).user_metadata?.phone_number || '',
                role: ((session.user as any).user_metadata?.role as UserRole) || 'user',
                preferredLanguage: ((session.user as any).user_metadata?.preferred_language as Language) || 'english',
                createdAt: new Date(session.user.created_at),
              };
            }
          } else {
            // Create new user data if nothing stored
            userData = {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              phoneNumber: (session.user as any).user_metadata?.phone_number || '',
              role: ((session.user as any).user_metadata?.role as UserRole) || 'user',
              preferredLanguage: ((session.user as any).user_metadata?.preferred_language as Language) || 'english',
              createdAt: new Date(session.user.created_at),
            };
          }
          
          console.log('Setting user data:', userData);
          setUser(userData);
          saveUserToLocalStorage(userData);

          // If user is an authority, preload all reports immediately
          if (userData.role === 'authority') {
            console.log('Authority user detected, preloading reports...');
            setTimeout(() => {
              preloadReportsForAuthority();
            }, 0);
          }
        } else {
          console.log('No authenticated user or email not confirmed');
          setUser(null);
          localStorage.removeItem('pilgrim-user');
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        // First check for stored user data
        const storedUser = localStorage.getItem('pilgrim-user');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && session.user.email_confirmed_at && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Validate that the stored user matches the session user
            if (parsedUser.id === session.user.id) {
              setUser(parsedUser);
              console.log('Restored user from localStorage with role:', parsedUser.role);
              
              // If existing user is authority, preload reports
              if (parsedUser.role === 'authority') {
                console.log('Existing authority user found, preloading reports...');
                setTimeout(() => {
                  preloadReportsForAuthority();
                }, 0);
              }
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('pilgrim-user');
          }
        }
        
        // Fallback to getting current user if no valid stored data
        const userData = await getCurrentUser();
        setUser(userData);
        
        // If existing user is authority, preload reports
        if (userData?.role === 'authority') {
          console.log('Existing authority user found, preloading reports...');
          setTimeout(() => {
            preloadReportsForAuthority();
          }, 0);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginUser = async (emailOrPhone: string, password: string, role: UserRole): Promise<boolean> => {
    console.log('=== LOGIN USER FUNCTION START ===');
    
    try {
      // Enforce strict admin allowlist and password policy
      if (role === 'admin') {
        const allowedAdmins = [
          'yeolesakshi39@gmail.com',
          'komalshinde32004@gmail.com',
          'akankshashewale05@gmail.com',
          'bbtongare371122@kkwagh.edu.in',
        ];
        const email = emailOrPhone.toLowerCase();
        if (!email.includes('@') || !allowedAdmins.includes(email)) {
          toast({
            title: 'Admin login restricted',
            description: 'Only authorized admin emails can sign in.',
            variant: 'destructive',
          });
          return false;
        }
        if (password !== 'admin@123') {
          toast({
            title: 'Invalid admin password',
            description: 'Please enter the correct admin password.',
            variant: 'destructive',
          });
          return false;
        }

        // Bypass Supabase for admin allowlist and create a local session
        const adminUser = {
          id: `local-admin-${email}`,
          name: email.split('@')[0],
          email,
          phoneNumber: '',
          role: 'admin' as UserRole,
          preferredLanguage: 'english' as Language,
          createdAt: new Date(),
        };
        setUser(adminUser);
        saveUserToLocalStorage(adminUser);
        toast({ title: 'Login successful', description: `Welcome back, ${adminUser.name}!` });
        return true;
      }

      const response = await login(emailOrPhone, password, role);
      console.log('Login response:', response);
      
      if (response.success && response.userData) {
        console.log('Login successful, setting user data...');
        const updatedUserData = { ...response.userData, role };
        setUser(updatedUserData);
        saveUserToLocalStorage(updatedUserData);
        
        // If authority user, preload reports immediately after login
        if (role === 'authority') {
          console.log('Authority user logged in, triggering report preload...');
          setTimeout(() => {
            preloadReportsForAuthority();
          }, 0);
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${updatedUserData.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: response.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const signupUser = async (
    name: string, 
    email: string, 
    phoneNumber: string, 
    password: string, 
    confirmPassword: string, 
    role: UserRole, 
    preferredLanguage: Language
  ): Promise<boolean> => {
    console.log('=== SIGNUP USER FUNCTION START ===');
    
    try {
      const response = await signup(
        name, 
        email, 
        phoneNumber, 
        password, 
        confirmPassword, 
        role, 
        preferredLanguage
      );
      
      console.log('Signup response:', response);
      
      if (response.success) {
        toast({
          title: "Signup successful",
          description: response.message,
        });
        return true;
      } else {
        toast({
          title: "Signup failed",
          description: response.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logoutUser = async () => {
    console.log('=== LOGOUT USER ===');
    await logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateLanguagePreference = async (language: Language) => {
    if (user) {
      const updatedUser = { ...user, preferredLanguage: language };
      setUser(updatedUser);
      saveUserToLocalStorage(updatedUser);
      
      // Update in database
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: language })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  console.log('AuthContext render - user:', user, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      loginUser, 
      signupUser, 
      logoutUser, 
      updateLanguagePreference 
    }}>
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
