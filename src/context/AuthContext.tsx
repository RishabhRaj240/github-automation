import React, { createContext, useContext, useEffect, useState } from 'react';
import { GitHubConnection, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { GitHubService } from '../services/githubService';

interface AuthContextType {
  user: UserProfile | null;
  githubConnection: GitHubConnection | null;
  githubAccessToken: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  customGeminiApiKey: string | null;
  setCustomGeminiApiKey: (key: string) => void;
  setGithubAccessToken: (token: string | null) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signInWithGitHubOAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  connectGitHubUsername: (usernameOrUrl: string) => Promise<{ success: boolean; error?: string }>;
  connectGitHubWithToken: (token: string) => Promise<{ success: boolean; error?: string }>;
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
  const [githubConnection, setGithubConnection] = useState<GitHubConnection | null>(() => {
    const saved = localStorage.getItem('repopilot_gh_conn');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [githubAccessToken, setGithubAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('repopilot_gh_token') || (import.meta.env.VITE_GITHUB_TOKEN as string) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
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

  const saveGithubAccessToken = (token: string | null) => {
    if (!token) {
      localStorage.removeItem('repopilot_gh_token');
      setGithubAccessToken(null);
    } else {
      localStorage.setItem('repopilot_gh_token', token);
      setGithubAccessToken(token);
    }
  };

  useEffect(() => {
    // Check if demo mode was explicitly persisted
    const storedDemo = localStorage.getItem('repopilot_demo_active');
    if (storedDemo === 'true') {
      setUser(DEMO_USER);
      setGithubConnection(DEMO_GITHUB);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    // Real Supabase session check
    async function initSession() {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'Developer',
            avatarUrl: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
          });

          // Grab GitHub OAuth provider token if available
          if (session.provider_token) {
            saveGithubAccessToken(session.provider_token);
          }

          // Automatically extract GitHub username from metadata
          const ghUsername = session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username;
          if (ghUsername) {
            const newConn: GitHubConnection = {
              id: `gh-${session.user.id}`,
              userId: session.user.id,
              githubUserId: String(session.user.user_metadata?.provider_id || ''),
              githubUsername: ghUsername,
              githubProfileUrl: `https://github.com/${ghUsername}`,
              avatarUrl: session.user.user_metadata?.avatar_url,
              grantedScopes: ['repo', 'read:user', 'user:email'],
              connectedAt: new Date().toISOString(),
            };
            setGithubConnection(newConn);
            localStorage.setItem('repopilot_gh_conn', JSON.stringify(newConn));
          }
        }

        const envToken = import.meta.env.VITE_GITHUB_TOKEN as string;
        const currentToken = localStorage.getItem('repopilot_gh_token') || envToken;
        if (currentToken) {
          saveGithubAccessToken(currentToken);
          if (!githubConnection) {
            connectGitHubWithToken(currentToken);
          }
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
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'Developer',
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: session.user.created_at,
        });

        if (session.provider_token) {
          saveGithubAccessToken(session.provider_token);
        }

        const ghUsername = session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username;
        if (ghUsername) {
          const newConn: GitHubConnection = {
            id: `gh-${session.user.id}`,
            userId: session.user.id,
            githubUserId: String(session.user.user_metadata?.provider_id || ''),
            githubUsername: ghUsername,
            githubProfileUrl: `https://github.com/${ghUsername}`,
            avatarUrl: session.user.user_metadata?.avatar_url,
            grantedScopes: ['repo', 'read:user', 'user:email'],
            connectedAt: new Date().toISOString(),
          };
          setGithubConnection(newConn);
          localStorage.setItem('repopilot_gh_conn', JSON.stringify(newConn));
        }
      } else if (!isDemoMode && !localStorage.getItem('repopilot_gh_token')) {
        setUser(null);
        setGithubConnection(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

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
    localStorage.removeItem('repopilot_demo_active');
    localStorage.removeItem('repopilot_gh_token');
    localStorage.removeItem('repopilot_gh_conn');
    setGithubAccessToken(null);
    setUser(null);
    setGithubConnection(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
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
    localStorage.setItem('repopilot_gh_conn', JSON.stringify(newConn));
    return { success: true };
  };

  const connectGitHubWithToken = async (tokenInput: string): Promise<{ success: boolean; error?: string }> => {
    const token = tokenInput.trim();
    if (!token) {
      return { success: false, error: 'Please enter a GitHub Personal Access Token or OAuth token.' };
    }

    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: 'Invalid or expired GitHub token. Please verify token permissions.' };
        }
        return { success: false, error: `GitHub API error: status ${res.status}` };
      }

      const ghUser = await res.json();
      const scopesHeader = res.headers.get('x-oauth-scopes') || '';
      const scopes = scopesHeader.split(',').map((s) => s.trim()).filter(Boolean);

      const newConn: GitHubConnection = {
        id: `gh-conn-${ghUser.id}`,
        userId: user?.id || `user-${ghUser.id}`,
        githubUserId: String(ghUser.id),
        githubUsername: ghUser.login,
        githubProfileUrl: ghUser.html_url,
        avatarUrl: ghUser.avatar_url,
        grantedScopes: scopes.length > 0 ? scopes : ['repo', 'user:email'],
        connectedAt: new Date().toISOString(),
      };

      saveGithubAccessToken(token);
      setGithubConnection(newConn);
      localStorage.setItem('repopilot_gh_conn', JSON.stringify(newConn));

      if (!user) {
        setUser({
          id: `gh-user-${ghUser.id}`,
          email: ghUser.email || `${ghUser.login}@github.com`,
          displayName: ghUser.name || ghUser.login,
          avatarUrl: ghUser.avatar_url,
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error verifying GitHub token' };
    }
  };

  const disconnectGitHub = async () => {
    localStorage.removeItem('repopilot_gh_token');
    localStorage.removeItem('repopilot_gh_conn');
    setGithubAccessToken(null);
    setGithubConnection(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        githubConnection,
        githubAccessToken,
        isLoading,
        isDemoMode,
        customGeminiApiKey,
        setCustomGeminiApiKey: saveCustomGeminiKey,
        setGithubAccessToken: saveGithubAccessToken,
        signInWithEmail,
        signUpWithEmail,
        signInWithGitHubOAuth,
        signOut,
        enableDemoMode,
        disableDemoMode,
        connectGitHubUsername,
        connectGitHubWithToken,
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
