import { Command } from 'commander';
import * as fs from 'fs-extra';
import { globSync } from 'fast-glob';
import * as rm from 'rimraf';
import * as path from 'path';
import { Project, ts } from 'ts-morph';
import consola from 'consola';
import colors from 'picocolors';
import { ICommand } from '../../interface';
import { windowsPathToUnix } from '../../utils';

/**
 * 编译参数
 *
 * @export
 * @interface CompilerCommandOptions
 */
export interface CompilerCommandOptions {
  /**
   * 匹配规则
   *
   * @author zhanghanrui
   * @date 2024-10-17 10:10:40
   * @type {string}
   */
  glob?: string;
  /**
   * 输出文件
   *
   * @author zhanghanrui
   * @date 2024-10-17 10:10:46
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

/**
 * 编译指定ts文件至一个d.ts文件
 *
 * @export
 * @class CompilerCommand
 * @implements {ICommand}
 */
export class CompilerCommand implements ICommand {
  load(program: Command): void {
    program
      .command('compiler')
      .description('编译指定ts文件至一个d.ts文件')
      .option('-g, --glob <glob-rules>', '文件匹配规则，多个规则使用逗号分割')
      .option('-o, --outField <output-field>', '输出文件, 默认输出: script-types.ts')
      .option('--exclude <exclude-field>', '需要排除的文件，支持 glob 规则，多个使用逗号分割')
      .action(this.action.bind(this));
  }

  async action(options: CompilerCommandOptions): Promise<void> {
    const { glob, outField, exclude } = options;
    if (!glob) {
      throw new Error('请输入文件匹配规则');
    }
    if (!outField) {
      throw new Error('请指定输出文件');
    }
    const cwd = process.cwd();
    // 输出文件
    const outputField = path.resolve(cwd, outField);
    // 删除旧输出文件
    if (fs.existsSync(outputField)) {
      rm.sync(outputField);
    }
    // 匹配规则
    const pattern: string[] = [];
    glob.split(',').forEach((item) => {
      pattern.push(windowsPathToUnix(item).replaceAll("'", ''));
    });
    pattern.forEach((item) => {
      consola.info(`${colors.cyan('扫描目录：')}${item}`);
    });
    consola.info(`${colors.blue('共扫描目录：')}${pattern.length}`);
    // 所有符合匹配的文件
    const paths = globSync(pattern, {
      cwd,
      ignore: exclude ? exclude.split(',').map((_) => _.replaceAll("'", '')) : [],
    });
    paths.forEach((item) => {
      consola.info(`${colors.magenta('匹配文件：')}${item}`);
    });
    consola.info(`${colors.blue('共匹配文件：')}${paths.length}`);
    // ast 项目
    const project = new Project({
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true,
        esModuleInterop: true,
        emitDeclarationOnly: true,
        declaration: true,
      },
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    });
    // 最终输出内容
    const contents: string[] = [];
    // 将所有 path 加入到 ast 项目
    project.addSourceFilesAtPaths(paths);
    // 遍历所有文件并进行处理
    const files = project.getSourceFiles();
    files.forEach((file) => {
      // 删除所有导入
      file.getImportDeclarations().forEach((imp) => {
        imp.remove();
      });
      // 删除所有纯导出
      file.getExportDeclarations().forEach((exp) => {
        exp.remove();
      });
      // 所有函数声明都换成 declare
      file.getInterfaces().forEach((i) => {
        i.toggleModifier('declare', true);
        i.toggleModifier('export', false);
      });
      file.getTypeAliases().forEach((i) => {
        i.toggleModifier('declare', true);
        i.toggleModifier('export', false);
      });
      const text = file.getFullText();
      contents.push(text);
    });
    // 合成所有内容
    const content = contents.join('\n');
    // 旧文件存在先删除
    if (fs.existsSync(outputField)) {
      fs.removeSync(outputField);
    }
    fs.writeFileSync(outputField, content);
    consola.success(`${colors.green('编译完成 => ')}${outputField}`);
  }
}
