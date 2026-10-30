import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProjectFile, ProjectMetadata, Publication, PublishResult, SecretFinding } from '../types';
import { STARTER_TEMPLATES } from '../lib/templates';
import { detectLanguageByExtension } from '../lib/languageDetect';
import { sanitizeFilePath, scanProjectForSecrets } from '../lib/secretScanner';
import { getReadmeRepositoryName } from '../lib/readmeRepositoryName';
import { generateReadmeWithAI } from '../services/aiService';
import { GitHubService } from '../services/githubService';
import { FolderUploadResult, parseDroppedItems, parseFolderInputFiles } from '../lib/folderUpload';
import { useAuth } from './AuthContext';

interface RepoPilotContextType {
  files: ProjectFile[];
  activeFileId: string;
  metadata: ProjectMetadata;
  readmeContent: string;
  secretFindings: SecretFinding[];
  isGeneratingReadme: boolean;
  isPublishing: boolean;
  publishProgress: { step: string; percent: number };
  lastPublishResult: PublishResult | null;
  publications: Publication[];
  folderUploadStats: FolderUploadResult | null;
  setActiveFileId: (id: string) => void;
  setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
  setReadmeContent: (content: string) => void;
  setFolderUploadStats: (stats: FolderUploadResult | null) => void;
  addFile: (path: string, content?: string) => { success: boolean; error?: string };
  addLanguageFile: (lang: string) => { success: boolean; error?: string };
  updateFileContent: (id: string, content: string) => void;
  updateFileLanguage: (id: string, language: string) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newPath: string) => { success: boolean; error?: string };
  clearAllFiles: () => void;
  loadStarterTemplate: (templateId: string) => void;
  handleFileUpload: (uploadedFiles: FileList | File[]) => Promise<void>;
  handleFolderDrop: (dataTransfer: DataTransfer) => Promise<{ success: boolean; result?: FolderUploadResult; error?: string }>;
  handleFolderInput: (files: FileList | File[]) => Promise<{ success: boolean; result?: FolderUploadResult; error?: string }>;
  generateReadme: () => Promise<void>;
  publishProject: () => Promise<PublishResult>;
  resetWorkspace: () => void;
}

const RepoPilotContext = createContext<RepoPilotContextType | undefined>(undefined);

export const RepoPilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, githubConnection, githubAccessToken, customGeminiApiKey } = useAuth();

  // Initialize with React + Vite starter template
  const defaultTemplate = STARTER_TEMPLATES[0];
  const savedWorkspace = (() => {
    try {
      const raw = localStorage.getItem('repopilot_workspace');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && Array.isArray(parsed.files) && parsed.metadata) return parsed;
    } catch { /* use a fresh workspace when saved data is unavailable */ }
    return null;
  })();

  const [files, setFiles] = useState<ProjectFile[]>(() => {
    if (savedWorkspace) return savedWorkspace.files;
    return defaultTemplate.files.map((f, i) => ({
      id: `file-${i}-${Date.now()}`,
      path: f.path,
      content: f.content,
      language: f.language,
      size: new Blob([f.content]).size,
    }));
  });

  const [activeFileId, setActiveFileId] = useState<string>(savedWorkspace?.activeFileId || '');
  const [metadata, setMetadata] = useState<ProjectMetadata>(savedWorkspace?.metadata || defaultTemplate.metadata);
  const [readmeContent, setReadmeContent] = useState<string>(savedWorkspace?.readmeContent || '');
  const [secretFindings, setSecretFindings] = useState<SecretFinding[]>([]);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<{ step: string; percent: number }>({ step: '', percent: 0 });
  const [lastPublishResult, setLastPublishResult] = useState<PublishResult | null>(null);
  const [folderUploadStats, setFolderUploadStats] = useState<FolderUploadResult | null>(savedWorkspace?.folderUploadStats || null);

  // Stored publications
  const [publications, setPublications] = useState<Publication[]>(() => {
    const saved = localStorage.getItem('repopilot_publications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'pub-init-1',
        userId: user?.id || 'demo-user',
        repositoryName: 'modern-react-spa',
        repositoryUrl: 'https://github.com/octopilot-demo/modern-react-spa',
        commitSha: 'a7c491f',
        filesCount: 4,
        visibility: 'public',
        status: 'success',
        publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
  });

  // Keep first file active on load
  useEffect(() => {
    if (files.length > 0 && (!activeFileId || !files.some((f) => f.id === activeFileId))) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Save publications to localStorage
  useEffect(() => {
    localStorage.setItem('repopilot_publications', JSON.stringify(publications));
  }, [publications]);

  // Keep edits and uploads across route changes and browser refreshes.
  useEffect(() => {
    try {
      localStorage.setItem('repopilot_workspace', JSON.stringify({
        version: 1, files, activeFileId, metadata, readmeContent, folderUploadStats,
      }));
    } catch (error) {
      console.warn('Could not save workspace locally:', error);
    }
  }, [files, activeFileId, metadata, readmeContent, folderUploadStats]);

  // Live secret scanner
  useEffect(() => {
    const findings = scanProjectForSecrets(files);
    setSecretFindings(findings);
  }, [files]);

  // Initial README generation on template switch if empty
  useEffect(() => {
    if (!readmeContent && files.length > 0) {
      generateReadme();
    }
  }, []);

  const addFile = (path: string, content: string = ''): { success: boolean; error?: string } => {
    const pathCheck = sanitizeFilePath(path);
    if (!pathCheck.valid) {
      return { success: false, error: pathCheck.error };
    }

    const cleanPath = pathCheck.sanitizedPath!;
    if (files.some((f) => f.path.toLowerCase() === cleanPath.toLowerCase())) {
      return { success: false, error: `File "${cleanPath}" already exists.` };
    }

    const newFile: ProjectFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      path: cleanPath,
      content,
      size: new Blob([content]).size,
      language: detectLanguageByExtension(cleanPath),
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    return { success: true };
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content, size: new Blob([content]).size } : f))
    );
  };

  const updateFileLanguage = (id: string, language: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, language } : f))
    );
  };

  const clearAllFiles = () => {
    setFiles([]);
    setActiveFileId('');
  };

  const addLanguageFile = (lang: string): { success: boolean; error?: string } => {
    const defaults: Record<string, { path: string; content: string; language: string }> = {
      html: {
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web Page</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; background: #0a0d14; color: #fff; }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>Hello from HTML5</h1>
  <p>Published with RepoPilot AI.</p>
</body>
</html>`,
      },
      cpp: {
        path: 'main.cpp',
        language: 'cpp',
        content: `#include <iostream>

int main() {
    std::cout << "Hello, C++ World from RepoPilot AI!" << std::endl;
    return 0;
}`,
      },
      c: {
        path: 'main.c',
        language: 'c',
        content: `#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    return 0;
}`,
      },
      python: {
        path: 'main.py',
        language: 'python',
        content: `def main():
    print("Hello from Python!")

if __name__ == "__main__":
    main()`,
      },
      javascript: {
        path: 'index.js',
        language: 'javascript',
        content: `console.log("Hello from JavaScript!");`,
      },
      typescript: {
        path: 'index.ts',
        language: 'typescript',
        content: `const greeting: string = "Hello from TypeScript!";
console.log(greeting);`,
      },
      css: {
        path: 'styles.css',
        language: 'css',
        content: `/* Custom CSS */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`,
      },
      java: {
        path: 'Main.java',
        language: 'java',
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
      },
      markdown: {
        path: 'NOTES.md',
        language: 'markdown',
        content: `# Project Notes\n\n- Add your notes here`,
      },
    };

    const selected = defaults[lang.toLowerCase()] || {
      path: `file.${lang}`,
      language: lang,
      content: `// New ${lang} file`,
    };

    let finalPath = selected.path;
    let counter = 1;
    while (files.some((f) => f.path.toLowerCase() === finalPath.toLowerCase())) {
      const ext = selected.path.includes('.') ? `.${selected.path.split('.').pop()}` : '';
      const base = selected.path.replace(ext, '');
      finalPath = `${base}-${counter}${ext}`;
      counter++;
    }

    return addFile(finalPath, selected.content);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (activeFileId === id && filtered.length > 0) {
        setActiveFileId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameFile = (id: string, newPath: string): { success: boolean; error?: string } => {
    const pathCheck = sanitizeFilePath(newPath);
    if (!pathCheck.valid) {
      return { success: false, error: pathCheck.error };
    }

    const cleanPath = pathCheck.sanitizedPath!;
    if (files.some((f) => f.id !== id && f.path.toLowerCase() === cleanPath.toLowerCase())) {
      return { success: false, error: `A file named "${cleanPath}" already exists.` };
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, path: cleanPath, language: detectLanguageByExtension(cleanPath) } : f
      )
    );
    return { success: true };
  };

  const loadStarterTemplate = (templateId: string) => {
    const tmpl = STARTER_TEMPLATES.find((t) => t.id === templateId) || STARTER_TEMPLATES[0];
    const newFiles: ProjectFile[] = tmpl.files.map((f, i) => ({
      id: `file-tmpl-${i}-${Date.now()}`,
      path: f.path,
      content: f.content,
      language: f.language,
      size: new Blob([f.content]).size,
    }));

    setFiles(newFiles);
    setMetadata(tmpl.metadata);
    if (newFiles.length > 0) {
      setActiveFileId(newFiles[0].id);
    }
    // Re-generate fresh README for this template
    generateReadmeWithAI({
      metadata: tmpl.metadata,
      files: newFiles,
      githubUsername: githubConnection?.githubUsername || 'username',
      customApiKey: customGeminiApiKey || undefined,
    }).then((res) => setReadmeContent(res.content));
  };

  const handleFolderDrop = async (
    dataTransfer: DataTransfer
  ): Promise<{ success: boolean; result?: FolderUploadResult; error?: string }> => {
    try {
      const result = await parseDroppedItems(dataTransfer);
      if (result.files.length === 0) {
        return { success: false, error: 'No valid files found in the dropped folder.' };
      }

      setFiles(result.files);
      const updatedMetadata: ProjectMetadata = {
        ...metadata,
        name: result.projectName,
        description: `Project containing ${result.totalFiles} files across ${result.detectedLanguages.join(', ')}`,
      };
      setMetadata(updatedMetadata);

      // Choose main file for active tab
      const nonBinary = result.files.filter((f) => !f.isBinary);
      const mainFile =
        nonBinary.find((f) =>
          /^(index\.|app\.|main\.|package\.json|readme\.md)/i.test(f.path) ||
          /\/(index\.|app\.|main\.)/i.test(f.path)
        ) ||
        nonBinary[0] ||
        result.files[0];

      if (mainFile) {
        setActiveFileId(mainFile.id);
      }

      setFolderUploadStats(result);

      // Automatically analyze project folder and synthesize README with AI
      setIsGeneratingReadme(true);
      generateReadmeWithAI({
        metadata: updatedMetadata,
        files: result.files,
        githubUsername: githubConnection?.githubUsername || 'username',
        customApiKey: customGeminiApiKey || undefined,
      })
        .then((res) => {
          setReadmeContent(res.content);
        })
        .catch((err) => {
          console.warn('Auto README generation error:', err);
        })
        .finally(() => {
          setIsGeneratingReadme(false);
        });

      return { success: true, result };
    } catch (err) {
      console.error('Error processing dropped folder:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to process folder' };
    }
  };

  const handleFolderInput = async (
    uploadedFiles: FileList | File[]
  ): Promise<{ success: boolean; result?: FolderUploadResult; error?: string }> => {
    try {
      const result = await parseFolderInputFiles(uploadedFiles);
      if (result.files.length === 0) {
        return { success: false, error: 'No valid files found in the selected folder.' };
      }

      setFiles(result.files);
      const updatedMetadata: ProjectMetadata = {
        ...metadata,
        name: result.projectName,
        description: `Project containing ${result.totalFiles} files across ${result.detectedLanguages.join(', ')}`,
      };
      setMetadata(updatedMetadata);

      const nonBinary = result.files.filter((f) => !f.isBinary);
      const mainFile =
        nonBinary.find((f) =>
          /^(index\.|app\.|main\.|package\.json|readme\.md)/i.test(f.path) ||
          /\/(index\.|app\.|main\.)/i.test(f.path)
        ) ||
        nonBinary[0] ||
        result.files[0];

      if (mainFile) {
        setActiveFileId(mainFile.id);
      }

      setFolderUploadStats(result);

      // Automatically synthesize README
      setIsGeneratingReadme(true);
      generateReadmeWithAI({
        metadata: updatedMetadata,
        files: result.files,
        githubUsername: githubConnection?.githubUsername || 'username',
        customApiKey: customGeminiApiKey || undefined,
      })
        .then((res) => {
          setReadmeContent(res.content);
        })
        .catch((err) => {
          console.warn('Auto README generation error:', err);
        })
        .finally(() => {
          setIsGeneratingReadme(false);
        });

      return { success: true, result };
    } catch (err) {
      console.error('Error processing selected folder:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to process folder' };
    }
  };

  const handleFileUpload = async (uploadedFiles: FileList | File[]) => {
    const fileArray = Array.from(uploadedFiles);
    const loadedFiles: ProjectFile[] = [];

    for (const file of fileArray) {
      // Ignore hidden files or node_modules
      if (file.name.startsWith('.') || file.name.includes('node_modules')) {
        continue;
      }

      // 5 MB max per file for safety
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      try {
        const text = await file.text();
        const relPath = (file as any).webkitRelativePath || file.name;
        const sanitized = sanitizeFilePath(relPath);

        if (sanitized.valid && sanitized.sanitizedPath) {
          loadedFiles.push({
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            path: sanitized.sanitizedPath,
            content: text,
            size: file.size,
            language: detectLanguageByExtension(sanitized.sanitizedPath),
          });
        }
      } catch (err) {
        console.warn('Could not read file:', file.name, err);
      }
    }

    if (loadedFiles.length > 0) {
      setFiles((prev) => {
        // Merge or replace
        const existingPaths = new Set(loadedFiles.map((l) => l.path.toLowerCase()));
        const preserved = prev.filter((p) => !existingPaths.has(p.path.toLowerCase()));
        return [...preserved, ...loadedFiles];
      });
      setActiveFileId(loadedFiles[0].id);
    }
  };

  const generateReadme = async () => {
    setIsGeneratingReadme(true);
    try {
      const res = await generateReadmeWithAI({
        metadata,
        files,
        githubUsername: githubConnection?.githubUsername || 'username',
        customApiKey: customGeminiApiKey || undefined,
      });
      setReadmeContent(res.content);
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const publishProject = async (): Promise<PublishResult> => {
    setIsPublishing(true);
    setPublishProgress({ step: 'Initializing publication...', percent: 5 });

    const token = githubAccessToken || localStorage.getItem('repopilot_gh_token');
    const owner = githubConnection?.githubUsername;

    if (!token) {
      setIsPublishing(false);
      throw new Error(
        'GitHub Access Token is missing! Please go to Settings and enter your GitHub Access Token or Personal Access Token (PAT) with repo scope.'
      );
    }

    if (!owner) {
      setIsPublishing(false);
      throw new Error(
        'No GitHub username connected. Please connect your GitHub account in Settings.'
      );
    }

    try {
      const readmeRepoName = getReadmeRepositoryName(readmeContent);
      const publishMetadata = readmeRepoName
        ? { ...metadata, name: readmeRepoName }
        : metadata;

      const result = await GitHubService.publishRepository(
        token,
        owner,
        publishMetadata,
        files,
        readmeContent,
        (step, percent) => {
          setPublishProgress({ step, percent });
        }
      );

      setLastPublishResult(result);

      // Save to publication history
      const newPub: Publication = {
        id: `pub-${Date.now()}`,
        userId: user?.id || 'demo-user',
        repositoryName: result.repoName,
        repositoryUrl: result.repoUrl,
        commitSha: result.commitSha,
        filesCount: result.filesPublished,
        visibility: metadata.visibility,
        status: 'success',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setPublications((prev) => [newPub, ...prev]);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown publishing error';
      setPublishProgress({ step: `Publication failed: ${msg}`, percent: 0 });
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  const resetWorkspace = () => {
    loadStarterTemplate('react-vite');
    setReadmeContent('');
    setFolderUploadStats(null);
  };

  return (
    <RepoPilotContext.Provider
      value={{
        files,
        activeFileId,
        metadata,
        readmeContent,
        secretFindings,
        isGeneratingReadme,
        isPublishing,
        publishProgress,
        lastPublishResult,
        publications,
        folderUploadStats,
        setActiveFileId,
        setMetadata,
        setReadmeContent,
        setFolderUploadStats,
        addFile,
        addLanguageFile,
        updateFileContent,
        updateFileLanguage,
        deleteFile,
        renameFile,
        clearAllFiles,
        loadStarterTemplate,
        handleFileUpload,
        handleFolderDrop,
        handleFolderInput,
        generateReadme,
        publishProject,
        resetWorkspace,
      }}
    >
      {children}
    </RepoPilotContext.Provider>
  );
};

export const useRepoPilot = () => {
  const context = useContext(RepoPilotContext);
  if (!context) {
    throw new Error('useRepoPilot must be used within a RepoPilotProvider');
  }
  return context;
};

