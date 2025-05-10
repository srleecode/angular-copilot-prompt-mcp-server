import { join } from 'path';
import { extractDocumentation, getCombinedDocumentation } from './get-combined-documentation';
import { MarkdownFile } from './model/markdown-file.model';
import { mkdirSync, readFileSync } from 'fs';

describe('documentation', () => {
  describe('extractDocumentation', () => {
    const dir = 'test-directory';
    const mockFileContent = `Mocked 
    file "content"`;
    const fs = require('fs');

    beforeEach(() => {
      jest.spyOn(fs, 'readdirSync').mockReturnValue(['file1.md', 'file2.txt']);
      jest.spyOn(fs, 'statSync').mockImplementation(() => ({
        isDirectory: () => false,
      }));
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockFileContent);
    });

    afterEach(() => jest.restoreAllMocks());

    it('should extract markdown files from a directory', () => {
      expect(extractDocumentation(dir)).toEqual<MarkdownFile[]>([
        {
          id: expect.any(String),
          content: mockFileContent,
          fileName: 'file1.md',
        },
      ]);
      jest.restoreAllMocks();
    });
  });
  describe('getCombinedDocumentation', () => {
    const mockPath = '/mock/path';
    const mockCacheDir = '.llm-context-cache/docs';
    const mockDocsFile = join(mockPath, mockCacheDir, 'path-docs.json');
    const mockFileContent = `Mocked 
    file "content"`;

    const fs = require('fs');
    beforeEach(() => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      jest.spyOn(fs, 'readdirSync').mockReturnValue(['file1.md', 'file2.txt']);
      jest.spyOn(fs, 'statSync').mockImplementation(() => ({
        isDirectory: () => false,
      }));
    });

    afterEach(() => jest.restoreAllMocks());

    it('should create cache directory and write documentation if cache does not exist', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockFileContent);
      const result = getCombinedDocumentation([mockPath]);

      expect(mkdirSync).toHaveBeenCalledWith(join(mockPath, mockCacheDir), { recursive: true });
      expect(result).toEqual([{ id: expect.any(String), fileName: 'file1.md', content: mockFileContent }]);
    });

    it('should read documentation from cache if it exists', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const mockCachedFile: MarkdownFile[] = [{ id: 'test', fileName: 'file1.md', content: mockFileContent }];
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockCachedFile));
      const result = getCombinedDocumentation([mockPath]);

      expect(readFileSync).toHaveBeenCalledWith(mockDocsFile, 'utf-8');
      expect(result).toEqual(mockCachedFile);
    });
  });
});
