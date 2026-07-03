import { existsSync } from 'fs-extra';
import { join, posix } from 'path';
import { CommandLoader } from '../../commands/index';

const localBinPathSegments = [process.cwd(), 'node_modules', '@nestjs', 'cli'];

export function localBinExists() {
  return existsSync(join(...localBinPathSegments));
}

export function loadLocalBinCommandLoader(): typeof CommandLoader {
  const path = posix.join(...localBinPathSegments, 'commands');
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  const commandsFile = require(path);
  return commandsFile.CommandLoader;
}
