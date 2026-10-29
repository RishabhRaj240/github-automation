import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProjectFile, ProjectMetadata, Publication, PublishResult, SecretFinding } from '../types';
import { STARTER_TEMPLATES } from '../lib/templates';
import { detectLanguageByExtension } from '../lib/languageDetect';
import { sanitizeFilePath, scanProjectForSecrets } from '../lib/secretScanner';
import { generateReadmeWithAI } from '../services/aiService';
import { GitHubService } from '../services/githubService';
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
  setActiveFileId: (id: string) => void;
  setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
  setReadmeContent: (content: string) => void;
  addFile: (path: string, content?: string) => { success: boolean; error?: string };
  updateFileContent: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newPath: string) => { success: boolean; error?: string };
  loadStarterTemplate: (templateId: string) => void;
  handleFileUpload: (uploadedFiles: FileList | File[]) => Promise<void>;
  generateReadme: () => Promise<void>;
  publishProject: () => Promise<PublishResult>;
  resetWorkspace: () => void;
}

const RepoPilotContext = createContext<RepoPilotContextType | undefined>(undefined);

export const RepoPilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, githubConnection, customGeminiApiKey } = useAuth();

  // Initialize with React + Vite starter template
  const defaultTemplate = STARTER_TEMPLATES[0];

  const [files, setFiles] = useState<ProjectFile[]>(() => {
    return defaultTemplate.files.map((f, i) => ({
      id: `file-${i}-${Date.now()}`,
      path: f.path,
      content: f.content,
      language: f.language,
      size: new Blob([f.content]).size,
    }));
  });

  const [activeFileId, setActiveFileId] = useState<string>('');
  const [metadata, setMetadata] = useState<ProjectMetadata>(defaultTemplate.metadata);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [secretFindings, setSecretFindings] = useState<SecretFinding[]>([]);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<{ step: string; percent: number }>({ step: '', percent: 0 });
  const [lastPublishResult, setLastPublishResult] = useState<PublishResult | null>(null);

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

    const owner = githubConnection?.githubUsername || 'octopilot-demo';
    const token = 'demo_token_repopilot';

    try {
      const result = await GitHubService.publishRepository(
        token,
        owner,
        metadata,
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
        setActiveFileId,
        setMetadata,
        setReadmeContent,
        addFile,
        updateFileContent,
        deleteFile,
        renameFile,
        loadStarterTemplate,
        handleFileUpload,
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
