import { ProjectFile, ProjectMetadata, PublishResult, RepoVisibility } from '../types';
import { sanitizeFilePath, validateRepositoryName } from '../lib/secretScanner';

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
  total_private_repos?: number;
}

export interface PublishProgressCallback {
  (step: string, percent: number): void;
}

export class GitHubService {
  /**
   * Validates a GitHub profile URL or username and extracts the normalized username
   */
  static extractUsernameFromInput(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Check if it's a URL
    if (trimmed.includes('github.com')) {
      const match = trimmed.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1] : null;
    }

    // Direct username (starts with @ or bare alphanumeric/hyphen)
    const clean = trimmed.replace(/^@/, '');
    if (/^[a-zA-Z0-9_-]+$/.test(clean)) {
      return clean;
    }
    return null;
  }

  /**
   * Fetches public GitHub user profile details (used for verification)
   */
  static async fetchPublicUserProfile(username: string): Promise<GitHubUser | null> {
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  /**
   * Checks if a repository name already exists for the given user
   */
  static async checkRepoAvailability(
    owner: string,
    repoName: string,
    token?: string
  ): Promise<{ available: boolean; error?: string }> {
    const nameCheck = validateRepositoryName(repoName);
    if (!nameCheck.valid) {
      return { available: false, error: nameCheck.error };
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token && !token.startsWith('demo_')) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`,
        { headers }
      );

      if (response.status === 404) {
        return { available: true };
      }

      if (response.status === 200) {
        return {
          available: false,
          error: `Repository '${owner}/${repoName}' already exists on GitHub. Please choose a different name.`,
        };
      }

      // If rate limited or other status
      if (response.status === 403) {
        const resetHeader = response.headers.get('x-ratelimit-reset');
        return {
          available: true, // Proceed cautiously
          error: 'GitHub API rate limit reached. Proceeding with caution.',
        };
      }

      return { available: true };
    } catch {
      return { available: true };
    }
  }

  /**
   * Creates a repository and pushes all project files atomically via the Git Database API
   */
  static async publishRepository(
    token: string,
    owner: string,
    metadata: ProjectMetadata,
    files: ProjectFile[],
    readmeContent: string,
    onProgress?: PublishProgressCallback
  ): Promise<PublishResult> {
    const isDemo = !token || token.startsWith('demo_') || token === 'placeholder';

    // 1. Validation
    onProgress?.('Validating repository settings and files...', 10);
    const nameValidation = validateRepositoryName(metadata.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error || 'Invalid repository name');
    }

    // Assemble all files including README.md
    const allFiles: ProjectFile[] = [
      ...files.filter((f) => f.path.toLowerCase() !== 'readme.md'),
      {
        id: 'readme',
        path: 'README.md',
        content: readmeContent,
        size: new Blob([readmeContent]).size,
        language: 'markdown',
      },
    ];

    // Sanitize every file path
    for (const file of allFiles) {
      const pathCheck = sanitizeFilePath(file.path);
      if (!pathCheck.valid) {
        throw new Error(`Invalid file path "${file.path}": ${pathCheck.error}`);
      }
    }

    // If Demo Mode, simulate atomic Git publication with lifelike progress
    if (isDemo) {
      return await this.simulateDemoPublish(owner, metadata, allFiles, onProgress);
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Check duplicate repository
    onProgress?.(`Verifying ${owner}/${metadata.name} availability...`, 20);
    const availability = await this.checkRepoAvailability(owner, metadata.name, token);
    if (!availability.available && !availability.error?.includes('rate limit')) {
      throw new Error(availability.error || 'Repository already exists.');
    }

    // 3. Create repository on GitHub
    onProgress?.(`Creating repository ${metadata.name} on GitHub...`, 35);
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: metadata.name,
        description: metadata.description || 'Published with RepoPilot AI',
        private: metadata.visibility === 'private',
        auto_init: true, // creates an initial commit on default branch 'main'
      }),
    });

    if (!createRepoRes.ok) {
      const err = await createRepoRes.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create repository on GitHub (Status ${createRepoRes.status})`);
    }

    const repoData = await createRepoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Wait 1.5 seconds for GitHub to initialize git ref
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Get default branch ref to find base commit SHA
    onProgress?.('Resolving repository Git HEAD reference...', 50);
    let baseTreeSha: string | null = null;
    let baseCommitSha: string | null = null;

    const refRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/ref/heads/${defaultBranch}`,
      { headers }
    );

    if (refRes.ok) {
      const refData = await refRes.json();
      baseCommitSha = refData.object.sha;

      const commitRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/commits/${baseCommitSha}`,
        { headers }
      );
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    }

    // 5. Create Blobs for each file
    onProgress?.(`Uploading ${allFiles.length} file blobs...`, 65);
    const treeItems = [];

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      const blobRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/blobs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        }
      );

      if (!blobRes.ok) {
        throw new Error(`Failed to upload blob for file "${file.path}"`);
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });

      const currentPercent = 65 + Math.floor(((i + 1) / allFiles.length) * 15);
      onProgress?.(`Uploaded ${i + 1}/${allFiles.length} files...`, currentPercent);
    }

    // 6. Create Git Tree
    onProgress?.('Creating atomic Git tree...', 85);
    const treePayload: Record<string, unknown> = {
      tree: treeItems,
    };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(treePayload),
      }
    );

    if (!treeRes.ok) {
      throw new Error('Failed to create Git tree');
    }
    const treeData = await treeRes.json();

    // 7. Create Git Commit
    onProgress?.('Generating initial commit...', 92);
    const commitPayload: Record<string, unknown> = {
      message: `Initial commit: scaffold project with RepoPilot AI\n\n- ${allFiles.length} files added\n- README.md included`,
      tree: treeData.sha,
      parents: baseCommitSha ? [baseCommitSha] : [],
    };

    const commitRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(commitPayload),
      }
    );

    if (!commitRes.ok) {
      throw new Error('Failed to create Git commit');
    }
    const commitData = await commitRes.json();

    // 8. Update Git Reference
    onProgress?.('Updating default branch reference...', 97);
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(metadata.name)}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: commitData.sha,
          force: true,
        }),
      }
    );

    if (!updateRefRes.ok) {
      console.warn('Could not update head ref directly, commit was created with sha:', commitData.sha);
    }

    onProgress?.('Repository successfully published!', 100);

    return {
      success: true,
      repoUrl: repoData.html_url || `https://github.com/${owner}/${metadata.name}`,
      repoName: metadata.name,
      owner,
      commitSha: commitData.sha.substring(0, 7),
      branch: defaultBranch,
      filesPublished: allFiles.length,
    };
  }

  /**
   * Local demo simulation when running in offline or demo preview mode
   */
  private static async simulateDemoPublish(
    owner: string,
    metadata: ProjectMetadata,
    files: ProjectFile[],
    onProgress?: PublishProgressCallback
  ): Promise<PublishResult> {
    const steps = [
      { text: `Checking if ${owner}/${metadata.name} is available...`, pct: 20, delay: 500 },
      { text: `Creating repository on GitHub...`, pct: 45, delay: 600 },
      { text: `Uploading ${files.length} file blobs to Git database...`, pct: 70, delay: 700 },
      { text: `Creating atomic Git tree and commit...`, pct: 88, delay: 500 },
      { text: `Updating branch 'main' reference...`, pct: 98, delay: 400 },
      { text: `Publication complete!`, pct: 100, delay: 300 },
    ];

    for (const step of steps) {
      onProgress?.(step.text, step.pct);
      await new Promise((r) => setTimeout(r, step.delay));
    }

    const mockSha = Math.random().toString(16).substring(2, 9);

    return {
      success: true,
      repoUrl: `https://github.com/${owner}/${metadata.name}`,
      repoName: metadata.name,
      owner,
      commitSha: mockSha,
      branch: 'main',
      filesPublished: files.length,
    };
  }
}

