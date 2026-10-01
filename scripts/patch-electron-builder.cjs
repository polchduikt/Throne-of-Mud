const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/app-builder-lib/out/util/electronGet.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  const faulty = 'await fs.rename(tmpDir, dir);';
  const fixed = 'try { await fs.rename(tmpDir, dir); } catch (e) { await fs.cp(tmpDir, dir, { recursive: true }); await fs.rm(tmpDir, { recursive: true, force: true }); }';

  if (content.includes(faulty)) {
    content = content.replace(faulty, fixed);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[postinstall] Successfully patched app-builder-lib Windows directory rename issue.');
  }
}
