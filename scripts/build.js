const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const sourceDirectories = ['server', 'test', 'scripts', 'Real-Estate-X/assets/js'];
const sourceFiles = ['server.js'];

const collectJavaScriptFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectJavaScriptFiles(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.js') && entryPath !== __filename) {
      sourceFiles.push(path.relative(root, entryPath));
    }
  }
};

for (const directory of sourceDirectories) {
  const absolutePath = path.join(root, directory);
  if (fs.existsSync(absolutePath)) collectJavaScriptFiles(absolutePath);
}

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to check ${file}:`, result.error.message);
    process.exitCode = 1;
    break;
  }
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    break;
  }
}

if (!process.exitCode) console.log(`Syntax checked ${sourceFiles.length} JavaScript files.`);
