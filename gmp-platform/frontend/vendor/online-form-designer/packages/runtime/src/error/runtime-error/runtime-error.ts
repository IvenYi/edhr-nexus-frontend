/**
 * 运行时异常
 *
 * @author lxm
 * @date 2022-09-21 18:09:09
 * @export
 * @class RuntimeError
 * @implements {Error}
 */
export class RuntimeError extends Error {
  name = 'Runtime Error';

  constructor(public message: string) {
    super(message);
  }
}
