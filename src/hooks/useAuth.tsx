
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name?: string;
  companyName?: string;
  role?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, companyName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<Profile>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Defer profile fetching with setTimeout to prevent auth deadlock
        if (newSession?.user?.id) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user?.id) {
        fetchUserProfile(initialSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name,
          companyName: data.company_name,
          role: data.role,
          avatarUrl: data.avatar_url
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, companyName: string, role: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            role: role
          }
        }
      });

      if (error) throw error;
      
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out.");
    }
  };

  const updateUserProfile = async (userData: Partial<Profile>) => {
    if (!user || !profile) return;
    
    try {
      // Convert from camelCase to snake_case for database
      const updateData = {
        name: userData.name,
        company_name: userData.companyName,
        role: userData.role,
        avatar_url: userData.avatarUrl
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile({
        ...profile,
        ...userData
      });
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        login,
        signup,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
