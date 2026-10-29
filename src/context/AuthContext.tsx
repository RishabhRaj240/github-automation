import React, { createContext, useContext, useEffect, useState } from 'react';
import { GitHubConnection, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { GitHubService } from '../services/githubService';

interface AuthContextType {
  user: UserProfile | null;
  githubConnection: GitHubConnection | null;
  isLoading: boolean;
  isDemoMode: boolean;
  customGeminiApiKey: string | null;
  setCustomGeminiApiKey: (key: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signInWithGitHubOAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  connectGitHubUsername: (usernameOrUrl: string) => Promise<{ success: boolean; error?: string }>;
  disconnectGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'demo-user-1234',
  email: 'developer@repopilot.dev',
  displayName: 'Alex Rivers (Demo)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  createdAt: new Date().toISOString(),
};

const DEMO_GITHUB: GitHubConnection = {
  id: 'demo-gh-conn',
  userId: 'demo-user-1234',
  githubUserId: '98765432',
  githubUsername: 'octopilot-demo',
  githubProfileUrl: 'https://github.com/octopilot-demo',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  grantedScopes: ['repo', 'user:email', 'read:org'],
  connectedAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [githubConnection, setGithubConnection] = useState<GitHubConnection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string | null>(() => {
    return localStorage.getItem('repopilot_gemini_key') || null;
  });

  const saveCustomGeminiKey = (key: string) => {
    if (!key) {
      localStorage.removeItem('repopilot_gemini_key');
      setCustomGeminiApiKey(null);
    } else {
      localStorage.setItem('repopilot_gemini_key', key);
      setCustomGeminiApiKey(key);
    }
  };

  useEffect(() => {
    // Check if demo mode was explicitly persisted
    const storedDemo = localStorage.getItem('repopilot_demo_active');
    if (storedDemo === 'true' || !isSupabaseConfigured) {
      setUser(DEMO_USER);
      setGithubConnection(DEMO_GITHUB);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // Real Supabase session check
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Developer',
            avatarUrl: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
          });
          await fetchGitHubConnection(session.user.id);
        }
      } catch (err) {
        console.warn('Session init failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Developer',
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: session.user.created_at,
        });
        await fetchGitHubConnection(session.user.id);
      } else if (!isDemoMode) {
        setUser(null);
        setGithubConnection(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const fetchGitHubConnection = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_github_connections')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setGithubConnection({
          id: data.id,
          userId: data.user_id,
          githubUserId: data.github_user_id,
          githubUsername: data.github_username,
          githubProfileUrl: data.github_profile_url,
          grantedScopes: data.granted_scopes || ['repo'],
          connectedAt: data.connected_at,
        });
      }
    } catch {
      // Ignore if table/view not yet reachable
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      setUser(DEMO_USER);
      setGithubConnection(DEMO_GITHUB);
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    if (isDemoMode) {
      setUser({ ...DEMO_USER, email, displayName: displayName || 'Developer' });
      return {};
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGitHubOAuth = async () => {
    if (isDemoMode) {
      setUser(DEMO_USER);
      setGithubConnection(DEMO_GITHUB);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user user:email',
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('repopilot_demo_active');
      setUser(null);
      setGithubConnection(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setGithubConnection(null);
  };

  const enableDemoMode = () => {
    localStorage.setItem('repopilot_demo_active', 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setGithubConnection(DEMO_GITHUB);
  };

  const disableDemoMode = () => {
    localStorage.removeItem('repopilot_demo_active');
    setIsDemoMode(false);
    setUser(null);
    setGithubConnection(null);
  };

  const connectGitHubUsername = async (usernameOrUrl: string): Promise<{ success: boolean; error?: string }> => {
    const username = GitHubService.extractUsernameFromInput(usernameOrUrl);
    if (!username) {
      return { success: false, error: 'Please enter a valid GitHub username or profile URL.' };
    }

    // Verify existence via GitHub API
    const profile = await GitHubService.fetchPublicUserProfile(username);
    if (!profile) {
      return { success: false, error: `GitHub profile '@${username}' could not be found or is unreachable.` };
    }

    const newConn: GitHubConnection = {
      id: `gh-conn-${Date.now()}`,
      userId: user?.id || 'demo-user',
      githubUserId: String(profile.id),
      githubUsername: profile.login,
      githubProfileUrl: profile.html_url,
      avatarUrl: profile.avatar_url,
      grantedScopes: ['repo', 'user:email'],
      connectedAt: new Date().toISOString(),
    };

    setGithubConnection(newConn);
    return { success: true };
  };

  const disconnectGitHub = async () => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        await supabase.functions.invoke('github-disconnect');
      } catch {
        // fallback
      }
    }
    setGithubConnection(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        githubConnection,
        isLoading,
        isDemoMode,
        customGeminiApiKey,
        setCustomGeminiApiKey: saveCustomGeminiKey,
        signInWithEmail,
        signUpWithEmail,
        signInWithGitHubOAuth,
        signOut,
        enableDemoMode,
        disableDemoMode,
        connectGitHubUsername,
        disconnectGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

