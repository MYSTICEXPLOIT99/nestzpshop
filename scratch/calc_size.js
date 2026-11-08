const fs = require('fs');
const path = require('path');

function getDirSize(dir, excludePatterns = []) {
  let size = 0;
  let fileCount = 0;

  function traverse(current) {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        const relPath = path.relative(dir, fullPath);

        if (excludePatterns.some(p => relPath.split(path.sep).includes(p))) {
          continue;
        }

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            size += stats.size;
            fileCount++;
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  traverse(dir);
  return { size, fileCount };
}

const rootDir = path.resolve(__dirname, '..');
const srcOnly = getDirSize(rootDir, ['node_modules', '.next', '.git']);
const totalAll = getDirSize(rootDir, ['.git']);

console.log('--- FILE SIZE SUMMARY ---');
console.log(`Source Code + Assets (no node_modules / no .next): ${(srcOnly.size / (1024 * 1024)).toFixed(2)} MB (${srcOnly.fileCount} files)`);
console.log(`Total Project (including node_modules + .next build): ${(totalAll.size / (1024 * 1024)).toFixed(2)} MB (${totalAll.fileCount} files)`);
