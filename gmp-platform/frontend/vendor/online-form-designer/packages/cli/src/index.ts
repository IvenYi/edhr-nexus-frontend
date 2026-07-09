import { program } from 'commander';
import { CommandLoader } from './commands';
import { loadLocalBinCommandLoader, localBinExists } from './utils';

export function bootstrap(): void {
  // 监控 ctrl + c 停止进程，触发 exit 事件
  process.on('SIGINT', () => {
    process.exit();
  });
  // 初始化命令行
  program
    .version(
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      require('../package.json').version,
      '-v, --version',
      '查看当前版本',
    )
    .usage('<command> [options]')
    .helpOption('-h, --help', '获取帮助信息')
    .configureOutput({
      // Visibly override write routines as example!
      writeErr: str => process.stdout.write(`[ERR] ${str}`),
      // Highlight errors in color.
      outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
    });

  if (localBinExists()) {
    const localCommandLoader = loadLocalBinCommandLoader();
    localCommandLoader.load(program);
  } else {
    CommandLoader.load(program);
  }
  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}
