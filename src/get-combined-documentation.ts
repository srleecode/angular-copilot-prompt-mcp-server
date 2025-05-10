import { readdirSync, statSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { MarkdownFile } from './model/markdown-file.model.js';
import { v7 as uuidv7 } from 'uuid';

export function getCombinedDocumentation(pathsToSearch: string[]): MarkdownFile[] {
  const documentation: MarkdownFile[] = [];
  const cacheDir = '.llm-context-cache/docs';

  pathsToSearch.forEach((path) => {
    const fullCachePath = join(path, cacheDir);
    const pathBase = basename(path);
    const docsFile = join(fullCachePath, `${pathBase}-docs.json`);
    let pathsDocumentation: MarkdownFile[] = [];

    if (!existsSync(docsFile)) {
      pathsDocumentation = extractDocumentation(path);
      mkdirSync(fullCachePath, { recursive: true });
      writeFileSync(docsFile, JSON.stringify(pathsDocumentation, null, 2));
    } else {
      pathsDocumentation = JSON.parse(readFileSync(docsFile, 'utf-8'));
    }

    documentation.push(...pathsDocumentation);
  });
  return documentation;
}

export const extractDocumentation = (dir: string) => {
  let markdownFiles: MarkdownFile[] = [];
  processDirectory(dir, markdownFiles);
  return markdownFiles;
};

const processDirectory = (dir: string, markdownFiles: MarkdownFile[]) => {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && file !== 'node_modules') {
      processDirectory(fullPath, markdownFiles);
    } else if (file.endsWith('.md')) {
      markdownFiles.push({
        id: file + uuidv7(),
        content: readFileSync(fullPath, 'utf-8').replace(/\r\n|\r|\n/g, '\n'),
        fileName: file,
      });
    }
  }
};
