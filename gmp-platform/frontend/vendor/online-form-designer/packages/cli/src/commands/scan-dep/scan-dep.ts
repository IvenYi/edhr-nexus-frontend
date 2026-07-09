import { Command } from 'commander';
import * as fs from 'fs-extra';
import { globSync } from 'fast-glob';
import * as rm from 'rimraf';
import * as path from 'path';
import { Project } from 'ts-morph';
import consola from 'consola';
import colors from 'picocolors';
import os from 'os';
import * as compiler from '@vue/compiler-sfc';
import { ICommand } from '../../interface';
import { windowsPathToUnix } from '../../utils';
import { getAlias } from './util';

/**
 * 编译参数
 *
 * @export
 * @interface ScanDepCommandOptions
 */
export interface ScanDepCommandOptions {
  /**
   * 匹配规则
   *
   * @type {string}
   */
  glob: string;
  /**
   * 输出文件
   *
   * @type {string}
   */
  outField?: string;
  /**
   * 排除的文件
   *
   * @type {string}
   */
  exclude?: string;
}

const ignorePkg: string[] = [
  'vue',
  '@gct/runtime',
  'monaco-editor',
  'lodash-es',
  'ant-design-vue',
  '@ant-design/icons-vue',
  '@gct/flow',
  'esprima-next',
  'estraverse',
  'escodegen',
  'typescript',
  'pinia',
  'dayjs',
  'qs',
  'qx-util',
  'crypto-js',
  '@vben/types',
  '@vben/hooks',
  '@vueuse/core',
  '@vueuse/shared',
  '@purge-icons/generated',
  '@icon-park/vue-next',
  '@fingerprintjs/fingerprintjs',
  'resize-observer-polyfill',
  'mqtt',
  'axios',
  '@jsplumb/browser-ui',
  'moment',
  'path-to-regexp',
  'sortablejs',
  '@antv/x6',
  '@antv/x6-plugin-dnd',
  '@antv/x6-plugin-minimap',
  '@antv/x6-plugin-selection',
  '@antv/x6-plugin-transform',
  // 疑似移动端包
  'semver',
  'vant',
  'dsbridge',
];

const ignorePkgReg = [/.(less|scss|svg|gif|jpg|png|json)$/];

const ignoreFolder = ['src/projects/online-form'];

/**
 * 扫描分析指定目录下的依赖，目前只处理 ts、tsx 文件
 *
 * @export
 * @class ScanDepCommand
 * @implements {ICommand}
 */
export class ScanDepCommand implements ICommand {
  globs: string[] = [];

  alias = getAlias(process.cwd());

  tempPath = path.resolve(process.cwd(), 'scan-temp');

  load(program: Command): void {
    program
      .command('scan-dep')
      .description('编译脚本文档项目')
      .option('-g, --glob <glob-rules>', '文件匹配规则，多个规则使用逗号分割')
      .option('-o, --outField <output-field>', '输出文件, 默认输出: scan-dep.json')
      .option('--exclude <exclude-field>', '需要排除的文件，支持 glob 规则，多个使用逗号分割')
      .action(this.action.bind(this));
  }

  async action(opts: ScanDepCommandOptions): Promise<void> {
    // 开启最全日志
    consola.level = 5;
    const { glob, outField, exclude } = opts;
    if (!glob) {
      throw new Error('请输入文件匹配规则');
    }
    const cwd = process.cwd();
    const out = outField || 'scan-dep.json';
    // 匹配规则
    const pattern: string[] = [];
    this.globs = glob.split(',').map((_) => {
      return path.resolve(process.cwd(), _);
    });
    // 分割 cli 中提取的 glob 规则
    this.globs.forEach((item) => {
      pattern.push(`${windowsPathToUnix(item).replaceAll("'", '')}/**/*.@(ts|tsx|vue)`);
    });
    //基于 glob 规则匹配文件
    const files = globSync(pattern, {
      ignore: exclude?.split(','),
    });
    if (files.length === 0) {
      consola.error(colors.red('未找到匹配的文件'));
      return;
    }
    rm.sync(this.tempPath);
    // 临时输出目录不存在则创建
    fs.ensureDirSync(this.tempPath);
    // 依赖集合
    consola.start(colors.blue('开始递归扫描'));
    const deps: Set<string> = await this.deepScanDep(files);
    // 依赖排序，并截去 cwd 目录
    const arr = Array.from(deps)
      .sort()
      .filter((dep) => {
        return !ignoreFolder.some((_) => dep.startsWith(path.resolve(cwd, _)));
      })
      .map((dep) => {
        if (dep.startsWith(cwd)) {
          return dep.replace(`${cwd}/`, '');
        }
        return dep;
      });
    // 输出到文件
    fs.writeFileSync(out, JSON.stringify(arr, null, 2), { encoding: 'utf-8' });
    consola.success(colors.green(`扫描完成，共找到 ${arr.length} 个依赖文件`));
    consola.start(colors.blue('开始写入临时目录'));
    arr.forEach((pathStr, i) => {
      const outFilePath = path.resolve(this.tempPath, pathStr);
      // 输出目录不存在则创建
      const folder = path.dirname(outFilePath);
      fs.ensureDirSync(folder);
      consola.debug(colors.gray(`写入文件(${i + 1}): ${outFilePath}`));
      fs.symlinkSync(path.resolve(cwd, pathStr), outFilePath);
    });
    consola.success(colors.green('写入完成'));
  }

  /**
   * 递归扫描依赖
   *
   * @param {string[]} filePaths
   * @param {Set<string>} [deps=new Set()]
   * @returns {*}  {Set<string>}
   */
  async deepScanDep(filePaths: string[], deps: Set<string> = new Set()): Promise<Set<string>> {
    // 建立 ts ast 项目
    const project = new Project();
    // 添加扫描出的文件，目前处理 ts、tsx 文件
    const sourceFiles = project.addSourceFilesAtPaths(
      filePaths.filter((val) => {
        return val.endsWith('.ts') || val.endsWith('.tsx');
      }),
    );
    // 过滤 vue 文件清单
    const vueFilePaths = filePaths.filter((val) => val.endsWith('.vue'));
    // consola.info(colors.yellow(`扫描到 ${vueFilePaths.length} 个 vue 文件`));
    // 遍历 vue 文件, 提取 script 内容，然后添加到项目中
    const all = vueFilePaths.map((val) => {
      return fs.readFile(val, { encoding: 'utf-8' }).then((content) => {
        // consola.debug(colors.yellow(`编译 vue 文件: ${val}`));
        const result = compiler.parse(content);
        const script = result.descriptor.script ?? result.descriptor.scriptSetup;
        if (script) {
          // consola.debug(colors.yellow(`编译 vue script 内容: ${val}`));
          const sourceFile = project.createSourceFile(val, script.content, { overwrite: true });
          sourceFiles.push(sourceFile);
        }
      });
    });
    // 等待 vue 文件编译完成
    await Promise.all(all);
    // 获取当前文件的依赖清单
    const sourceFileDeps: string[] = [];
    sourceFiles.forEach((sourceFile) => {
      // 获取当前文件的绝对路径
      const sourceFilePath = sourceFile.getFilePath();
      // 遍历所有的 import 声明
      sourceFile.getImportDeclarations().forEach((importDeclaration) => {
        // 获取 import 声明的模块路径
        let importPath = importDeclaration.getModuleSpecifierValue();
        // 转换 alias 定义
        {
          const item = this.alias.find((_) => {
            return _.find.test(importPath);
          });
          if (item) {
            importPath = importPath.replace(item.find, item.replacement);
          }
        }
        // 如果在忽略目录里直接跳过
        if (ignorePkg.some((pkg) => importPath.startsWith(pkg))) {
          return;
        }
        if (ignorePkgReg.some((pkgReg) => pkgReg.test(importPath))) {
          return;
        }
        // consola.debug(colors.yellow(`文件: ${sourceFilePath}，扫描到依赖：${importPath}`));
        // 如果已经是绝对路径则直接添加
        if (importPath.startsWith('/root/') && os.platform() === 'linux') {
          sourceFileDeps.push(importPath);
          return;
        }
        // 获取依赖文件的绝对路径
        const sourceFileDep = path.resolve(path.dirname(sourceFilePath), importPath);
        // consola.debug(colors.yellow(`拼接后路径: ${sourceFileDep}`));
        sourceFileDeps.push(sourceFileDep);
      });
    });
    // 遍历扫描依赖清单
    const paths = Array.from(new Set(sourceFileDeps))
      // 因为文件没有后缀，所以需要手动添加后缀，看下匹配是 .ts or .tsx or .d.ts
      .map((pathStr) => {
        if (!pathStr.endsWith('.ts') && fs.existsSync(`${pathStr}.ts`)) {
          return `${pathStr}.ts`;
        }
        if (!pathStr.endsWith('.tsx') && fs.existsSync(`${pathStr}.tsx`)) {
          return `${pathStr}.tsx`;
        }
        if (!pathStr.endsWith('.d.ts') && fs.existsSync(`${pathStr}.d.ts`)) {
          return `${pathStr}.d.ts`;
        }
        if (!pathStr.endsWith('.js') && fs.existsSync(`${pathStr}.js`)) {
          return `${pathStr}.js`;
        }
        // 如果没有后缀的情况下，去匹配 index.ts 文件看是否存在
        if (pathStr.indexOf('.') === -1) {
          // 先匹配 ts 文件
          const indexPath = path.resolve(pathStr, 'index.ts');
          if (fs.existsSync(indexPath)) {
            return indexPath;
          }
          // 再匹配 tsx 文件
          const indexTsxPath = path.resolve(pathStr, 'index.tsx');
          if (fs.existsSync(indexTsxPath)) {
            return indexTsxPath;
          }
          // 最后匹配 js 文件
          const indexJsPath = path.resolve(pathStr, 'index.js');
          if (fs.existsSync(indexJsPath)) {
            return indexJsPath;
          }
        }
        // 如果都没有匹配到则直接返回
        return pathStr;
      })
      .filter((depPath) => {
        // 忽略类型声明文件
        if (depPath.endsWith('.d.ts')) {
          return false;
        }
        // 过滤掉已经扫描过或者是本身 glob 扫描的目录
        if (deps.has(depPath) || this.globs.some((_) => depPath.startsWith(_))) {
          return false;
        }
        deps.add(depPath);
        return true;
      });
    if (paths.length > 0) {
      consola.info(colors.cyan(`扫描到 ${paths.length} 个依赖文件`));
      // paths.forEach((val) => {
      //   consola.debug(colors.yellow(`文件: ${val}`));
      // });
      await this.deepScanDep(paths, deps);
    }
    return deps;
  }
}
