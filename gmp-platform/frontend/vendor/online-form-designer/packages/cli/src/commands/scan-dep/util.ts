import * as path from 'path';

/**
 * 获取所有的映射
 *
 * @export
 * @param {string} cwd
 * @returns {*}
 */
export function getAlias(cwd: string) {
  return [
    {
      find: /^\/#\//,
      replacement: path.resolve(cwd, 'types') + '/',
    },
    {
      find: /^#\//,
      replacement: path.resolve(cwd, 'types') + '/',
    },
    {
      find: /^\/@\//,
      replacement: path.resolve(cwd, 'src') + '/',
    },
    {
      find: /^@\//,
      replacement: path.resolve(cwd, 'src') + '/',
    },
    {
      find: /^\/@portal\//,
      replacement: path.resolve(cwd, 'src') + '/projects/portal/src/',
    },
    {
      find: /^\/@developer-center\//,
      replacement: path.resolve(cwd, 'src') + '/projects/developer-center/src/',
    },
    {
      find: /^\/@backend-management\//,
      replacement: path.resolve(cwd, 'src') + '/projects/backend-management/src/',
    },
    {
      find: /^\/@tenant-center\//,
      replacement: path.resolve(cwd, 'src') + '/projects/tenant-center/src/',
    },
    {
      find: /^\/@app-designer\//,
      replacement: path.resolve(cwd, 'src') + '/projects/app-designer/src/',
    },
    {
      find: /^\/@page-designer\//,
      replacement: path.resolve(cwd, 'src') + '/projects/page-designer/src/',
    },
    {
      find: /^\/@web-render\//,
      replacement: path.resolve(cwd, 'src') + '/projects/web-render/src/',
    },
    {
      find: /^\/@tenant-center\//,
      replacement: path.resolve(cwd, 'src') + '/projects/tenant-center/src/',
    },
    {
      find: /^@mobile\//,
      replacement: path.resolve(cwd, 'packages') + '/mobile/src/',
    },
    {
      find: /^@native\//,
      replacement: path.resolve(cwd, 'packages') + '/mobile/native/',
    },
    {
      find: /^\/@online-form\//,
      replacement: path.resolve(cwd, 'src') + '/projects/online-form/src/',
    },
    {
      find: /^\/@ipaas\//,
      replacement: path.resolve(cwd, 'src') + '/projects/ipaas/src/',
    },
    {
      find: /^\/@bi-designer\//,
      replacement: path.resolve(cwd, 'src') + '/projects/bi-designer/src/',
    },
  ];
}
