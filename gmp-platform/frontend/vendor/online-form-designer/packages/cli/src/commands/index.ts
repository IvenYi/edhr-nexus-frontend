import { consola } from 'consola';
import { Command } from 'commander';

import { CompilerCommand } from './compiler-script-types/compiler-script-types';
import { CompilerTypedocCommand } from './compiler-typedoc/compiler-typedoc';
import { ScanDepCommand } from './scan-dep/scan-dep';

export class CommandLoader {
  public static load(program: Command): void {
    new CompilerCommand().load(program);
    new CompilerTypedocCommand().load(program);
    new ScanDepCommand().load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on('command:*', () => {
      consola.error(`未支持的命令: `, program.args.join(' '));
      consola.log(`请使用 --help 查看已支持的命令.\n`);
      process.exit(1);
    });
  }
}
