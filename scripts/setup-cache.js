const fs = require('fs');
const path = require('path');
const os = require('os');

const projectDir = path.resolve(__dirname, '..');
const dotNextPath = path.join(projectDir, '.next');
const cacheBaseDir = path.join(os.homedir(), '.cache', 'nextjs', 'urva-portfolio');

function setupCache() {
  try {
    // If .next is a symlink, remove link to recreate as directory
    try {
      if (fs.lstatSync(dotNextPath).isSymbolicLink()) {
        fs.unlinkSync(dotNextPath);
      }
    } catch (e) {}

    // Ensure .next exists as a real directory in project root
    if (!fs.existsSync(dotNextPath)) {
      fs.mkdirSync(dotNextPath, { recursive: true });
    }

    // Ensure .next/dev is NOT a symlink (must be real dir so Node require finds node_modules)
    const dotNextDev = path.join(dotNextPath, 'dev');
    try {
      if (fs.lstatSync(dotNextDev).isSymbolicLink()) {
        fs.unlinkSync(dotNextDev);
      }
    } catch (e) {}

    // Target fast compiler cache on local ext4 drive (~/.cache)
    const targetCache = path.join(cacheBaseDir, 'cache');
    fs.mkdirSync(targetCache, { recursive: true });

    // Symlink ONLY .next/cache -> ~/.cache/nextjs/urva-portfolio/cache
    linkSubdir(path.join(dotNextPath, 'cache'), targetCache);

  } catch (err) {
    console.warn('[cache-setup] Warning setting up cache link:', err.message);
  }
}

function linkSubdir(linkPath, targetPath) {
  let isSym = false;
  try {
    isSym = fs.lstatSync(linkPath).isSymbolicLink();
  } catch (e) {}

  if (!isSym) {
    if (fs.existsSync(linkPath)) {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
    fs.symlinkSync(targetPath, linkPath, 'dir');
  }
}

setupCache();
