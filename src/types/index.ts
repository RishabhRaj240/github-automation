export type RepoVisibility = 'public' | 'private';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface GitHubConnection {
  id: string;
  userId: string;
  githubUserId: string;
  githubUsername: string;
  githubProfileUrl: string;
  avatarUrl?: string;
  grantedScopes: string[];
  connectedAt: string;
}

export interface ProjectFile {
  id: string;
  path: string; // e.g. "src/index.ts" or "package.json"
  content: string;
  size: number;
  language: string;
}

export interface SecretFinding {
  type: string;
  path: string;
  line: number;
  preview: string;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

export interface ProjectMetadata {
  name: string;
  description: string;
  visibility: RepoVisibility;
  homepageUrl?: string;
  license?: string;
}

export type PublicationStatus = 'idle' | 'checking' | 'creating_repo' | 'uploading_files' | 'creating_commit' | 'updating_ref' | 'success' | 'failed' | 'partial';

export interface Publication {
  id: string;
  userId: string;
  projectId?: string;
  githubRepositoryId?: string;
  repositoryName: string;
  repositoryUrl: string;
  commitSha?: string;
  filesCount: number;
  visibility: RepoVisibility;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'partial';
  errorCode?: string;
  errorMessage?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface UsageEvent {
  id: string;
  userId: string;
  eventType: 'readme_generated' | 'repo_published' | 'repo_failed' | 'github_connected' | 'github_disconnected';
  usageMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'template';
  modelName: string;
  hasCustomKey: boolean;
  status: 'available' | 'rate_limited' | 'unconfigured' | 'fallback_only';
}

export interface PublishResult {
  success: boolean;
  repoUrl: string;
  repoName: string;
  owner: string;
  commitSha: string;
  branch: string;
  filesPublished: number;
  error?: string;
}

