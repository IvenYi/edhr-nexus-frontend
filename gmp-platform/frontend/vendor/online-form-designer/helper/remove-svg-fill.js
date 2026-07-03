/**
 * 手动去除目录下svg fill 自动替换源文件
 */
const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
// 使用示例
const options = {
  recursive: true,
  extensions: ['svg'],
  excludeHidden: true,
};

listFiles('./src/assets/icons/medicalCare', options)
  .then((files) => {
    files.forEach(processSVGFile);
  })
  .catch(console.error);

async function listFiles(dirPath, options = {}) {
  const { recursive = true, extensions = [], excludeHidden = true } = options;
  try {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      // 跳过隐藏文件/目录
      if (excludeHidden && entry.name.startsWith('.')) continue;
      if (entry.isDirectory() && recursive) {
        results.push(...(await listFiles(fullPath, options)));
      } else if (entry.isFile()) {
        if (extensions.length === 0 || extensions.includes(path.extname(fullPath).slice(1))) {
          results.push(fullPath);
        }
      }
    }
    return results;
  } catch (error) {
    console.error(`扫描失败: ${dirPath}`, error);
    return [];
  }
}

// 处理单个 SVG 文件
function processSVGFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { xmlMode: true });
    // 移除所有元素的 fill 属性
    $('*').removeAttr('fill');
    const modifiedContent = $.xml();
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`已处理: ${filePath}`);
  } catch (error) {
    console.error(`处理失败 ${filePath}: ${error.message}`);
  }
}
