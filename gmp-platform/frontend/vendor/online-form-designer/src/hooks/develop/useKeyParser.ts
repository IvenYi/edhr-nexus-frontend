import { unref, ref, watch, isRef, Ref } from 'vue';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useBranch } from '/@/hooks/develop/useBranch';
import { ProjectName } from '@gct/runtime';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';

enum SourceTypeEnum {
  SELF_BUILT = 'SELF_BUILT',
  IMPORT = 'IMPORT',
}

/**
 * key值转换器
 * @param prefix 前缀
 * @param suffix 后缀 仅空字符串代表不需要后缀
 * @returns
 */
export function useKeyParser(prefix, suffix?: Ref<string | undefined> | string) {
  const hasDollar = ref<boolean>(false);
  const upperCase = ref<boolean>(false);
  const keyPrefix = ref<string>('');
  const keySuffix = ref<string>('');

  const { appInfo } = useAppInfoStore();
  const { branchId } = useBranch();
  const { getCurrentProject } = usePermissionStoreWithOut();

  function keyReset() {
    const prefixString = unref(prefix);
    const suffixString = unref(suffix);
    console.log('prefixString', prefixString);
    console.log('suffixString', suffixString);
    if (!prefixString) return;
    hasDollar.value = prefixString.startsWith('$');
    upperCase.value = /\$?[A-Z]+_/.test(prefixString);

    keyPrefix.value =
      (hasDollar.value ? '$' : '') +
      (appInfo.sourceType === SourceTypeEnum.IMPORT ? (upperCase.value ? 'I' : 'i') : '') +
      (hasDollar.value ? prefixString.substring(1) : prefixString) +
      (prefixString.endsWith('_') ? '' : '_');

    keySuffix.value =
      suffixString === ''
        ? ''
        : getCurrentProject === ProjectName.WEB_RENDER
        ? ''
        : unref(branchId)
        ? '_' + (upperCase.value ? unref(branchId)?.toUpperCase() : unref(branchId))
        : '';
  }
  keyReset();
  if (isRef(prefix)) {
    // 如果是响应式数据 监听变化
    watch(prefix, () => {
      console.log('prefixString', 'watch');
      keyReset();
    });
  }
  if (isRef(suffix)) {
    // 如果是响应式数据 监听变化
    watch(suffix, () => {
      console.log('suffixString', 'watch');
      keyReset();
    });
  }

  /**
   * 补全key信息 包含 导入信息 模块信息 分支信息
   * @param key
   * @returns
   */
  function keyPad(key: string) {
    if (!key) return;
    return `${keyPrefix.value}${key}${keySuffix.value}`;
  }

  /**
   * 裁剪key
   * @param key
   */
  function keyClip(formKey: string) {
    const id = unref(prefix).match(/\$?(([a-zA-Z]+_)*[a-zA-Z]+)_?/)[1];
    const prefixPos = formKey.indexOf(id) + id.length;
    const suffixPos =
      !keySuffix.value || unref(suffix) === '' ? formKey.length : formKey.lastIndexOf('_');
    keyPrefix.value = formKey.substring(0, prefixPos + 1);
    keySuffix.value = formKey.substring(suffixPos);
    return formKey.substring(prefixPos + 1, suffixPos);
  }

  function keyPreClip(formKey: string) {
    const id = unref(prefix).match(/\$?(([a-zA-Z]+_)*[a-zA-Z]+)_?/)[1];
    const prefixPos = formKey.indexOf(id) + id.length;
    // const suffixPos = unref(suffix) === '' ? formKey.length : formKey.lastIndexOf('_');
    keyPrefix.value = formKey.substring(0, prefixPos + 1);
    // keySuffix.value = formKey.substring(suffixPos);
    return formKey.substring(prefixPos + 1);
  }

  function keyPrePad(key: string) {
    if (!key) return;
    return `${keyPrefix.value}${key}`;
  }

  return {
    keyPrefix,
    keySuffix,
    keyReset,
    keyPad,
    keyClip,
    keyPrePad,
    keyPreClip,
  };
}
