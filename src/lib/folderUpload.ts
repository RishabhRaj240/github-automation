import { ProjectFile } from '../types';
import { detectLanguageByExtension } from './languageDetect';
import { sanitizeFilePath } from './secretScanner';

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.vscode',
  '.idea',
  '__pycache__',
  '.cache',
  'coverage',
  '.turbo',
  '.gradle',
  'target',
  'venv',
  '.venv',
  'env',
]);

const IGNORED_FILES = new Set([
  '.ds_store',
  'thumbs.db',
  'desktop.ini',
]);

const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'bmp',
  'tiff',
  'avif',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'pdf',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'otf',
  'wasm',
  'zip',
]);

export interface FolderUploadResult {
  projectName: string;
  files: ProjectFile[];
  totalFiles: number;
  totalAssets: number;
  subfolders: string[];
  detectedLanguages: string[];
  hasManifest: boolean;
}

export function isBinaryFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.has(ext);
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    bmp: 'image/bmp',
    pdf: 'application/pdf',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
  };
  return mimes[ext] || 'application/octet-stream';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function readFileAsync(file: File, relativePath: string): Promise<ProjectFile | null> {
  // Max size limit: 15MB
  if (file.size > 15 * 1024 * 1024) {
    console.warn(`Skipping file "${relativePath}" (exceeds 15MB limit)`);
    return null;
  }

  const sanitized = sanitizeFilePath(relativePath);
  if (!sanitized.valid || !sanitized.sanitizedPath) {
    return null;
  }

  const cleanPath = sanitized.sanitizedPath;
  const isBinary = isBinaryFile(file.name);
  const mimeType = getMimeType(file.name);

  try {
    if (isBinary) {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        path: cleanPath,
        content: base64,
        size: file.size,
        language: file.name.split('.').pop()?.toLowerCase() || 'asset',
        encoding: 'base64',
        isBinary: true,
        mimeType,
      };
    } else {
      const text = await file.text();
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        path: cleanPath,
        content: text,
        size: file.size,
        language: detectLanguageByExtension(cleanPath),
        encoding: 'utf-8',
        isBinary: false,
        mimeType: mimeType || 'text/plain',
      };
    }
  } catch (err) {
    console.warn(`Failed to read file ${relativePath}:`, err);
    return null;
  }
}

async function readAllEntriesFromReader(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  const allEntries: FileSystemEntry[] = [];
  let keepReading = true;

  while (keepReading) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (batch.length === 0) {
      keepReading = false;
    } else {
      allEntries.push(...batch);
    }
  }

  return allEntries;
}

async function traverseDirectoryEntry(
  dirEntry: FileSystemDirectoryEntry,
  currentPath = ''
): Promise<{ relativePath: string; file: File }[]> {
  const results: { relativePath: string; file: File }[] = [];
  const reader = dirEntry.createReader();
  const entries = await readAllEntriesFromReader(reader);

  for (const entry of entries) {
    const entryName = entry.name;
    const lowerName = entryName.toLowerCase();

    if (entry.isDirectory) {
      if (IGNORED_DIRECTORIES.has(lowerName) || entryName.startsWith('.')) {
        continue;
      }
      const subResults = await traverseDirectoryEntry(
        entry as FileSystemDirectoryEntry,
        currentPath ? `${currentPath}/${entryName}` : entryName
      );
      results.push(...subResults);
    } else if (entry.isFile) {
      if (IGNORED_FILES.has(lowerName)) {
        continue;
      }
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });
      const relativePath = currentPath ? `${currentPath}/${entryName}` : entryName;
      results.push({ relativePath, file });
    }
  }

  return results;
}

/**
 * Parses dropped items from a DragEvent, fully traversing directories, subdirectories, and files
 */
export async function parseDroppedItems(dataTransfer: DataTransfer): Promise<FolderUploadResult> {
  const rawFiles: { relativePath: string; file: File }[] = [];
  let detectedRootFolderName = '';

  const items = dataTransfer.items;
  if (items && items.length > 0) {
    const entriesToProcess: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          entriesToProcess.push(entry);
        }
      }
    }

    // Check if the user dropped a single folder
    if (entriesToProcess.length === 1 && entriesToProcess[0].isDirectory) {
      detectedRootFolderName = entriesToProcess[0].name;
    }

    for (const entry of entriesToProcess) {
      if (entry.isDirectory) {
        if (!detectedRootFolderName) {
          detectedRootFolderName = entry.name;
        }
        const dirFiles = await traverseDirectoryEntry(entry as FileSystemDirectoryEntry, '');
        rawFiles.push(...dirFiles);
      } else if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file(resolve, reject);
        });
        rawFiles.push({ relativePath: file.name, file });
      }
    }
  } else if (dataTransfer.files && dataTransfer.files.length > 0) {
    // Fallback for browsers not supporting items
    const fileList = Array.from(dataTransfer.files);
    for (const f of fileList) {
      const rel = (f as any).webkitRelativePath || f.name;
      rawFiles.push({ relativePath: rel, file: f });
    }
  }

  return processExtractedFiles(rawFiles, detectedRootFolderName);
}

/**
 * Parses files from an <input type="file" webkitdirectory directory /> selection
 */
export async function parseFolderInputFiles(fileList: FileList | File[]): Promise<FolderUploadResult> {
  const rawFiles: { relativePath: string; file: File }[] = [];
  let detectedRootFolderName = '';

  const filesArray = Array.from(fileList);
  for (const f of filesArray) {
    const relPath: string = (f as any).webkitRelativePath || f.name;
    const parts = relPath.split('/');

    // If webkitRelativePath contains a root folder name: "my-app/src/index.js"
    if (parts.length > 1 && !detectedRootFolderName) {
      detectedRootFolderName = parts[0];
    }

    // Skip ignored directories in the path
    const hasIgnoredDir = parts.some((p) => IGNORED_DIRECTORIES.has(p.toLowerCase()));
    if (hasIgnoredDir) continue;

    // Skip ignored filenames
    if (IGNORED_FILES.has(f.name.toLowerCase())) continue;

    // Strip leading root folder name from relative path if present so repo starts from root
    let finalRelativePath = relPath;
    if (detectedRootFolderName && relPath.startsWith(`${detectedRootFolderName}/`)) {
      finalRelativePath = relPath.substring(detectedRootFolderName.length + 1);
    }

    rawFiles.push({ relativePath: finalRelativePath, file: f });
  }

  return processExtractedFiles(rawFiles, detectedRootFolderName);
}

async function processExtractedFiles(
  rawFiles: { relativePath: string; file: File }[],
  detectedRootFolderName: string
): Promise<FolderUploadResult> {
  const projectFiles: ProjectFile[] = [];
  const subfolderSet = new Set<string>();
  const languagesSet = new Set<string>();
  let totalAssets = 0;
  let hasManifest = false;

  for (const item of rawFiles) {
    const pFile = await readFileAsync(item.file, item.relativePath);
    if (!pFile) continue;

    projectFiles.push(pFile);

    if (pFile.isBinary) {
      totalAssets++;
    }

    if (pFile.language && pFile.language !== 'asset') {
      languagesSet.add(pFile.language);
    }

    // Extract subfolders
    const parts = pFile.path.split('/');
    if (parts.length > 1) {
      // e.g. "src/components"
      parts.pop();
      subfolderSet.add(parts.join('/'));
    }

    // Check for package manifests
    const lowerPath = pFile.path.toLowerCase();
    if (
      lowerPath === 'package.json' ||
      lowerPath === 'requirements.txt' ||
      lowerPath === 'cargo.toml' ||
      lowerPath === 'go.mod' ||
      lowerPath === 'pom.xml' ||
      lowerPath === 'build.gradle' ||
      lowerPath === 'cmakelists.txt'
    ) {
      hasManifest = true;
    }
  }

  // Format clean project name from folder name
  let cleanProjectName = detectedRootFolderName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanProjectName || cleanProjectName === 'src' || cleanProjectName === 'dist') {
    cleanProjectName = 'my-project';
  }

  return {
    projectName: cleanProjectName,
    files: projectFiles,
    totalFiles: projectFiles.length,
    totalAssets,
    subfolders: Array.from(subfolderSet).sort(),
    detectedLanguages: Array.from(languagesSet),
    hasManifest,
  };
}
