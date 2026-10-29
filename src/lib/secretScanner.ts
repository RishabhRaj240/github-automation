import { ProjectFile, SecretFinding } from '../types';

interface SecretRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

const SECRET_RULES: SecretRule[] = [
  {
    id: 'github_pat_classic',
    name: 'GitHub Personal Access Token (Classic)',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    severity: 'critical',
    recommendation: 'Remove classic GitHub token immediately. Revoke and generate a new token if exposed.',
  },
  {
    id: 'github_pat_fine',
    name: 'GitHub Fine-Grained Personal Access Token',
    pattern: /github_pat_[a-zA-Z0-9_]{60,}/,
    severity: 'critical',
    recommendation: 'Remove fine-grained GitHub token. Do not commit access credentials to repositories.',
  },
  {
    id: 'aws_access_key',
    name: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    severity: 'critical',
    recommendation: 'AWS credentials detected. Store in environment variables, AWS Secrets Manager, or IAM roles.',
  },
  {
    id: 'private_key',
    name: 'Private Cryptographic Key',
    pattern: /-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----/,
    severity: 'critical',
    recommendation: 'Private keys must NEVER be published to public or private version control.',
  },
  {
    id: 'gemini_api_key',
    name: 'Google / Gemini API Key',
    pattern: /AIzaSy[a-zA-Z0-9_-]{33}/,
    severity: 'high',
    recommendation: 'Google API key detected. Use Vercel or server-side environment variables instead.',
  },
  {
    id: 'openai_api_key',
    name: 'OpenAI API Key',
    pattern: /sk-(?:proj-)?[a-zA-Z0-9]{20,48}/,
    severity: 'high',
    recommendation: 'OpenAI secret key detected. Move this key to a secure server-side environment variable.',
  },
  {
    id: 'slack_token',
    name: 'Slack Bot or User Token',
    pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/,
    severity: 'high',
    recommendation: 'Slack token detected. Keep bot tokens in secure secret storage.',
  },
  {
    id: 'stripe_secret_key',
    name: 'Stripe Secret API Key',
    pattern: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,99}/,
    severity: 'critical',
    recommendation: 'Stripe secret key detected. Revealing this exposes billing and payment operations.',
  },
  {
    id: 'database_conn_password',
    name: 'Database Connection String with Credentials',
    pattern: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[a-zA-Z0-9._-]+:[^@\s]{3,}@[a-zA-Z0-9.-]+/,
    severity: 'critical',
    recommendation: 'Hardcoded database credentials detected. Pass via DATABASE_URL environment variable.',
  },
  {
    id: 'generic_jwt_bearer',
    name: 'High Entropy Bearer Token / JWT',
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/,
    severity: 'medium',
    recommendation: 'Hardcoded JSON Web Token detected. Authorize dynamically via authentication headers.',
  },
];

/**
 * Scans an array of project files for accidental secrets and sensitive credentials
 */
export function scanProjectForSecrets(files: ProjectFile[]): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const file of files) {
    // Avoid false positives in documentation files if they are explaining format
    if (file.path.toLowerCase().endsWith('.md') || file.path.toLowerCase().endsWith('.txt')) {
      continue;
    }

    const lines = file.content.split('\n');
    lines.forEach((line, idx) => {
      for (const rule of SECRET_RULES) {
        if (rule.pattern.test(line)) {
          // Obfuscate secret in preview
          const match = line.match(rule.pattern);
          const rawMatch = match ? match[0] : '';
          const masked = rawMatch.length > 8
            ? `${rawMatch.slice(0, 4)}...${rawMatch.slice(-4)}`
            : '****';
          const safePreview = line.replace(rawMatch, masked).trim();

          findings.push({
            type: rule.name,
            path: file.path,
            line: idx + 1,
            preview: safePreview.slice(0, 100),
            severity: rule.severity,
            recommendation: rule.recommendation,
          });
        }
      }
    });
  }

  return findings;
}

/**
 * Validates a repository name according to GitHub naming rules
 */
export function validateRepositoryName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Repository name cannot be empty.' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Repository name cannot exceed 100 characters.' };
  }
  // GitHub repo name rule: letters, numbers, hyphens, periods, underscores
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Repository name can only contain alphanumeric characters, hyphens (-), underscores (_), and periods (.).',
    };
  }
  if (trimmed === '.' || trimmed === '..') {
    return { valid: false, error: 'Reserved name. Choose a different repository name.' };
  }
  return { valid: true };
}

/**
 * Validates and sanitizes a relative file path to prevent directory traversal
 */
export function sanitizeFilePath(filePath: string): { valid: boolean; sanitizedPath?: string; error?: string } {
  const trimmed = filePath.trim().replace(/\\/g, '/');
  
  if (!trimmed) {
    return { valid: false, error: 'File path cannot be empty.' };
  }

  // Path traversal check
  if (trimmed.startsWith('/') || trimmed.includes('../') || trimmed.includes('/..') || trimmed === '..') {
    return { valid: false, error: 'Unsafe path: Directory traversal characters are forbidden.' };
  }

  // Remove duplicate slashes
  const sanitized = trimmed.replace(/\/+/g, '/');

  // Reserved names like .git/
  if (sanitized.startsWith('.git/') || sanitized === '.git') {
    return { valid: false, error: 'Modifying .git directory is not permitted.' };
  }

  return { valid: true, sanitizedPath: sanitized };
}
