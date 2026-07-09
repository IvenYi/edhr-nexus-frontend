import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

const IconFontMap = [
  {
    prefix: 'iconfont',
    url: 'http://at.alicdn.com/t/c/font_4079345_8kkxunp2n7t.css',
    outputDir: 'public/iconfont',
    /** 同步的地址，如移动端 */
    copyDirs: ['packages/mobile/public/iconfont'],
  },
  {
    prefix: 'gct-iconfont',
    url: 'http://at.alicdn.com/t/c/font_4961794_cu9jb7s9ls.css',
    outputDir: 'public/gct-iconfont',
    /** 同步的地址，如移动端 */
    copyDirs: ['packages/mobile/public/gct-iconfont'],
  },
];

// 复制目录内容到另一个目录
async function copyDir(srcDir, destDir) {
  try {
    // 确保目标目录存在
    await fs.mkdir(destDir, { recursive: true });
    // 使用原生 fs.cp 方法复制目录
    await fs.cp(srcDir, destDir, { recursive: true, force: true });
    console.log(`复制目录成功 ${srcDir} 到 ${destDir}`);
  } catch (error) {
    console.error(`复制目录失败 ${srcDir} 到 ${destDir}:`, error);
    throw error;
  }
}

/**
 * 确保指定目录存在并清空
 * @param dir
 */
async function ensureAndEmptyDir(dir) {
  try {
    // 创建目录（如果不存在的话）
    await fs.mkdir(dir, { recursive: true });
    // 删除目录及其所有内容（如果有的话）
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.error(`ensureAndEmptyDir 失败 ${dir}:`, error);
    throw error;
  }
}

async function downloadCssAndFonts(params) {
  const { prefix, url: cssUrl, outputDir, copyDirs } = params;
  await ensureAndEmptyDir(outputDir);

  const timestamp = Date.now();

  console.log('下载 CSS...');
  let cssContent = (await axios.get(cssUrl)).data;

  // 写入关联的字体文件
  const urlMatches = [...cssContent.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map((m) => m[1]);
  console.log(`发现 ${urlMatches.length} 个字体文件`);

  for (const url of urlMatches) {
    const fullUrl = url.startsWith('//') ? 'https:' + url : url;
    const ext = path.extname(new URL(fullUrl).pathname);
    const filename = `iconfont${ext}`;
    const filePath = path.join(outputDir, filename);

    try {
      const fontRes = await axios.get(fullUrl, { responseType: 'arraybuffer' });
      fs.ensureFileSync(filePath);
      await fs.writeFile(filePath, fontRes.data);
      console.log(`已下载字体文件：${filename}`);

      // 把 css 中的 url 替换成本地路径 + 时间戳查询参数
      const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`url\\(['"]?${escapedUrl}['"]?\\)`, 'g');
      cssContent = cssContent.replace(regex, `url('./${filename}?t=${timestamp}')`);
    } catch (err) {
      console.error(`下载失败：${fullUrl}`, err.message);
    }
  }

  // 写入css文件
  // 替换函数，在匹配到的选择器前面添加前缀
  cssContent = cssContent.replace(/\.icon-([a-zA-Z0-9_-]+):before/g, (match) => {
    return `.${prefix}${match}`;
  });

  fs.ensureFileSync(path.join(outputDir, 'iconfont.css'));
  await fs.writeFile(path.join(outputDir, 'iconfont.css'), cssContent);
  console.log('已保存修改后的 CSS 文件 iconfont.css');

  // 同步复制到其他目录（如移动端目录）
  if (copyDirs.length) {
    await Promise.all(copyDirs.map((dir) => copyDir(outputDir, dir)));
  }
}

// 执行下载逻辑
IconFontMap.forEach((item) => {
  downloadCssAndFonts(item).catch(console.error);
});
