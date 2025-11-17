import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

// Normalize a user-entered phone number to E.164 format.
// Default country: IN (+91). Accepts 10-digit local numbers and already E.164 numbers.
function normalizePhoneToE164(input: string): string | null {
  const digitsOnly = (input || '').replace(/\D+/g, '');
  if (!digitsOnly) return null;
  // Already includes country code (e.g., 91xxxxxxxxxx or 1xxxxxxxxxx etc.)
  if (digitsOnly.length >= 11 && input.trim().startsWith('+')) {
    return `+${digitsOnly}`;
  }
  // If 12+ digits without +, assume user omitted '+'. Prepend it.
  if (digitsOnly.length >= 11 && !input.trim().startsWith('+')) {
    return `+${digitsOnly}`;
  }
  // If 10 digits, treat as Indian local number and prepend +91
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  return null; // Unsupported length
}

export const login = async (
  emailOrPhone: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; message: string; userData?: any }> => {
  try {
    console.log('=== AUTH UTILS LOGIN START ===');
    console.log('Attempting login for:', emailOrPhone);
    
    // Support both email and phone-number + password by trying both
    let data: any;
    let error: any;
    if (emailOrPhone.includes('@')) {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password,
      }));
    } else {
      const normalized = normalizePhoneToE164(emailOrPhone);
      if (!normalized) {
        return { 
          success: false, 
          message: 'Please enter a valid phone number (10 digits or E.164 format).' 
        };
      }
      ({ data, error } = await supabase.auth.signInWithPassword({
        phone: normalized,
        password,
      }));
    }

    console.log('Supabase auth response:', { data: !!data, error: error?.message });

    if (error) {
      console.log('Login error:', error.message);
      // Handle specific error cases
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          message: 'Please check your email and click the verification link before logging in. Check your spam folder if you don\'t see the email.' 
        };
      }
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          message: 'Invalid email or password. Please check your credentials and try again.' 
        };
      }
      return { success: false, message: error.message };
    }

    if (data.user) {
      console.log('Login successful, creating user data...');
      
      // Create user data immediately without waiting for profile fetch
      const userData = {
        id: data.user.id,
        name: data.user.email?.split('@')[0] || 'User',
        email: data.user.email || (emailOrPhone.includes('@') ? emailOrPhone : undefined),
        phoneNumber: emailOrPhone.includes('@') ? '' : emailOrPhone,
        role: role,
        preferredLanguage: 'english',
        createdAt: new Date(data.user.created_at),
      };

      console.log('User data created successfully:', userData);
      console.log('=== AUTH UTILS LOGIN END - SUCCESS ===');
      return { 
        success: true, 
        message: 'Login successful', 
        userData 
      };
    }

    console.log('=== AUTH UTILS LOGIN END - NO USER ===');
    return { success: false, message: 'Login failed' };
  } catch (error: any) {
    console.error('=== AUTH UTILS LOGIN ERROR ===', error);
    return { success: false, message: error.message || 'An error occurred during login' };
  }
};

export const signup = async (
  name: string,
  email: string,
  phoneNumber: string,
  password: string,
  confirmPassword: string,
  role: UserRole,
  preferredLanguage: string
): Promise<{ success: boolean; message: string; userData?: any }> => {
  try {
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name,
          phone_number: phoneNumber,
          role: role,
          preferred_language: preferredLanguage,
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { 
          success: false, 
          message: 'An account with this email already exists. Please try logging in instead.' 
        };
      }
      return { success: false, message: error.message };
    }

    if (data.user) {
      const userData = {
        id: data.user.id,
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        role: role,
        preferredLanguage: preferredLanguage,
        createdAt: new Date(),
      };

      return { success: true, message: 'Signup successful! Please check your email to verify your account before logging in.', userData };
    }

    return { success: false, message: 'Signup failed' };
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred during signup' };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem('pilgrim-user');
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    console.log('=== GET CURRENT USER START ===');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No session found');
      return null;
    }

    console.log('Session found, creating user data...');
    
    // Create basic user data immediately
    const userData = {
      id: session.user.id,
      name: session.user.email?.split('@')[0] || 'User',
      email: session.user.email,
      phoneNumber: (session.user as any).user_metadata?.phone_number || '',
      role: ((session.user as any).user_metadata?.role as UserRole) || 'user',
      preferredLanguage: (session.user as any).user_metadata?.preferred_language || 'english',
      createdAt: new Date(session.user.created_at),
    };

    console.log('=== GET CURRENT USER END - SUCCESS ===', userData);
    return userData;
  } catch (error) {
    console.error('=== GET CURRENT USER ERROR ===', error);
    return null;
  }
};

export const saveUserToLocalStorage = (userData: any): void => {
  localStorage.setItem('pilgrim-user', JSON.stringify(userData));
};
