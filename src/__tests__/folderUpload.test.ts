import { describe, it, expect } from 'vitest';
import { isBinaryFile, getMimeType, parseFolderInputFiles } from '../lib/folderUpload';

describe('Folder Upload & Recursive Traversal', () => {
  it('correctly identifies binary assets vs source code files', () => {
    expect(isBinaryFile('logo.png')).toBe(true);
    expect(isBinaryFile('hero.jpg')).toBe(true);
    expect(isBinaryFile('favicon.ico')).toBe(true);
    expect(isBinaryFile('graphic.webp')).toBe(true);
    expect(isBinaryFile('font.woff2')).toBe(true);

    expect(isBinaryFile('index.html')).toBe(false);
    expect(isBinaryFile('main.cpp')).toBe(false);
    expect(isBinaryFile('App.tsx')).toBe(false);
    expect(isBinaryFile('styles.css')).toBe(false);
    expect(isBinaryFile('server.py')).toBe(false);
    expect(isBinaryFile('package.json')).toBe(false);
  });

  it('resolves correct MIME types for assets and documents', () => {
    expect(getMimeType('image.png')).toBe('image/png');
    expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
    expect(getMimeType('icon.svg')).toBe('image/svg+xml');
    expect(getMimeType('avatar.webp')).toBe('image/webp');
    expect(getMimeType('doc.pdf')).toBe('application/pdf');
    expect(getMimeType('font.woff2')).toBe('font/woff2');
  });

  it('parses project folder with subfolders and strips root folder name', async () => {
    const mockFiles = [
      new File(['<!DOCTYPE html><html><body><h1>Hello</h1></body></html>'], 'index.html'),
      new File(['console.log("app");'], 'index.js'),
      new File(['body { background: black; }'], 'style.css'),
      new File(['{"name": "my-awesome-app", "version": "1.0.0"}'], 'package.json'),
    ];

    // Assign webkitRelativePath as browsers do when dropping a folder "my-awesome-app"
    Object.defineProperty(mockFiles[0], 'webkitRelativePath', { value: 'my-awesome-app/public/index.html' });
    Object.defineProperty(mockFiles[1], 'webkitRelativePath', { value: 'my-awesome-app/src/components/index.js' });
    Object.defineProperty(mockFiles[2], 'webkitRelativePath', { value: 'my-awesome-app/src/styles/style.css' });
    Object.defineProperty(mockFiles[3], 'webkitRelativePath', { value: 'my-awesome-app/package.json' });

    const result = await parseFolderInputFiles(mockFiles);

    expect(result.projectName).toBe('my-awesome-app');
    expect(result.totalFiles).toBe(4);
    expect(result.hasManifest).toBe(true);

    // Strips leading 'my-awesome-app/' so repo structure is clean
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('public/index.html');
    expect(paths).toContain('src/components/index.js');
    expect(paths).toContain('src/styles/style.css');
    expect(paths).toContain('package.json');

    // Subfolders extracted
    expect(result.subfolders).toContain('public');
    expect(result.subfolders).toContain('src/components');
    expect(result.subfolders).toContain('src/styles');
  });

  it('ignores .git and node_modules folders automatically', async () => {
    const mockFiles = [
      new File(['valid code'], 'main.py'),
      new File(['git internal'], 'HEAD'),
      new File(['dependency code'], 'lodash.js'),
    ];

    Object.defineProperty(mockFiles[0], 'webkitRelativePath', { value: 'cool-app/main.py' });
    Object.defineProperty(mockFiles[1], 'webkitRelativePath', { value: 'cool-app/.git/HEAD' });
    Object.defineProperty(mockFiles[2], 'webkitRelativePath', { value: 'cool-app/node_modules/lodash/lodash.js' });

    const result = await parseFolderInputFiles(mockFiles);

    expect(result.totalFiles).toBe(1);
    expect(result.files[0].path).toBe('main.py');
    expect(result.files.some((f) => f.path.includes('.git'))).toBe(false);
    expect(result.files.some((f) => f.path.includes('node_modules'))).toBe(false);
  });
});

