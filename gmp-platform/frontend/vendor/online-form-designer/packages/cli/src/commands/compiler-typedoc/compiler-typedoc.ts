import { Command } from 'commander';
import fs from 'fs-extra';
import * as rimraf from 'rimraf';
import { ICommand } from '../../interface';
import { CompilerCommand } from '../compiler-script-types/compiler-script-types';

/**
 * 编译脚本文档项目
 *
 * @export
 * @class CompilerTypedocCommand
 * @implements {ICommand}
 */
export class CompilerTypedocCommand implements ICommand {
  compilerType = new CompilerCommand();

  out = 'public/doc-temp';

  load(program: Command): void {
    program
      .command('compiler-typedoc')
      .description('编译脚本文档项目')
      .action(this.action.bind(this));
  }

  async action(): Promise<void> {
    // 输出目录存在的情况下删除旧目录
    if (fs.existsSync(this.out)) {
      rimraf.sync(this.out);
    }
    // 创建输出目录
    fs.mkdirSync(this.out);

    // 编译基础通用类型接口
    this.compilerType.action({
      glob: [
        'packages/runtime/src/interface/backend-script/base-type.ts',
        'packages/runtime/src/interface/backend-script/model-service/**/*.ts',
        'packages/runtime/src/interface/backend-script/i-query-params.ts',
        'packages/runtime/src/interface/backend-script/i-sort-item.ts',
      ].join(','),
      outField: 'public/doc-temp/基础.d.ts',
    });
    // 编译服务端脚本类型
    this.compilerType.action({
      glob: ['packages/runtime/src/interface/backend-script/**/*.ts'].join(','),
      outField: 'public/doc-temp/服务端.d.ts',
      exclude: [
        'packages/runtime/src/interface/backend-script/base-type.ts',
        'packages/runtime/src/interface/backend-script/model-service/**/*.ts',
        'packages/runtime/src/interface/backend-script/i-query-params.ts',
        'packages/runtime/src/interface/backend-script/i-sort-item.ts',
      ].join(','),
    });
    // 前端脚本基础类型
    this.compilerType.action({
      glob: ['packages/runtime/src/interface/script/**/*.ts'].join(','),
      outField: 'public/doc-temp/前端基础.d.ts',
      exclude: [
        'packages/runtime/src/interface/script/context/pc-ctx.ts',
        'packages/runtime/src/interface/script/context/mobile-ctx.ts',
      ].join(','),
    });
    // 网页端组件
    this.compilerType.action({
      glob: ['src/projects/page-designer/src/interface/web/**/*.ts'].join(','),
      outField: 'public/doc-temp/网页端组件.d.ts',
    });
    // 移动端组件
    this.compilerType.action({
      glob: ['src/projects/page-designer/src/interface/mobile/**/*.ts'].join(','),
      outField: 'public/doc-temp/移动端组件.d.ts',
    });
    // MedPro套件
    this.compilerType.action({
      glob: ['src/projects/page-designer/src/interface/_kit/med-pro/**/*.ts'].join(','),
      outField: 'public/doc-temp/MedPro套件.d.ts',
    });
  }
}
