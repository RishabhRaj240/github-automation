import { describe, it, expect } from 'vitest';
import {
  scanProjectForSecrets,
  validateRepositoryName,
  sanitizeFilePath,
} from '../lib/secretScanner';
import { ProjectFile } from '../types';

describe('Security: Secret Scanner', () => {
  it('detects classic GitHub Personal Access Tokens (ghp_)', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'src/config.ts',
        content: 'const GITHUB_TOKEN = "ghp_123456789012345678901234567890123456";',
        size: 100,
        language: 'typescript',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(1);
    expect(findings[0].type).toContain('GitHub Personal Access Token');
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].preview).toContain('ghp_');
    expect(findings[0].preview).not.toContain('ghp_123456789012345678901234567890123456'); // obfuscated!
  });

  it('detects fine-grained GitHub PATs', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'deploy.sh',
        content: 'export GH_TOKEN="github_pat_11ABCD_example_fine_grained_token_value_longer_than_sixty_characters_here"',
        size: 120,
        language: 'bash',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(1);
    expect(findings[0].severity).toBe('critical');
  });

  it('detects AWS Access Keys (AKIA...)', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'aws-client.js',
        content: 'const accessKey = "AKIAIOSFODNN7EXAMPLE";',
        size: 50,
        language: 'javascript',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(1);
    expect(findings[0].type).toContain('AWS Access Key');
    expect(findings[0].severity).toBe('critical');
  });

  it('detects Private Cryptographic RSA Keys', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'keys/id_rsa',
        content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----',
        size: 200,
        language: 'plaintext',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(1);
    expect(findings[0].type).toContain('Private Cryptographic Key');
    expect(findings[0].severity).toBe('critical');
  });

  it('detects hardcoded Database credentials in connection URIs', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'db.ts',
        content: 'const dbUri = "postgres://admin:superSecret123@db.example.com:5432/production";',
        size: 100,
        language: 'typescript',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(1);
    expect(findings[0].type).toContain('Database Connection String');
  });

  it('ignores documentation markdown files to prevent false alarms in manuals', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'README.md',
        content: 'Sample AWS key format is AKIAIOSFODNN7EXAMPLE in documentation.',
        size: 80,
        language: 'markdown',
      },
    ];

    const findings = scanProjectForSecrets(files);
    expect(findings.length).toBe(0);
  });
});

describe('Security: File Path Sanitization & Traversal Prevention', () => {
  it('rejects path traversal attempts (../)', () => {
    const result = sanitizeFilePath('../../../etc/passwd');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Directory traversal');
  });

  it('rejects absolute paths starting with /', () => {
    const result = sanitizeFilePath('/etc/hosts');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Directory traversal');
  });

  it('rejects modifying the .git directory', () => {
    const result = sanitizeFilePath('.git/config');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('.git');
  });

  it('accepts safe nested relative paths', () => {
    const result = sanitizeFilePath('src/components/Button.tsx');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPath).toBe('src/components/Button.tsx');
  });

  it('normalizes backslashes to forward slashes', () => {
    const result = sanitizeFilePath('src\\utils\\helpers.ts');
    expect(result.valid).toBe(true);
    expect(result.sanitizedPath).toBe('src/utils/helpers.ts');
  });
});

describe('Validation: GitHub Repository Name', () => {
  it('approves standard alphanumeric names with hyphens and dots', () => {
    expect(validateRepositoryName('my-awesome-repo').valid).toBe(true);
    expect(validateRepositoryName('RepoPilot_AI.v2').valid).toBe(true);
  });

  it('rejects empty or whitespace repository names', () => {
    expect(validateRepositoryName('').valid).toBe(false);
    expect(validateRepositoryName('   ').valid).toBe(false);
  });

  it('rejects names with spaces or forbidden special characters', () => {
    expect(validateRepositoryName('my repo name').valid).toBe(false);
    expect(validateRepositoryName('my$repo').valid).toBe(false);
    expect(validateRepositoryName('repo/with/slash').valid).toBe(false);
  });

  it('rejects reserved relative dot names', () => {
    expect(validateRepositoryName('.').valid).toBe(false);
    expect(validateRepositoryName('..').valid).toBe(false);
  });

  it('rejects names exceeding 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(validateRepositoryName(longName).valid).toBe(false);
  });
});
