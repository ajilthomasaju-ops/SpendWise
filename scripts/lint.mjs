import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirs = ['src', 'server'];
const sourceFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\\.(js|jsx|ts|tsx)$/.test(entry.name)) sourceFiles.push(fullPath);
  }
}

for (const directory of sourceDirs) walk(path.join(projectRoot, directory));
sourceFiles.push(path.join(projectRoot, 'server.js'), path.join(projectRoot, 'vite.config.js'));

let failures = 0;
for (const file of sourceFiles) {
  try {
    const source = fs.readFileSync(file, 'utf8');
    const loader = path.extname(file).slice(1);
    await transform(source, { loader, jsx: 'automatic', logLevel: 'silent' });
  } catch (error) {
    failures += 1;
    console.error(`\\n${path.relative(projectRoot, file)}\\n${error.message}`);
  }
}

if (failures) {
  console.error(`\\nLint check failed for ${failures} file(s).`);
  process.exit(1);
}
console.log(`Syntax/JSX transform check passed for ${sourceFiles.length} files.`);
