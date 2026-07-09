import { Command } from 'commander';

/**
 * 命令项
 *
 * @author chitanda
 * @date 2021-12-18 15:12:13
 * @export
 * @interface ICommand
 */
export interface ICommand {
  /**
   * 加载命令
   *
   * @author chitanda
   * @date 2021-12-18 15:12:22
   * @param {Command} program
   */
  load(program: Command): void;
  /**
   * 执行行为
   *
   * @author chitanda
   * @date 2021-12-21 16:12:22
   * @param {...unknown[]} args
   * @return {*}  {(void | Promise<void>)}
   */
  action(...args: unknown[]): void | Promise<void>;
}
