import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

async function main() {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();

    console.log('Packaging MensFlow codebase...');

    // 1. Add directories
    const srcPath = path.join(rootDir, 'src');
    if (fs.existsSync(srcPath)) {
      console.log('Adding src directory...');
      zip.addLocalFolder(srcPath, 'src');
    }

    const publicPath = path.join(rootDir, 'public');
    if (fs.existsSync(publicPath)) {
      console.log('Adding public directory (excluding existing zip exports)...');
      // Look at children inside public, but don't add nested .zip files
      const publicFiles = fs.readdirSync(publicPath);
      for (const file of publicFiles) {
        if (!file.endsWith('.zip')) {
          const fullPath = path.join(publicPath, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            zip.addLocalFolder(fullPath, path.join('public', file));
          } else {
            zip.addLocalFile(fullPath, 'public');
          }
        }
      }
    }

    // 2. Add top level workspace files
    const topLevelFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      '.env.example',
      '.gitignore',
      'metadata.json',
      'MensFlow_Consolidated_Code.txt'
    ];

    for (const file of topLevelFiles) {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Adding ${file}...`);
        zip.addLocalFile(filePath);
      }
    }

    // 3. Write ZIP outputs
    const outputDir = path.join(rootDir, 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const zipPublicPath = path.join(outputDir, 'MensFlow_Codebase.zip');
    const zipRootPath = path.join(rootDir, 'MensFlow_Codebase.zip');

    console.log('Writing zip files...');
    zip.writeZip(zipPublicPath);
    zip.writeZip(zipRootPath);

    console.log(`Successfully created ZIP archive:`);
    console.log(`  - Public Downloadable Path: ${zipPublicPath}`);
    console.log(`  - Root Workspace Path: ${zipRootPath}`);
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    process.exit(1);
  }
}

main();
