import { inject, provide, ref, reactive, nextTick } from 'vue';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
import { pick } from 'lodash-es';

export const useAsyncFileAttrs = () => {
  const attrObj = ref<{
    /** 单个文件大小 */
    maxSize?: number;
    /** 最大上传数量 */
    maxCount?: number;
    /** 支持的格式数组 */
    accept?: string[];
    /** 支持的格式 */
    acceptStr?: string;
    /** 最大字符显示个数 */
    maxTagTextLength?: number;
  }>({});

  /** 获取附件、图片的的专属配置项信息 */
  async function getFileAttrs({ modelKey, fieldKey }) {
    const fieldInfo = await FieldSchema.getConfigByField(
     modelKey,
     fieldKey,
    );

    if (fieldInfo && fieldInfo.specificConfig) {
      const attrsMap: any =
        pick(fieldInfo.specificConfig, ['maxNumber', 'fileSize', 'fileTypes']) ?? {};
      const _accept = attrsMap.fileTypes ?? [];
      // const allAccepts = [] as string[];
      // _accept.forEach((ext: string) => {
      //   // 添加原始扩展名
      //   allAccepts.push(ext);

      //   // 如果是小写，添加大写版本
      //   if (ext === ext.toLowerCase()) {
      //     allAccepts.push(ext.toUpperCase());
      //   }

      //   // 如果是大写，添加小写版本
      //   if (ext === ext.toUpperCase()) {
      //     allAccepts.push(ext.toLowerCase());
      //   }
      // });
      // // 去重
      // const uniqueAccepts = [...new Set(allAccepts)];
      attrObj.value = {
        // 单个文件大小
        maxSize: attrsMap.fileSize,
        // 最大上传数量
        maxCount: attrsMap.maxNumber,
        // 支持的格式数组
        accept: _accept,
        acceptStr: Array.isArray(_accept) && _accept.length !== 0 ? _accept.join('、') : '',
      };
    }
  }

  /** 获取部门多选、枚举多选、范围人员，模型多选最大字符显示个数 */
  async function getmaxTagLength({ modelKey, fieldKey }) {
    const fieldInfo = await FieldSchema.getConfigByField(
     modelKey,
     fieldKey,
    );

    if (fieldInfo && fieldInfo.specificConfig) {
      const attrsMap: any = pick(fieldInfo.specificConfig, ['codeVisibleNum']) ?? {};

      attrObj.value = {
        maxTagTextLength: attrsMap.codeVisibleNum || 12,
      };
    }
  }

  return { getFileAttrs, attrObj, getmaxTagLength };
};
