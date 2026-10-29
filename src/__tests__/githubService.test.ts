import { describe, it, expect } from 'vitest';
import { GitHubService } from '../services/githubService';
import { ProjectFile, ProjectMetadata } from '../types';

describe('GitHub Service: Profile Input & URL Extraction', () => {
  it('extracts username from full github.com URLs', () => {
    expect(GitHubService.extractUsernameFromInput('https://github.com/torvalds')).toBe('torvalds');
    expect(GitHubService.extractUsernameFromInput('http://github.com/octocat/')).toBe('octocat');
  });

  it('handles @username prefix', () => {
    expect(GitHubService.extractUsernameFromInput('@torvalds')).toBe('torvalds');
    expect(GitHubService.extractUsernameFromInput('developer-user')).toBe('developer-user');
  });

  it('rejects invalid inputs', () => {
    expect(GitHubService.extractUsernameFromInput('')).toBeNull();
    expect(GitHubService.extractUsernameFromInput('   ')).toBeNull();
    expect(GitHubService.extractUsernameFromInput('invalid username with spaces')).toBeNull();
  });
});

describe('GitHub Service: Repository Publishing Workflow', () => {
  it('publishes demo repository with simulated atomic git steps', async () => {
    const metadata: ProjectMetadata = {
      name: 'demo-pipeline-app',
      description: 'Demo project publishing',
      visibility: 'public',
    };

    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'src/main.ts',
        content: 'console.log("Hello world");',
        size: 28,
        language: 'typescript',
      },
    ];

    const progressLogs: string[] = [];
    const result = await GitHubService.publishRepository(
      'demo_token',
      'test-developer',
      metadata,
      files,
      '# demo-pipeline-app\n\nREADME content',
      (step, _pct) => {
        progressLogs.push(step);
      }
    );

    expect(result.success).toBe(true);
    expect(result.repoName).toBe('demo-pipeline-app');
    expect(result.owner).toBe('test-developer');
    expect(result.repoUrl).toBe('https://github.com/test-developer/demo-pipeline-app');
    expect(result.commitSha).toBeDefined();
    expect(result.branch).toBe('main');
    expect(result.filesPublished).toBe(2); // 1 file + README.md
    expect(progressLogs.length).toBeGreaterThan(0);
  });

  it('rejects publishing when repository name contains invalid characters', async () => {
    const metadata: ProjectMetadata = {
      name: 'invalid name with spaces!',
      description: 'Test invalid',
      visibility: 'public',
    };

    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'index.js',
        content: 'console.log(1);',
        size: 15,
        language: 'javascript',
      },
    ];

    await expect(
      GitHubService.publishRepository(
        'demo_token',
        'test-developer',
        metadata,
        files,
        '# README'
      )
    ).rejects.toThrow();
  });

  it('rejects publishing if any file path contains directory traversal', async () => {
    const metadata: ProjectMetadata = {
      name: 'traversal-exploit-repo',
      description: 'Test traversal rejection',
      visibility: 'public',
    };

    const files: ProjectFile[] = [
      {
        id: '1',
        path: '../secrets.env',
        content: 'SECRET=123',
        size: 10,
        language: 'shell',
      },
    ];

    await expect(
      GitHubService.publishRepository(
        'demo_token',
        'test-developer',
        metadata,
        files,
        '# README'
      )
    ).rejects.toThrow(/Invalid file path/);
  });
});

