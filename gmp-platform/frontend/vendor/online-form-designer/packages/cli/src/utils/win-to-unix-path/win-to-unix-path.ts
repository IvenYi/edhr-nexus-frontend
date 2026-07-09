/**
 * windows路径转unix路径
 *
 * @author zhanghanrui
 * @date 2024-10-16 17:10:36
 * @export
 * @param {string} path
 * @return {*}  {string}
 */
export function windowsPathToUnix(path: string): string {
  return path.replace(/\\/g, '/');
}
