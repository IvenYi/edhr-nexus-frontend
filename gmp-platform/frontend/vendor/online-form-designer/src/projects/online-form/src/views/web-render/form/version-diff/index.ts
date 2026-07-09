import VersionDiffIndex from './index/version-diff-index.vue';

/**
 * 打开版本对比
 * @export
 * @param id 表单模板的父的id
 */
export function openVersionDiff(id: string) {
  gct.openUtil.fullScreen(VersionDiffIndex, { id });
}
