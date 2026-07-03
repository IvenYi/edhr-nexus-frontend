// remove-crossorigin-plugin.js
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default function removeCrossoriginPlugin(options = {}) {
  const {
    include = /\.html$/,
    exclude,
    verbose = false
  } = options;

  return {
    name: 'remove-crossorigin',
    apply: 'build',
    
    writeBundle(outputOptions, bundle) {
      const files = Object.keys(bundle);
      const htmlFiles = files.filter(file => {
        if (!include.test(file)) return false;
        if (exclude && exclude.test(file)) return false;
        return true;
      });

      if (htmlFiles.length === 0 && verbose) {
        console.log('remove-crossorigin-plugin: No HTML files found to process');
        return;
      }

      const outputDir = outputOptions.dir || outputOptions.file && resolve(outputOptions.file, '..');
      
      htmlFiles.forEach(file => {
        try {
          const filePath = resolve(outputDir, file);
          let content = readFileSync(filePath, 'utf-8');
          
          // 移除script标签中的crossorigin属性
          const originalContent = content;
          content = content.replace(
            /(<script\b[^>]*)\s+crossorigin(\s*=\s*(['"])(.*?)\3)?([^>]*>)/gi, 
            '$1$5'
          );
          
          if (content !== originalContent) {
            writeFileSync(filePath, content, 'utf-8');
            if (verbose) {
              console.log(`remove-crossorigin-plugin: Removed crossorigin from scripts in ${file}`);
            }
          }
        } catch (error) {
          console.error(`remove-crossorigin-plugin: Error processing ${file}:`, error.message);
        }
      });

      if (verbose && htmlFiles.length > 0) {
        console.log(`remove-crossorigin-plugin: Processed ${htmlFiles.length} HTML file(s)`);
      }
    }
  };
}