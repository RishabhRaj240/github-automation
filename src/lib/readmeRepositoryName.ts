import { validateRepositoryName } from './secretScanner';

/** Use the README's first Markdown H1 as the repository name when it is valid. */
export function getReadmeRepositoryName(readme: string): string | null {
  const title = readme.match(/^\s*#\s+(.+?)\s*#*\s*$/m)?.[1]?.trim();
  const candidate = title
    ?.replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return candidate && validateRepositoryName(candidate).valid ? candidate : null;
}
